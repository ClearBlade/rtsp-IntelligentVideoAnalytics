import React, { useEffect, useState } from "react";
import { TaskComponentProps } from "../Tasks";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  makeStyles,
  Theme,
  Switch,
  Box,
  IconButton,
  Tooltip,
  Button,
  Checkbox,
} from "@material-ui/core";
import Mapper from "../Mapper";
import { Autocomplete } from "@material-ui/lab";
import HelpIcon from "@material-ui/icons/Help";
import ScheduledSnapshot, { FILETYPE, RESOLUTION } from "./ScheduledSnapshot";
import CustomTextField from "../../helpers/CustomTextField";
import { INTERVAL_UNITS, VIDEO_QUALITY } from "./ScheduledRecording";
import TextWithHelpIcon from "../../helpers/TextWithHelpIcon";

const DETECTABLE_OBJECTS = [
  { name: "Person", value: "person" },
  { name: "Bicycle", value: "bicycle" },
  { name: "Car", value: "car" },
  { name: "Motorbike", value: "motorbike" },
  { name: "Aeroplane", value: "aeroplane" },
  { name: "Bus", value: "bus" },
  { name: "Train", value: "train" },
  { name: "Truck", value: "truck" },
  { name: "Boat", value: "boat" },
];

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
  buttonGroup: {
    marginBottom: theme.spacing(2),
  },
}));

