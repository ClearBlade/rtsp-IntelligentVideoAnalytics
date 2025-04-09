import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import EmptyResultIcon from "./EmptyResultIcon";
import TextWithIcon from "../helpers/TextWithIcon";
import AddIcon from "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import { v4 as uuid } from "uuid";
import { Delete } from "@material-ui/icons";
import { TASK_STORE } from "./tasks/TaskStore";
import CustomTextField from "../helpers/CustomTextField";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import Mapper, { Mappings } from "./Mapper";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

interface TasksProps {
  deviceId: string;
  edgeId: string;
  image: { base64: string; timestamp: number } | null;
  tasks: Task[];
  assets: { id: string; label: string; attributes: Record<string, string> }[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskChange: (task: Task) => void;
  handleExpandAll: () => void;
  handleDeleteTask: (uuid: string) => void;
  refresh: () => void;
  isRefreshing: boolean;
}

export interface TaskComponentProps {
  deviceId: string;
  edgeId: string;
  task: Task;
  onTaskChange: (task: Task) => void;
  image?: { base64: string; timestamp: number } | null;
  refresh?: () => void;
  isRefreshing?: boolean;
}

export interface Task {
  uuid: string;
  name: string;
  id: string;
  settings: Record<string, unknown>;
  mappings: Mappings[];
  isOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(1),
  },
  label: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  emptyIcon: {
    height: theme.spacing(30),
    width: theme.spacing(30),
  },
  addComponentButton: {
    display: "flex",
    justifyContent: "flex-end",
  },
  //
  root: {
    marginTop: theme.spacing(2),
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  cardTitle: {
    marginLeft: theme.spacing(1),
    fontWeight: "bold",
  },
  cardSubTitle: {
    marginLeft: theme.spacing(2),
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
  AIChip: {
    marginLeft: theme.spacing(1),
    height: theme.spacing(2),
    fontSize: "0.6rem",
    fontWeight: "bold",
  },
}));

function TaskDetails({
  deviceId,
  edgeId,
  image,
  tasks,
  assets,
  refresh,
  isRefreshing,
  onTaskChange,
  onTaskDelete,
  onTaskDuplicate,
}: {
  deviceId: string;
  edgeId: string;
  image: { base64: string; timestamp: number } | null;
  tasks: Task[];
  assets: { id: string; label: string; attributes: Record<string, string> }[];
  onTaskChange: (task: Task) => void;
  onTaskDelete: (uuid: string) => void;
  onTaskDuplicate: (task: Task) => void;
  refresh: () => void;
  isRefreshing: boolean;
}) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleMouseEnter = (uuid) => {
    setHoveredCard(uuid);
  };

  // Remove hovered card
  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <>
      {tasks.map((task, idx) => {
        return (
          <Box
            onMouseEnter={() => handleMouseEnter(task.uuid)}
            onMouseLeave={handleMouseLeave}
            key={idx}
          >
            <TaskCard
              deviceId={deviceId}
              edgeId={edgeId}
              image={image}
              task={task}
              key={idx}
              onTaskChange={onTaskChange}
              isHovered={hoveredCard === task.uuid}
              onTaskDelete={onTaskDelete}
              onTaskDuplicate={onTaskDuplicate}
              refresh={refresh}
              isRefreshing={isRefreshing}
            />
          </Box>
        );
      })}
    </>
  );
}

