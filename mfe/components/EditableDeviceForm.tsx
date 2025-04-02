import React, { useCallback, useEffect, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Grid,
  Typography,
  makeStyles,
  Theme,
  Divider,
} from "@material-ui/core";
import Feed from "./Feed";
import CustomTextField from "../helpers/CustomTextField";
import { Alert } from "@material-ui/lab";
import { useCreateStream } from "../api/useCreateStream";
import ConfigureBucketSet from "./ConfigureBucketSet";
import { Task } from "./Tasks";
import { getErrorMessage } from "../helpers/getErrorMessage";
import { useConfig } from "../context/ConfigContext";

interface EditableDeviceFormProps {
  device: Device | null;
  image: { base64: string; timestamp: number } | null;
  edgeId: string;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isSetup: boolean;
  refresh: () => void;
  isRefreshing: boolean;
  setImage: (image: { base64: string; timestamp: number } | null) => void;
  setDevice: (device: Device | null) => void;
}

export interface Device {
  rtspUrl: string;
  ip: string;
  streamingChannel: string;
  port: string;
  username: string;
  password: string;
  deviceName: string;
  deviceId: string;
  rootPath: { id: string; path: string };
}

const useStyles = makeStyles((theme: Theme) => ({
  gridField: {
    marginTop: theme.spacing(1),
  },
  connectButton: {
    textDecoration: "none",
    marginTop: theme.spacing(3),
  },
  typographyText: {
    marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  textPadding: {
    paddingTop: theme.spacing(2),
  },
  toggleButton: {
    boxShadow: "none",
    borderRadius: "0 0 0 0",
  },
  label: {
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
}));

const validationSchema = Yup.object({
  rtspUrl: Yup.string(),

  deviceName: Yup.string().required("Required"),
  deviceId: Yup.string().required("Required"),
  ip: Yup.string(),
  streamingChannel: Yup.string(),
  port: Yup.string(),
  username: Yup.string(),
  password: Yup.string(),
}).test(
  "either-one-or-all",
  "Fill either 'RTSP URL' or Camera credentials",
  function (values) {
    const { rtspUrl, ip, streamingChannel, port, username, password } = values;

    const rtspUrlFilled = Boolean(rtspUrl?.trim());
    const credentialsFilled =
      Boolean(ip?.trim()) &&
      Boolean(streamingChannel?.trim()) &&
      Boolean(port?.trim()) &&
      Boolean(username?.trim()) &&
      Boolean(password?.trim());

    if (rtspUrlFilled || credentialsFilled) {
      return true; // Validation passes
    }

    if (!rtspUrlFilled) {
      return this.createError({
        path: "rtspUrl",
        message: "Required",
      });
    }
  }
);

const RtspField = React.memo(() => {
  const classes = useStyles();
  const { handleChange, handleBlur, values, touched, errors } =
    useFormikContext<Device>();

  return (
    <Grid className={classes.gridField} container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          label={"RTSP URL*"}
          placeholder="Enter RTSP URL"
          variant="outlined"
          size="small"
          name="rtspUrl"
          onChange={handleChange}
          onBlur={handleBlur}
          value={
            values.rtspUrl
            // values.ip &&
            // values.port &&
            // values.streamingChannel &&
            // values.username &&
            // values.password
            //   ? `rtsp://${values.username}:${values.password}@${values.ip}:${values.port}/${values.streamingChannel}`
            //   : values.rtspUrl
          }
          fullWidth
          error={touched.rtspUrl && Boolean(errors.rtspUrl)}
          helperText={touched.rtspUrl && errors.rtspUrl ? errors.rtspUrl : ""}
        />
      </Grid>
    </Grid>
  );
});

const CredentialsFields = React.memo(() => {
  const classes = useStyles();
  const { handleChange, handleBlur, values, touched, errors } =
    useFormikContext<Device>();

  const getValueFromRTSPString = () => {
    const regex = /rtsp:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/;
    const match = values.rtspUrl.match(regex);
    if (match) {
      const username = match[1];
      const password = match[2];
      const ip = match[3];
      const port = match[4];
      const streamingChannel = match[5];

      return { username, password, ip, port, streamingChannel };
    }
  };

  return (
    <>
      <Grid className={classes.gridField} container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2" align="left" color="textSecondary">
            Connect using your device's credentials.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"IP address*"}
            placeholder="Enter IP address"
            variant="outlined"
            size="small"
            name="ip"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.ip}
            fullWidth
            error={!values.ip && touched.ip && Boolean(errors.rtspUrl)}
            helperText={
              !values.ip && touched.ip && errors.rtspUrl ? "Required" : ""
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"Port number*"}
            placeholder="Enter port number"
            variant="outlined"
            size="small"
            name="port"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.port}
            fullWidth
            error={!values.port && touched.port && Boolean(errors.rtspUrl)}
            helperText={
              !values.port && touched.port && errors.rtspUrl ? "Required" : ""
            }
          />
        </Grid>
      </Grid>
      <Grid className={classes.gridField} container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            label={"Streaming channel*"}
            placeholder="Enter streaming channel"
            variant="outlined"
            size="small"
            name="streamingChannel"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.streamingChannel}
            fullWidth
            error={
              !values.streamingChannel &&
              touched.streamingChannel &&
              Boolean(errors.rtspUrl)
            }
            helperText={
              !values.streamingChannel &&
              touched.streamingChannel &&
              errors.rtspUrl
                ? "Required"
                : ""
            }
          />
        </Grid>
      </Grid>
      <Grid className={classes.gridField} container spacing={4}>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"Username*"}
            placeholder="Enter username"
            variant="outlined"
            size="small"
            name="username"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.username}
            fullWidth
            error={
              !values.username && touched.username && Boolean(errors.rtspUrl)
            }
            helperText={
              !values.username && touched.username && errors.rtspUrl
                ? "Required"
                : ""
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            label={"Password*"}
            placeholder="Enter password"
            type="password"
            variant="outlined"
            size="small"
            name="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.password}
            fullWidth
            error={
              !values.password && touched.password && Boolean(errors.rtspUrl)
            }
            helperText={
              !values.password && touched.password && errors.rtspUrl
                ? "Required"
                : ""
            }
          />
        </Grid>
      </Grid>
    </>
  );
});

