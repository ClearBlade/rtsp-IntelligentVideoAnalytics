import {
  Button,
  CircularProgress,
  IconButton,
  Link,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Box } from "@material-ui/core";
import React from "react";
import TextWithHelpIcon from "../helpers/TextWithHelpIcon";
import { Alert, AlertTitle } from "@material-ui/lab";
import TextWithIcon from "../helpers/TextWithIcon";
import LaunchIcon from "@material-ui/icons/Launch";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/core/styles";
import useFetchBucketSets from "../api/useFetchBucketSets";
import ShoppingBasketIcon from "@material-ui/icons/ShoppingBasket";
import { Device } from "./EditableDeviceForm";
import { useFormikContext } from "formik";
import { useConfig } from "../context/ConfigContext";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
}));

function ConfigureBucketSet({
  rootPath,
  device,
  setDevice,
}: {
  rootPath: { id: string; path: string } | undefined;
  device: Device | null;
  setDevice: (device: Device) => void;
}) {
  const { platformURL, systemKey, userToken } = useConfig();
  const classes = useStyles();
  const { setFieldValue } = useFormikContext<Device>();

  const {
    data: bucketSets,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchBucketSets(platformURL, systemKey, userToken);

  const getBucketSetName = (path: { id: string; path: string } | undefined) => {
    if (!path) return "";

    const bucketSet = bucketSets?.find(
      (bucketSet) => bucketSet.name === path.id
    );
    return bucketSet?.name || "";
  };

  const getBucketSetPath = (name: string | undefined) => {
    if (!name) return { id: "", path: "" };

    const bucketSet = bucketSets?.find((bucketSet) => bucketSet.name === name);
    return {
      id: bucketSet?.name || "",
      path: bucketSet?.edge_config.root || "",
    };
  };

  const handleBucketSetChange = (value: string) => {
    const newRootPath = getBucketSetPath(value);
    setFieldValue("rootPath", newRootPath);
    if (device) {
      setDevice({ ...device, rootPath: newRootPath });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="body2" color="error">
        Error fetching bucket sets: {error.message}
      </Typography>
    );
  }

  return (
    <Box className={classes.root}>
      <TextWithHelpIcon
        label="Storage location"
        openOnClick={true}
        helpText={
          <>
            <Typography variant="caption">
              This is where the data for this device will be stored. By default,
              it will use the storage location set in the{" "}
            </Typography>
            <Link
              // href="" /settings/storage-locations
              href="https://www.google.com"
              target="_blank"
              color="secondary"
            >
              <Typography variant="caption">
                "Intelligent Video Analytics component's settings"
              </Typography>
            </Link>
          </>
        }
      />
      {!bucketSets || bucketSets.length === 0 ? (
        <Alert severity="info" variant="outlined">
          <AlertTitle>
            <Typography variant="body1" style={{ fontWeight: "bold" }}>
              No storage locations found.
            </Typography>
          </AlertTitle>
          <Typography variant="body2" gutterBottom>
            {
              "To select a storage destination for this device, first connect an external storage location (e.g., a Google Cloud bucket) in System Settings (requires appropriate permissions)."
            }
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            className={classes.buttonContainer}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => {
                window.open(
                  "http://localhost:8081/ia/iva/settings/system",
                  "_blank"
                );
              }}
              style={{ marginRight: 8 }}
            >
              <TextWithIcon
                text={"System Settings"}
                icon={(className) => (
                  <LaunchIcon fontSize="small" className={className} />
                )}
                flexDirection={"row-reverse"}
                iconMargin={0}
                iconMarginLeft={1}
              />
            </Button>
            <Tooltip title="Refresh" arrow placement="right">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* <TextWithIcon text="Link storage location" iconMargin={1} /> */}
          </Box>
        </Alert>
      ) : (
        <Box>
          <TextField
            select
            fullWidth
            // style={{ width: "40%" }}
            variant="outlined"
            size="small"
            value={getBucketSetName(rootPath)}
            onChange={(e) => handleBucketSetChange(e.target.value)}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => {
                if (!value) {
                  return (
                    <Typography variant="body1" color="textSecondary">
                      Select storage location
                    </Typography>
                  );
                }
                const selectedBucketSet = bucketSets.find(
                  (bucketSet) => bucketSet.name === value
                );
                return selectedBucketSet ? (
                  <Box display="flex" alignItems="center">
                    <ShoppingBasketIcon
                      color="secondary"
                      style={{ marginRight: 8 }}
                      fontSize="small"
                    />
                    {selectedBucketSet.name}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Select storage location
                  </Typography>
                );
              },
            }}
          >
            <MenuItem value="">
              <Typography variant="body1">
                {"Select storage location"}
              </Typography>
            </MenuItem>
            {bucketSets.map((bucketSet) => (
              <MenuItem key={bucketSet.name} value={bucketSet.name}>
                <ShoppingBasketIcon
                  color="secondary"
                  style={{ marginRight: 8 }}
                  fontSize="small"
                />
                {bucketSet.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    </Box>
  );
}

export default ConfigureBucketSet;
