import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  MenuItem,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomTextField from "../helpers/CustomTextField";
import { Alert, AlertTitle } from "@material-ui/lab";
import useFetchEdges from "../api/useFetchEdges";
import { useDeployToEdge } from "../api/useDeployToEdge";

export interface Edge {
  name: string;
  isConnected: boolean;
  last_connect: number;
  last_disconnect: number;
  last_edge_type: string;
  last_seen_architecture: string;
  last_seen_os: string;
  last_seen_version: string;
}

interface EdgeSetupProps {
  edge: Edge | null;
  setEdge: React.Dispatch<React.SetStateAction<Edge | null>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    marginTop: theme.spacing(2),
  },
  gridContainer: {
    marginTop: theme.spacing(2),
  },
  connectButton: {
    minWidth: "120px",
    position: "relative",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -10,
    marginLeft: -10,
  },
}));

function EdgeSetup({ edge, setEdge }: EdgeSetupProps) {
  const classes = useStyles();
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(edge);
  const [error, setError] = useState<string | null>(null);
  const {
    data: connectedEdges,
    isLoading,
    error: fetchEdgesError,
  } = useFetchEdges();
  const {
    mutate: deployToEdge,
    isLoading: isDeploying,
    isSuccess: isDeploySuccess,
  } = useDeployToEdge(
    () => {
      setEdge(selectedEdge);
    },
    (error) => {
      console.error(error);
      setError(
        `The connection to the selected edge timed out, which may indicate an incorrect selection. Please choose a different edge and try again.`
      );
    }
  );

  if (fetchEdgesError) {
    return (
      <Box mt={2}>
        <Alert severity="error" variant="outlined">
          <AlertTitle>Error fetching edges</AlertTitle>
          {(fetchEdgesError as Error).message}
        </Alert>
      </Box>
    );
  }
  return (
    <Box>
      <Typography
        className={classes.typographyText}
        variant="h5"
        align="left"
        gutterBottom
      >
        Connect to edge
      </Typography>
      <Typography
        variant="body2"
        align="left"
        gutterBottom
        color="textSecondary"
      >
        Select an existing edge to connect your device to. Edges must be set up
        in your system first before adding RTSP devices.
      </Typography>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={7}>
          <CustomTextField
            select
            label="Select edge*"
            placeholder="Select edge"
            variant="outlined"
            size="small"
            fullWidth
            value={selectedEdge?.name || ""}
            onChange={(e) => {
              setError(null);
              setSelectedEdge(
                connectedEdges?.find((edge) => edge.name === e.target.value) ||
                  null
              );
            }}
          >
            <MenuItem value="">
              <Typography variant="body2">Select edge</Typography>
            </MenuItem>
            {connectedEdges
              ?.filter((e) => e.isConnected)
              .map((e) => (
                <MenuItem key={e.name} value={e.name}>
                  <Typography variant="body2">{e.name}</Typography>
                </MenuItem>
              ))}
          </CustomTextField>
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          alignContent="flex-end"
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              if (selectedEdge === null) {
                setError("An edge must be selected in order to connect.");
              } else {
                setError(null);
                deployToEdge({ edge: selectedEdge.name });
              }
            }}
            disabled={isLoading || isDeploying}
            className={classes.connectButton}
          >
            {isDeploying ? (
              <>
                <span style={{ visibility: "hidden" }}>Connect</span>
                <CircularProgress
                  size={20}
                  className={classes.buttonProgress}
                />
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </Grid>
        <Grid item xs={12} md={9}>
          {error && (
            <Alert severity="error" variant="outlined">
              <AlertTitle>Edge connection failed</AlertTitle>
              {error}
            </Alert>
          )}
          {isDeploySuccess && (
            <Alert severity="success" variant="outlined">
              <AlertTitle>Edge connected</AlertTitle>
              {`Your device successfully connected to ${selectedEdge?.name}.`}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default EdgeSetup;