export const SaveAs = ({
  task,
  onTaskChange,
}: Pick<TaskComponentProps, "task" | "onTaskChange">) => {
  const classes = useStyles();
  const [saveAs, setSaveAs] = useState<"VIDEO" | "IMAGE" | "">(
    task.settings?.file_type
      ? "IMAGE"
      : task.settings?.video_quality
      ? "VIDEO"
      : ""
  );

  useEffect(() => {
    // change blur faces to false
    let objects_to_detect = task.settings?.objects_to_detect as object;
    if (!objects_to_detect) return;

    Object.keys(objects_to_detect as object).forEach((key) => {
      objects_to_detect[key] = {
        ...objects_to_detect[key],
        enable_blur: false,
      };
    });

    if (saveAs === "IMAGE") {
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          file_type: task.settings?.file_type || FILETYPE[0],
          resolution: task.settings?.resolution || RESOLUTION[0],
          video_quality: undefined,
          clip_length: undefined,
          clip_length_units: undefined,
          objects_to_detect,
        },
      });
    } else if (saveAs === "VIDEO") {
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          file_type: undefined,
          resolution: undefined,
          video_quality: task.settings?.video_quality || VIDEO_QUALITY[0],
          clip_length: task.settings?.clip_length || 30,
          clip_length_units:
            task.settings?.clip_length_units || INTERVAL_UNITS[0],
          objects_to_detect,
        },
      });
    } else {
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          file_type: undefined,
          resolution: undefined,
          video_quality: undefined,
          clip_length: undefined,
          clip_length_units: undefined,
          objects_to_detect,
        },
      });
    }
  }, [saveAs]);

  return (
    <>
      <Box className={classes.buttonGroup}>
        <Button
          className={classes.toggleButton}
          variant={saveAs === "VIDEO" ? "contained" : "outlined"}
          size="small"
          onClick={() => setSaveAs((prev) => (prev === "VIDEO" ? "" : "VIDEO"))}
          style={{ borderRadius: "4px 0 0 4px" }}
        >
          Video
        </Button>
        <Button
          className={classes.toggleButton}
          variant={saveAs === "IMAGE" ? "contained" : "outlined"}
          size="small"
          onClick={() => setSaveAs((prev) => (prev === "IMAGE" ? "" : "IMAGE"))}
          style={{ borderRadius: "0 4px 4px 0" }}
        >
          Image
        </Button>
      </Box>
      {saveAs === "VIDEO" ? (
        <Grid container spacing={2} style={{ paddingLeft: "16px" }}>
          <Grid item xs={12}>
            <CustomTextField
              label={"Video quality"}
              select
              // style={{ width: "30%" }}
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
          {/* <Grid item xs={3} />
          <Grid item xs={4} /> */}
          <Grid style={{ paddingBottom: 0 }} item xs={12}>
            <TextWithHelpIcon
              label="Clip length"
              helpText="This sets the length of the recording. By default, this matches the selected interval length."
            />
          </Grid>
          <Grid item md={2} xs={3} style={{ paddingRight: 0 }}>
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
          <Grid item md={3} xs={5}>
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
          <Grid style={{ paddingBottom: 0 }} item xs={12}>
            <TextWithHelpIcon
              label="Recording lead time"
              helpText="Define how long before the task is triggered to begin recording, allowing you to capture additional context."
            />
          </Grid>
          <Grid item md={2} xs={3} style={{ paddingRight: 0 }}>
            <TextField
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={task.settings?.record_lead_time || 10}
              name="record_lead_time"
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
          <Grid item md={3} xs={5}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              // label={"Units"}
              value={task.settings?.record_lead_time_units || INTERVAL_UNITS[0]}
              name="record_lead_time_units"
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
              {INTERVAL_UNITS.slice(0, 2).map((t) => (
                <MenuItem key={t} value={t}>
                  <Typography variant="body2">{t}</Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 0 }}>
            <Box display={"flex"}>
              <Checkbox
                size="small"
                disabled={
                  Object.keys(task.settings?.objects_to_detect as object)
                    .length === 0
                }
                checked={Object.keys(
                  task.settings?.objects_to_detect as object
                ).some(
                  (key) =>
                    (task.settings?.objects_to_detect as object)[key]
                      .enable_blur === true
                )}
                onChange={(e) => {
                  // add enable_blur to all objects
                  let objects_to_detect = task.settings
                    ?.objects_to_detect as object;
                  if (!objects_to_detect) return;

                  Object.keys(objects_to_detect as object).forEach((key) => {
                    objects_to_detect[key] = {
                      ...objects_to_detect[key],
                      enable_blur: e.target.checked,
                    };
                  });

                  onTaskChange({
                    ...task,
                    settings: {
                      ...task.settings,
                      objects_to_detect: objects_to_detect,
                    },
                  });
                }}
              />
              <Typography variant="body1" className={classes.gridText}>
                Blur faces
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : saveAs === "IMAGE" ? (
        <Grid container spacing={2} style={{ paddingLeft: "16px" }}>
          <Grid item xs={12}>
            <ScheduledSnapshot
              onTaskChange={onTaskChange}
              task={task}
              disableInterval={true}
            />
          </Grid>
          <Grid item xs={12} style={{ paddingTop: 0 }}>
            <Box display={"flex"}>
              <Checkbox
                size="small"
                disabled={
                  Object.keys(task.settings?.objects_to_detect as object)
                    .length === 0
                }
                checked={Object.keys(
                  task.settings?.objects_to_detect as object
                ).some(
                  (key) =>
                    (task.settings?.objects_to_detect as object)[key]
                      .enable_blur === true
                )}
                onChange={(e) => {
                  // add enable_blur to all objects
                  let objects_to_detect = task.settings
                    ?.objects_to_detect as object;
                  if (!objects_to_detect) return;

                  Object.keys(objects_to_detect as object).forEach((key) => {
                    objects_to_detect[key] = {
                      ...objects_to_detect[key],
                      enable_blur: e.target.checked,
                    };
                  });

                  onTaskChange({
                    ...task,
                    settings: {
                      ...task.settings,
                      objects_to_detect: objects_to_detect,
                    },
                  });
                }}
              />
              <Typography variant="body1" className={classes.gridText}>
                Blur faces
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : null}
    </>
  );
};

export const ObjectDetectionField = ({
  task,
  onTaskChange,
  enableTracking,
}: Pick<TaskComponentProps, "task" | "onTaskChange"> & {
  enableTracking?: boolean;
}) => {
  const setObjectsToDetect = (objects: string[]) => {
    let objects_to_detect = {};
    // only add the new objects to detect
    objects.forEach((obj) => {
      objects_to_detect[obj] = {
        enable_tracking: enableTracking ? true : false,
        show_labels: true,
        show_boxes: true,
        enable_blur: false,
      };
    });

    Object.keys(task.settings?.objects_to_detect as object).forEach((key) => {
      if (objects.includes(key)) {
        objects_to_detect[key] = {
          ...(task.settings?.objects_to_detect as object)[key],
        };
      }
    });

    onTaskChange({
      ...task,
      settings: {
        ...task.settings,
        objects_to_detect: objects_to_detect,
      },
    });
  };

  const getObjectsToDetect = () => {
    if (!task.settings?.objects_to_detect) return [];
    return Object.keys(task.settings?.objects_to_detect as object) || [];
  };

  return (
    <>
      <TextWithHelpIcon
        label="Objects to detect*"
        helpText="Select which types of objects the camera should detect."
      />
      <Autocomplete
        multiple
        size="small"
        limitTags={3}
        id="multiple-limit-tags"
        value={DETECTABLE_OBJECTS.filter((obj) =>
          getObjectsToDetect().includes(obj.value)
        )}
        options={DETECTABLE_OBJECTS}
        onChange={(_, newValue) =>
          setObjectsToDetect(newValue.map((v) => v.value))
        }
        getOptionSelected={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
        disableCloseOnSelect
      />
    </>
  );
};

const ObjectSettingField = ({
  task,
  onTaskChange,
  settingId,
  settingLabel,
  helpText,
}: Pick<TaskComponentProps, "task" | "onTaskChange"> & {
  settingId: string;
  settingLabel: string;
  helpText: string;
}) => {
  const classes = useStyles();

  const getSettingObjects = () => {
    let objects_to_detect = task.settings?.objects_to_detect as object;
    if (!objects_to_detect) return [];

    return DETECTABLE_OBJECTS.filter(
      (obj) =>
        Object.keys(objects_to_detect as object).includes(obj.value) &&
        objects_to_detect[obj.value][settingId]
    );
  };

  const getOptions = () => {
    let objects_to_detect = task.settings?.objects_to_detect as object;
    if (!objects_to_detect) return [];

    return DETECTABLE_OBJECTS.filter((obj) =>
      Object.keys(objects_to_detect as object).includes(obj.value)
    );
  };

  const setSettings = (objects: string[]) => {
    let objects_to_detect = task.settings?.objects_to_detect as object;

    if (!objects_to_detect) return;

    Object.keys(objects_to_detect as object).forEach((key) => {
      objects_to_detect[key] = {
        ...objects_to_detect[key],
        [settingId]: objects.includes(key) ? true : false,
      };
    });

    onTaskChange({
      ...task,
      settings: {
        ...task.settings,
        objects_to_detect: objects_to_detect,
      },
    });
  };

  return (
    <>
      <Box display={"flex"} alignItems="flex-start">
        <Typography variant="body2" className={classes.typographyText}>
          {settingLabel}
        </Typography>
        <Tooltip title={helpText}>
          <IconButton size="small" aria-label="help" style={{ marginLeft: 4 }}>
            <HelpIcon fontSize="small" style={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Autocomplete
        multiple
        size="small"
        limitTags={6}
        id="multiple-limit-tags"
        value={getSettingObjects()}
        options={getOptions()}
        onChange={(_, newValue) => setSettings(newValue.map((v) => v.value))}
        getOptionSelected={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
        disableCloseOnSelect
      />
    </>
  );
};

function ObjectDetection({ task, onTaskChange }: TaskComponentProps) {
  const classes = useStyles();

  useEffect(() => {
    if (!task.settings?.objects_to_detect) {
      onTaskChange({
        ...task,
        settings: {
          ...task.settings,
          objects_to_detect: {},
        },
      });
    }
  }, [task, onTaskChange]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <ObjectDetectionField
          task={task}
          onTaskChange={onTaskChange}
          // enableTracking={checkIfTrackingEnabled}
        />
      </Grid>
      <Grid item xs={4} />
      {Object.keys(task.settings?.objects_to_detect || {}).length > 0 && (
        <>
          <Grid item xs={8} style={{ paddingLeft: "40px" }}>
            <ObjectSettingField
              task={task}
              onTaskChange={onTaskChange}
              settingId="show_labels"
              settingLabel="Show labels on"
              helpText="Show object labels on selected objects."
            />
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={8} style={{ paddingLeft: "40px" }}>
            <ObjectSettingField
              task={task}
              onTaskChange={onTaskChange}
              settingId="enable_tracking"
              settingLabel="Enable unique object tracking on"
              helpText="Enable unique object tracking on selected objects."
            />
          </Grid>
          <Grid item xs={4} />
        </>
      )}
      {/* <Grid item xs={12}>
        <Box display={"flex"}>
          <Switch
            checked={checkIfTrackingEnabled()}
            onChange={(e) => updateTracking(e.target.checked)}
            name="tracking_enabled"
            color="secondary"
          />
          <Typography variant="body1" className={classes.gridText}>
            Enable object tracking
          </Typography>
        </Box>
      </Grid> */}
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

export default ObjectDetection;