function EditableDeviceForm({
  image,
  edgeId,
  device,
  tasks,
  setTasks,
  setImage,
  setDevice,
  isSetup,
  refresh,
  isRefreshing,
}: EditableDeviceFormProps) {
  const classes = useStyles();
  const [activeForm, setActiveForm] = useState<"CREDENTIALS" | "RTSP">(
    "CREDENTIALS"
  );

  const {
    mutate: initiateStream,
    isLoading: isInitiatingStream,
    isError: isInitiatingStreamError,
    error: initiatingStreamError,
  } = useCreateStream((data) => {
    setImage({
      base64: data.image,
      timestamp: Date.now(),
    });
  });

  const checkIfValuesChanged = useCallback(
    (
      values: {
        deviceName: any;
        deviceId?: string;
        ip: any;
        streamingChannel: any;
        port: any;
        username: any;
        password: any;
        rtspUrl: any;
        rootPath?: { id: string; path: string };
      },
      device: Device | null
    ) => {
      if (!device || !values) return false;

      const {
        rtspUrl,
        ip,
        streamingChannel,
        port,
        username,
        password,
        deviceName,
        rootPath,
      } = values;

      // Check if any field has a value
      const hasFilledFields =
        Boolean(rtspUrl?.trim()) ||
        Boolean(ip?.trim()) ||
        Boolean(streamingChannel?.trim()) ||
        Boolean(port?.trim()) ||
        Boolean(username?.trim()) ||
        Boolean(password?.trim());

      if (!hasFilledFields) {
        return false;
      }

      // For setup mode, also check deviceName
      if (
        !isSetup &&
        Boolean(deviceName?.trim())
        // Boolean(rootPath?.id?.trim()) &&
        // Boolean(rootPath?.path?.trim())
      ) {
        return (
          rtspUrl !== device.rtspUrl ||
          ip !== device.ip ||
          streamingChannel !== device.streamingChannel ||
          port !== device.port ||
          username !== device.username ||
          password !== device.password ||
          deviceName !== device.deviceName ||
          rootPath?.id !== device.rootPath?.id ||
          rootPath?.path !== device.rootPath?.path
        );
      }

      // For non-setup mode, check other fields
      return (
        rtspUrl !== device.rtspUrl ||
        ip !== device.ip ||
        streamingChannel !== device.streamingChannel ||
        port !== device.port ||
        username !== device.username ||
        password !== device.password
      );
    },
    []
  );

  const handleRefresh = useCallback(() => {
    if (device) {
      refresh();
    }
  }, [device, refresh]);

  const handleFormSubmit = useCallback(
    (values: Device) => {
      if (activeForm === "RTSP") {
        const rtspValues = {
          ...values,
          ip: "",
          streamingChannel: "",
          port: "",
          username: "",
          password: "",
        };
        setDevice(rtspValues);
        initiateStream({ edge: edgeId, credentials: rtspValues });
      } else {
        const rtspValues = {
          ...values,
          rtspUrl: "",
        };
        if (rtspValues) {
          setDevice(rtspValues);
          initiateStream({ edge: edgeId, credentials: rtspValues });
        }
      }
    },
    [activeForm, setDevice, initiateStream, edgeId]
  );

  useEffect(() => {
    if (device) {
      setActiveForm(device.rtspUrl ? "RTSP" : "CREDENTIALS");
    }
  }, [device]);

  return (
    <Box>
      {isSetup && (
        <>
          <Typography
            className={classes.typographyText}
            variant="h5"
            align="left"
            gutterBottom
          >
            Device overview
          </Typography>

          <Typography
            variant="body2"
            align="left"
            gutterBottom
            color="textSecondary"
          >
            Enter basic device information and connect the RTSP video stream.
          </Typography>
        </>
      )}
      {!isSetup && (
        <>
          <Typography
            variant="h5"
            color="textSecondary"
            align="left"
            className={classes.typographyText}
          >
            Feed
          </Typography>
          <Feed
            deviceName={device?.deviceName || ""}
            image={image}
            isFetching={isInitiatingStream || isRefreshing}
            isErrored={isInitiatingStreamError}
            error={initiatingStreamError?.message || ""}
            refresh={handleRefresh}
          />
          <Divider className={classes.divider} />
          <Typography
            className={classes.typographyText}
            variant="h5"
            align="left"
            color="textSecondary"
            gutterBottom
          >
            Details
          </Typography>
        </>
      )}
      <Formik
        initialValues={{
          deviceName: device?.deviceName || "",
          deviceId: device?.deviceId || "",
          ip: device?.ip || "",
          streamingChannel: device?.streamingChannel || "",
          port: device?.port || "",
          username: device?.username || "",
          password: device?.password || "",
          rtspUrl: device?.rtspUrl || "",
          rootPath: device?.rootPath || { id: "", path: "" },
        }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ handleChange, handleBlur, values, touched, errors }) => (
          <Form>
            <Grid className={classes.gridField} container spacing={4}>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  label={"Device name*"}
                  placeholder="Enter device name"
                  variant="outlined"
                  size="small"
                  name="deviceName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.deviceName}
                  fullWidth
                  error={touched.deviceName && Boolean(errors.deviceName)}
                  helperText={
                    touched.deviceName && errors.deviceName
                      ? errors.deviceName
                      : ""
                  }
                />
              </Grid>
              {isSetup && (
                <Grid item xs={12} md={6}>
                  <CustomTextField
                    label={"Device ID*"}
                    placeholder="Enter device ID"
                    variant="outlined"
                    size="small"
                    name="deviceId"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.deviceId}
                    fullWidth
                    error={touched.deviceId && Boolean(errors.deviceId)}
                    helperText={
                      touched.deviceId && errors.deviceId ? errors.deviceId : ""
                    }
                  />
                </Grid>
              )}
            </Grid>

            {isSetup ? (
              <>
                <Divider className={classes.divider} />
                <Typography
                  variant="body2"
                  align="left"
                  className={classes.label}
                  color="textSecondary"
                >
                  Connect via
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                align="left"
                className={classes.label}
                color="textSecondary"
                style={{ marginTop: "16px" }}
              >
                Connection type
              </Typography>
            )}
            <Box>
              <Button
                className={classes.toggleButton}
                variant={
                  activeForm === "CREDENTIALS" ? "contained" : "outlined"
                }
                size="small"
                style={{ borderRadius: "4px 0 0 4px" }}
                onClick={() => setActiveForm("CREDENTIALS")}
              >
                CREDENTIALS
              </Button>
              <Button
                className={classes.toggleButton}
                style={{ borderRadius: "0 4px 4px 0" }}
                variant={activeForm === "RTSP" ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveForm("RTSP")}
              >
                RTSP URL
              </Button>
            </Box>
            {activeForm === "RTSP" ? <RtspField /> : <CredentialsFields />}
            {isSetup && (
              <Button
                className={classes.connectButton}
                type="submit"
                variant="outlined"
                color="secondary"
                size="small"
                disabled={
                  isInitiatingStream || isRefreshing
                  // || !checkIfValuesChanged(values, device)
                }
              >
                {checkIfValuesChanged(values, device) ? "Reconnect" : "Connect"}
              </Button>
            )}
            {checkIfValuesChanged(values, device) && isSetup && (
              <Box mt={2}>
                <Alert severity="warning" variant="outlined">
                  <Box style={{ fontWeight: "bold" }}>
                    Device credentials modified
                  </Box>
                  <Box>
                    You've modified the RTSP credentials for this device. Click
                    "Reconnect" to apply your changes.
                  </Box>
                </Alert>
              </Box>
            )}
            {isSetup && (
              <>
                <Divider className={classes.divider} />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="left"
                  className={classes.label}
                >
                  Feed
                </Typography>
                <Feed
                  deviceName={device?.deviceName || ""}
                  image={image}
                  isFetching={isInitiatingStream || isRefreshing}
                  isErrored={isInitiatingStreamError}
                  error={getErrorMessage(initiatingStreamError)}
                  refresh={handleRefresh}
                />
                <Divider className={classes.divider} />
              </>
            )}
            <Box mt={2}>
              <ConfigureBucketSet
                rootPath={values.rootPath}
                device={device}
                setDevice={setDevice}
              />
            </Box>
            {!isSetup && (
              <>
                {checkIfValuesChanged(values, device) && (
                  <Box mt={2}>
                    <Alert severity="warning" variant="outlined">
                      <Box style={{ fontWeight: "bold" }}>
                        Device details modified
                      </Box>
                      <Box>
                        You've modified the device details. Click "Save changes"
                        to apply your changes.
                      </Box>
                    </Alert>
                  </Box>
                )}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    size="medium"
                    disabled={
                      isInitiatingStream ||
                      isRefreshing ||
                      !checkIfValuesChanged(values, device)
                    }
                    onClick={() => {
                      // TODO: Update task settings root path
                      // TODO: set device root path and save
                      // TODO: restart camera feed
                      console.log("save changes");
                    }}
                    color="secondary"
                  >
                    Save changes
                  </Button>
                </Box>
              </>
            )}
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default EditableDeviceForm;