function TaskCard({
  image,
  task,
  deviceId,
  edgeId,
  onTaskChange,
  isHovered,
  onTaskDelete,
  onTaskDuplicate,
  refresh,
  isRefreshing,
}: TaskComponentProps & {
  isHovered: boolean;
  onTaskDelete: (uuid: string) => void;
  onTaskDuplicate: (task: Task) => void;
}) {
  const classes = useStyles();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <Card className={classes.root}>
      <CardActions disableSpacing>
        <Box
          width={"100%"}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center">
            {/* <ErrorOutlineIcon fontSize="small" color="error" /> */}
            <Typography variant="body1" className={classes.cardTitle}>
              {task.name || "Untitled task"}
            </Typography>
            {/* <Typography variant="subtitle2" className={classes.cardSubTitle}>
              {task.uuid}
            </Typography> */}
          </Box>
          <Box>
            {(isHovered || task.isOpen) && (
              <>
                <Tooltip title="Duplicate task" arrow>
                  <IconButton onClick={() => onTaskDuplicate(task)}>
                    <FileCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete task" arrow>
                  <IconButton onClick={() => setShowDeleteConfirmation(true)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: task.isOpen,
              })}
              onClick={() => onTaskChange({ ...task, isOpen: !task.isOpen })}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>
      </CardActions>
      {showDeleteConfirmation && (
        <Dialog
          maxWidth="xs"
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          {/* <DialogTitle>Delete task</DialogTitle> */}
          <DialogContent>
            <Typography>Are you sure you want to delete this task?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => {
                onTaskDelete(task.uuid);
                setShowDeleteConfirmation(false);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* <CardContent>
        <Typography paragraph>
          Some visible content to show when the card is not expanded.
        </Typography>
      </CardContent> */}
      <Collapse in={task.isOpen} timeout="auto" unmountOnExit>
        <CardContent>
          <TaskCardContent
            deviceId={deviceId}
            edgeId={edgeId}
            image={image}
            task={task}
            onTaskChange={onTaskChange}
            refresh={refresh}
            isRefreshing={isRefreshing}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
}

export const TaskCardContent = ({
  image,
  task,
  onTaskChange,
  deviceId,
  edgeId,
  refresh,
  isRefreshing,
}: TaskComponentProps) => {
  const classes = useStyles();

  const handleMappingChange = (mappings: Mappings[]) => {
    onTaskChange({ ...task, mappings });
  };

  const getMappingStruct = () => {
    if (TASK_STORE.length === 0) return [];

    const taskDetails = TASK_STORE.find((t) => t.id === task.id);
    if (!taskDetails) return [];

    return taskDetails.device_outputs.map((o) => ({
      device_output: {
        id: o.id,
        label: o.label,
      },
      target_asset: {
        id: "",
        label: "",
      },
      target_attribute: {
        id: "",
        label: "",
      },
    }));
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"Task name*"}
            fullWidth
            variant="outlined"
            size="small"
            value={task.name || ""}
            name="name"
            placeholder="Enter name"
            onChange={(e) => {
              onTaskChange({ ...task, [e.target.name]: e.target.value });
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"Task type*"}
            placeholder="Select task type"
            select
            fullWidth
            variant="outlined"
            size="small"
            value={task.id || ""}
            name="id"
            onChange={(e) => {
              onTaskChange({
                ...task,
                [e.target.name]: e.target.value,
                settings: {},
              });
            }}
          >
            {TASK_STORE.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                <Box>
                  {/* align chip to the right and text to the left */}
                  <Box display={"flex"} alignItems="center">
                    <Typography variant="body2">{t.name}</Typography>
                    {t.ai_task && (
                      <Chip
                        className={classes.AIChip}
                        size="small"
                        label={"AI"}
                      />
                    )}
                  </Box>
                  {task.id !== t.id && (
                    <Typography variant="caption" color="textSecondary">
                      {t.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {task.id && (
          <>
            <Grid item xs={12}>
              {TASK_STORE.find((t) => t.id === task.id)?.component({
                deviceId,
                edgeId,
                image,
                task,
                onTaskChange,
                refresh,
                isRefreshing,
              })}
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Mapper
                mappings={
                  task.mappings.length === 0
                    ? getMappingStruct()
                    : task.mappings
                }
                onMappingsChange={handleMappingChange}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

function Tasks({
  deviceId,
  edgeId,
  image,
  tasks,
  assets,
  refresh,
  isRefreshing,
  setTasks,
  onTaskChange,
  handleExpandAll,
  handleDeleteTask,
}: TasksProps) {
  const classes = useStyles();

  const handleDuplicateTask = (task: Task) => {
    setTasks((prev) => {
      if (!prev) return [];
      if (!task) return prev;
      return [{ ...task, uuid: uuid(), name: `${task.name} (Copy)` }, ...prev];
    });
  };

  return (
    <Box>
      <Typography className={classes.typographyText} variant="h6" align="left">
        Tasks
      </Typography>
      <Typography
        variant="body2"
        align="left"
        color="textSecondary"
        gutterBottom
      >
        Configure tasks such as recording schedules, object detection, and other
        automated actions.
      </Typography>
      {/* align to the left */}
      <Box display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
        {tasks.length > 0 && (
          <Box>
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={() => handleExpandAll()}
              style={{ textDecoration: "none" }}
            >
              <TextWithIcon
                style={{ textTransform: "none" }}
                text={"Expand all"}
                icon={(className) => <UnfoldMoreIcon className={className} />}
              />
            </Button>
          </Box>
        )}
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => {
              handleExpandAll();
              setTasks((prev) => [
                {
                  uuid: uuid(),
                  name: "",
                  id: "",
                  settings: {},
                  isOpen: true,
                  mappings: [],
                },
                ...(prev || []),
              ]);
            }}
          >
            <TextWithIcon
              text={"TASK"}
              icon={(className) => <AddIcon className={className} />}
            />
          </Button>
        </Box>
      </Box>
      {!tasks || tasks.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          flexWrap="wrap"
          m={5}
          overflow="hidden"
        >
          <EmptyResultIcon className={classes.emptyIcon} />
          <Box>
            <Typography variant="h6" align="center" color="textSecondary">
              No tasks added.
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              Click the "Add" button to start adding tasks for this device.
            </Typography>
          </Box>
        </Box>
      ) : (
        <TaskDetails
          deviceId={deviceId}
          edgeId={edgeId}
          image={image}
          assets={assets}
          tasks={tasks}
          onTaskChange={onTaskChange}
          onTaskDelete={handleDeleteTask}
          onTaskDuplicate={handleDuplicateTask}
          refresh={refresh}
          isRefreshing={isRefreshing}
        />
      )}
    </Box>
  );
}

export default Tasks;
