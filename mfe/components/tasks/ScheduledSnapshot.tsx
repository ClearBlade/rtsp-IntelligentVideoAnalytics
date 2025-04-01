import {
  Box,
  Checkbox,
  Divider,
  Grid,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { TaskComponentProps } from "../Tasks";
import CustomTextField from "../../helpers/CustomTextField";

export const FILETYPE = ["PNG", "JPEG", "JPG"] as const;
export const RESOLUTION = ["Original", "Lower", "Lowest"] as const;
const INTERVAL_UNITS = ["Seconds", "Minutes", "Hours", "Days"] as const;

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  gridText: {
    marginTop: theme.spacing(1),
  },
}));

export const IntervalGrid = ({
  task,
  onTaskChange,
}: Pick<TaskComponentProps, "task" | "onTaskChange">) => {
  const classes = useStyles();

  useEffect(() => {
    if (
      !task.settings?.interval ||
      !task.settings?.units ||
      !task.settings?.start_time
    ) {
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          interval: 1,
          units: INTERVAL_UNITS[1], // Default to "Minutes"
          start_time: new Date().toISOString(),
        },
      });
    }
  }, [task, onTaskChange]);

  const getDateTimeString = (isoTime: string) => {
    const date = new Date(isoTime);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const formattedDateWithSeconds = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // With seconds
    return formattedDateWithSeconds;
  };

  return (
    <>
      <Grid style={{ paddingBottom: 0 }} item xs={12}>
        <Typography
          variant="body2"
          align="left"
          className={classes.typographyText}
        >
          Interval
        </Typography>
      </Grid>

      <Grid
        item
        md={1}
        xs={2}
        className={classes.gridText}
        style={{
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Typography variant="body2" align="right">
          Every
        </Typography>
      </Grid>
      <Grid item lg={2} md={1} xs={2} style={{ paddingRight: 0 }}>
        <TextField
          type="number"
          fullWidth
          variant="outlined"
          size="small"
          value={task.settings?.interval || 1}
          name="interval"
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
      <Grid item lg={3} md={2} xs={4} style={{ paddingRight: 0 }}>
        <TextField
          select
          fullWidth
          variant="outlined"
          size="small"
          // label={"Units"}
          value={task.settings?.units || INTERVAL_UNITS[1]}
          name="units"
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
      <Grid
        item
        md={2}
        xs={4}
        className={classes.gridText}
        style={{
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Typography variant="body2" align="left">
          starting on
        </Typography>
      </Grid>
      {/* style={{ paddingLeft: 0 }} */}
      <Grid item md={4} xs={12}>
        <TextField
          helperText="Intervals will begin from the selected time"
          type="datetime-local"
          fullWidth
          variant="outlined"
          size="small"
          // label={"Task name"}
          value={
            task.settings.start_time
              ? getDateTimeString(task.settings.start_time as string)
              : ""
          }
          name="start_time"
          onChange={(e) => {
            onTaskChange({
              ...task,
              settings: {
                ...task.settings,
                [e.target.name]: new Date(e.target.value).toISOString(),
              },
            });
          }}
        />
      </Grid>
    </>
  );
};

function ScheduledSnapshot({
  task,
  onTaskChange,
  disableInterval,
}: Pick<TaskComponentProps, "task" | "onTaskChange"> & {
  disableInterval?: boolean;
}) {
  const classes = useStyles();

  // check if settings and empty and not of a different task
  useEffect(() => {
    if (Object.keys(task.settings).length === 0) {
      onTaskChange({
        ...task,
        settings: {
          file_type: FILETYPE[0],
          resolution: RESOLUTION[0],
          interval: 1,
          units: INTERVAL_UNITS[1],
          // start_time: new Date().toISOString(),
        },
      });
    }
  }, [task, onTaskChange]);

  return (
    <Grid container spacing={4}>
      {!disableInterval && (
        <IntervalGrid task={task} onTaskChange={onTaskChange} />
      )}

      <Grid item md={4} xs={12}>
        <CustomTextField
          label={"File type"}
          select
          fullWidth
          variant="outlined"
          size="small"
          value={task.settings?.file_type || FILETYPE[0]}
          name="file_type"
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
          {FILETYPE.map((t) => (
            <MenuItem key={t} value={t}>
              <Typography variant="body2">{t}</Typography>
            </MenuItem>
          ))}
        </CustomTextField>
      </Grid>
      <Grid item md={4} xs={12}>
        <CustomTextField
          label={"Resolution"}
          select
          fullWidth
          variant="outlined"
          size="small"
          value={task.settings?.resolution || RESOLUTION[0]}
          name="resolution"
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
          {RESOLUTION.map((t) => (
            <MenuItem key={t} value={t}>
              <Typography variant="body2">{t}</Typography>
            </MenuItem>
          ))}
        </CustomTextField>
      </Grid>
      {/* {!disableBlur && (
        
      )} */}
    </Grid>
  );
}

export default ScheduledSnapshot;
