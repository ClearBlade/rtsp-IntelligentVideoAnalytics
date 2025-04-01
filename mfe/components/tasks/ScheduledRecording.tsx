import {
  Box,
  Button,
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
import React, { useEffect, useState } from "react";
import { TaskComponentProps } from "../Tasks";
import { IntervalGrid } from "./ScheduledSnapshot";
import CustomTextField from "../../helpers/CustomTextField";
import HelpIcon from "@material-ui/icons/Help";
import TextWithHelpIcon from "../../helpers/TextWithHelpIcon";

export const VIDEO_QUALITY = ["Original", "Lower", "Lowest"] as const;
export const INTERVAL_UNITS = ["Seconds", "Minutes", "Hours"] as const;

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  gridText: {
    marginTop: theme.spacing(1),
  },
  toggleButton: {
    boxShadow: "none",
    borderRadius: "0 0 0 0",
  },
}));

function ScheduledRecording({ task, onTaskChange }: TaskComponentProps) {
  const classes = useStyles();
  const [recordingType, setRecordingType] = useState<"CONTINOUS" | "SCHEDULED">(
    task.settings.interval ? "SCHEDULED" : "CONTINOUS"
  );

  useEffect(() => {
    if (Object.keys(task.settings).length === 0) {
      onTaskChange({
        ...task,
        settings: {
          clip_length: 1,
          clip_length_units: INTERVAL_UNITS[1],
          video_quality: "Original",
          // start_time: new Date().toISOString(),
        },
      });
    }
  }, [task, onTaskChange]);

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Typography
          variant="body2"
          align="left"
          className={classes.typographyText}
        >
          Recording mode
        </Typography>
        <Box>
          <Button
            className={classes.toggleButton}
            variant={recordingType === "CONTINOUS" ? "contained" : "outlined"}
            size="small"
            onClick={() => setRecordingType("CONTINOUS")}
            style={{ borderRadius: "4px 0 0 4px" }}
          >
            Continuous
          </Button>
          <Button
            className={classes.toggleButton}
            variant={recordingType === "SCHEDULED" ? "contained" : "outlined"}
            size="small"
            onClick={() => setRecordingType("SCHEDULED")}
            style={{ borderRadius: "0 4px 4px 0" }}
          >
            Scheduled
          </Button>
        </Box>
      </Grid>
      {recordingType === "SCHEDULED" && (
        <>
          <IntervalGrid task={task} onTaskChange={onTaskChange} />
          <Grid style={{ paddingBottom: 0 }} item xs={12}>
            <TextWithHelpIcon
              label="Clip length"
              helpText="This sets the length of the recording. By default, this matches the selected interval length."
            />
          </Grid>

          <Grid item xs={2} style={{ paddingRight: 0 }}>
            <TextField
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={task.settings?.clip_length || 30}
              name="clip_length"
              onChange={(e) => {
                onTaskChange({
                  ...task,
                  settings: {
                    ...task.settings,
                    [e.target.name]: parseInt(e.target.value),
                  },
                });
              }}
            />
          </Grid>
          <Grid item md={3} xs={4}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              // label={"Units"}
              value={task.settings?.clip_length_units || INTERVAL_UNITS[0]}
              name="clip_length_units"
              onChange={(e) => {
                onTaskChange({
                  ...task,
                  settings: {
                    ...task.settings,
                    [e.target.name]: e.target.value,
                  },
                });
              }}
            >
              {INTERVAL_UNITS.map((t) => (
                <MenuItem key={t} value={t}>
                  <Typography variant="body2">{t}</Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      )}
      {recordingType === "CONTINOUS" && (
        <Grid item xs={12}>
          <Typography variant="body2">
            Video will be recorded continuously and saved in 1-hour segments.
          </Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <CustomTextField
          label={"Video quality"}
          select
          style={{ width: "30%" }}
          variant="outlined"
          size="small"
          value={task.settings?.video_quality || VIDEO_QUALITY[0]}
          name="video_quality"
          onChange={(e) => {
            onTaskChange({
              ...task,
              settings: {
                ...task.settings,
                [e.target.name]: e.target.value,
              },
            });
          }}
        >
          {VIDEO_QUALITY.map((t) => (
            <MenuItem key={t} value={t}>
              <Typography variant="body2">{t}</Typography>
            </MenuItem>
          ))}
        </CustomTextField>
      </Grid>
    </Grid>
  );
}

export default ScheduledRecording;
