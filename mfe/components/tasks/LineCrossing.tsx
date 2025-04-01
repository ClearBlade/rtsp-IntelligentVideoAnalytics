import React, { useEffect, useRef, useState } from "react";
import { Task, TaskComponentProps } from "../Tasks";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { ObjectDetectionField, SaveAs } from "./ObjectDetection";
import HelpIcon from "@material-ui/icons/Help";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import {
  Stage,
  Layer,
  Line,
  Image,
  Text,
  Rect,
  Circle,
  Arrow,
} from "react-konva";
import TextWithHelpIcon from "../../helpers/TextWithHelpIcon";
import LastRefreshTime from "../LastRefreshTime";
import RefreshIcon from "@material-ui/icons/Refresh";
import useFetchLatestFeed from "../../api/useFetchLatestFeed";

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  gridText: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  toggleButton: {
    boxShadow: "none",
    borderRadius: "0 0 0 0",
  },
  buttonGroup: {
    marginBottom: theme.spacing(2),
  },
  directionLabel: {
    marginTop: theme.spacing(1),
    fontWeight: "bold",
  },
}));

function LineCrossing({
  image,
  refresh,
  isRefreshing,
  task,
  onTaskChange,
  deviceId,
  edgeId,
}: TaskComponentProps) {
  const classes = useStyles();
  const [htmlImage, setHtmlImage] = useState<HTMLImageElement | null>(null);
  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);
  const layerRef = useRef(null);

  useEffect(() => {
    if (Object.keys(task.settings).length === 0) {
      onTaskChange({
        ...task,
        settings: {
          A_to_B: "Entered",
          B_to_A: "Exited",
          line: [],
          objects_to_detect: {},
        },
      });
    }
  }, [task, onTaskChange]);

  useEffect(() => {
    if (!image) return;
    const img = new window.Image();
    img.src = image.base64;
    img.onload = () => {
      setHtmlImage(img); // Set the loaded image
    };
  }, [image]);

  useEffect(() => {
    if (clicks.length === 2) {
      const [start, end] = clicks;
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          line: [start.x, start.y, end.x, end.y],
        },
      });
    }
  }, [clicks]);

  const handleMouseDown = (e) => {
    if (clicks.length < 2) {
      const pos = e.target.getStage().getPointerPosition();
      setClicks((prevClicks) => [...prevClicks, pos]); // Store clicked points
    }
  };

  const handleClearLine = () => {
    // console.log("points: ", task.settings?.line || []);
    setClicks([]);
    // setPoints([]);
    onTaskChange({
      ...task,
      settings: {
        ...task.settings,
        line: [],
      },
    });
  };

  const calculatePerpendicular = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const unitDx = dx / length;
    const unitDy = dy / length;

    const perpUnitDX = -unitDy;
    const perpUnitDY = unitDx;

    const point1 = {
      x: midX + perpUnitDX * 40,
      y: midY + perpUnitDY * 40,
    };
    const point2 = {
      x: midX - perpUnitDX * 40,
      y: midY - perpUnitDY * 40,
    };

    const arrowP1 = {
      x: midX + perpUnitDX * 20,
      y: midY + perpUnitDY * 20,
    };
    const arrowP2 = {
      x: midX - perpUnitDX * 20,
      y: midY - perpUnitDY * 20,
    };

    return { point1, point2, arrowP1, arrowP2 };
  };

  const calculateMidPoint = (start, end) => {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  };

  const getLabelOffsets = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const midpoint = calculateMidPoint(start, end);

    if (dx === 0) {
      // Vertical line, label A on the left, label B on the right
      return {
        labelA: { x: midpoint.x - 30, y: midpoint.y }, // 20px left of the start point
        labelB: { x: midpoint.x + 20, y: midpoint.y }, // 20px right of the end point
        arrow: [midpoint.x, midpoint.y, midpoint.x, midpoint.y],
      };
    } else if (dy === 0) {
      // Horizontal line, label A on the top, label B on the bottom
      return {
        labelA: { x: midpoint.x, y: midpoint.y - 30 }, // 20px above the start point
        labelB: { x: midpoint.x, y: midpoint.y + 20 }, // 20px below the end point
        arrow: [midpoint.x, midpoint.y, midpoint.x, midpoint.y],
      };
    } else {
      // Angled line, A on one side, B on the opposite side
      const { point1, point2, arrowP1, arrowP2 } = calculatePerpendicular(
        start,
        end
      );
      return {
        labelA: {
          x: point1.x,
          y: point1.y,
        },
        labelB: {
          x: point2.x,
          y: point2.y,
        },
        arrow: [arrowP1.x, arrowP1.y, arrowP2.x, arrowP2.y],
      };
    }
  };

  const renderArrowsAndLabels = () => {
    const points = (task.settings?.line as number[]) || [];
    if (points.length === 4) {
      if (clicks.length === 0) {
        setClicks([
          { x: points[0], y: points[1] },
          { x: points[2], y: points[3] },
        ]);
      }
      const start = { x: points[0], y: points[1] };
      const end = { x: points[2], y: points[3] };

      const { labelA, labelB, arrow } = getLabelOffsets(start, end);

      return (
        <>
          <Text
            text="A"
            x={labelA.x}
            y={labelA.y}
            fontSize={16}
            fill="black"
            fontStyle="bold"
          />

          <Text
            text="B"
            x={labelB.x}
            y={labelB.y}
            fontSize={16}
            fill="black"
            fontStyle="bold"
          />

          <Arrow
            points={
              arrow // Points for the arrow
            }
            stroke="cyan"
            pointerAtBeginning={true}
            pointerAtEnding={true}
            strokeWidth={2}
            // fill="cyan"
            pointerLength={5}
            pointerWidth={5}
            tension={0.5}
          />
        </>
      );
    }
    return null;
  };

  const handleTouchStart = (e) => {
    if (clicks.length < 2) {
      const pos = e.target.getStage().getPointerPosition();
      setClicks((prevClicks) => [...prevClicks, pos]); // Store clicked points
    }
  };

  // const handleTouchMove = (e) => {
  //   console.log("touch move");
  // };

  // const handleTouchEnd = (e) => {
  //   console.log("touch end");
  // };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Typography
          variant="body2"
          align="left"
          className={classes.typographyText}
        >
          Feed
        </Typography>
        {image && (
          <Box
            mb={1}
            display={"flex"}
            alignItems="center"
            justifyContent={"space-between"}
          >
            <LastRefreshTime image={image} />
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent={"space-between"}
            >
              <Tooltip title="Refresh feed" arrow>
                <IconButton
                  style={{
                    color: "black",
                    marginRight: "8px",
                  }}
                  onClick={refresh}
                  size="small"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" size="small" onClick={handleClearLine}>
                Clear
              </Button>
            </Box>
          </Box>
        )}
        {image && (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <Stage
              width={640}
              height={360}
              style={{
                background: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <Layer ref={layerRef}>
                <Image
                  image={htmlImage ?? undefined}
                  width={640}
                  height={360}
                />
                {isRefreshing ? (
                  <Rect
                    x={0}
                    y={0}
                    width={640}
                    height={360}
                    fill="rgba(0, 0, 0, 0.55)"
                  />
                ) : (
                  <Rect
                    x={0}
                    y={320}
                    width={640}
                    height={40}
                    fill="rgba(0, 0, 0, 0.55)"
                  />
                )}
                <Text
                  text="Click on two points in the frame to define your line."
                  x={100}
                  y={335}
                  fontSize={15}
                  fill="white"
                />
                {((task.settings?.line as number[]) || []).length >= 4 && (
                  <Line
                    points={task.settings.line as number[]} // Points for the line
                    stroke="cyan"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}

                {clicks.length >= 1 && (
                  <Circle
                    x={clicks[0].x}
                    y={clicks[0].y}
                    radius={4}
                    fill="green"
                    stroke="black"
                    strokeWidth={1}
                  />
                )}
                {clicks.length === 2 && (
                  <Circle
                    x={clicks[1].x}
                    y={clicks[1].y}
                    radius={4}
                    fill="green"
                    stroke="black"
                    strokeWidth={1}
                  />
                )}

                {(clicks.length === 2 ||
                  ((task.settings?.line as number[]) || []).length >= 4) && (
                  <>
                    {/* Render arrows and labels */}
                    {renderArrowsAndLabels()}
                  </>
                )}
              </Layer>
            </Stage>
          </div>
        )}
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <TextWithHelpIcon
          label="Direction labels*"
          helpText="Select the direction labels for the line crossing task."
        />
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <Typography variant="caption" className={classes.gridText}>
              Direction
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" className={classes.gridText}>
              Label
            </Typography>
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={2}>
            <Box display="flex" alignItems="flex-end">
              <Typography variant="body2" className={classes.directionLabel}>
                A
              </Typography>
              <ArrowForwardIcon fontSize={"small"} />
              <Typography variant="body2" className={classes.directionLabel}>
                B
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              defaultValue={"Entered"}
              value={task.settings?.A_to_B}
              name="A_to_B"
              onChange={(e) => {
                onTaskChange({
                  ...task,
                  settings: {
                    ...task.settings,
                    [e.target.name]: e.target.value,
                  },
                });
              }}
            />
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2}>
            <Box display="flex" alignItems="flex-end">
              <Typography variant="body2" className={classes.directionLabel}>
                B
              </Typography>
              <ArrowForwardIcon fontSize={"small"} />
              <Typography variant="body2" className={classes.directionLabel}>
                A
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              defaultValue={"Exited"}
              value={task.settings?.B_to_A}
              name="B_to_A"
              onChange={(e) => {
                onTaskChange({
                  ...task,
                  settings: {
                    ...task.settings,
                    [e.target.name]: e.target.value,
                  },
                });
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={8}>
        <ObjectDetectionField
          task={task}
          onTaskChange={onTaskChange}
          enableTracking={true}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant="body2"
          align="left"
          className={classes.typographyText}
        >
          Save as
        </Typography>
        <SaveAs onTaskChange={onTaskChange} task={task} />
      </Grid>
    </Grid>
  );
}

export default LineCrossing;
