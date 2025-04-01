import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React from "react";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import RefreshIcon from "@material-ui/icons/Refresh";
import useIsMobileOrTab from "../api/useIsMobileOrTab";
import CloseIcon from "@material-ui/icons/Close";
import { formatDistanceToNow } from "date-fns";
import LastRefreshTime from "./LastRefreshTime";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    height: 300,
    display: "flex",
    border: "1px solid gray",
    position: "relative",
    marginTop: theme.spacing(1),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: "100%",
    objectFit: "contain",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export const FullScreenImage = ({
  deviceName,
  image,
  open,
  handleClose,
  refresh,
  isFetching,
}: {
  deviceName: string;
  image: { base64: string; timestamp: number };
  open: boolean;
  handleClose: () => void;
  refresh: () => void;
  isFetching: boolean;
}) => {
  const deviceType = useIsMobileOrTab();
  const classes = useStyles();

  return deviceType === "desktop" ? (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
      <DialogTitle>
        <>
          <Typography variant="h6">{deviceName}</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </>
        {image && image.timestamp && <LastRefreshTime image={image} />}
      </DialogTitle>
      <DialogContent
        style={{
          width: "100%",
          height: 700,
          display: "flex",
          border: "1px solid gray",
          position: "relative",
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        {isFetching && (
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
        <img
          src={image.base64}
          alt="Full Screen"
          style={{
            height: "100%",
            objectFit: "contain",
          }}
        />
        <Tooltip title="Refresh feed" arrow>
          <IconButton
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
              color: "black",
              backgroundColor: "white",
            }}
            onClick={refresh}
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          margin: 0,
          maxWidth: "100%",
          maxHeight: "100%",
          backgroundColor: "black",
        },
      }}
    >
      <DialogContent
        style={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        <IconButton
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={image.base64}
          alt="Full Screen"
          style={{
            maxWidth: "100%",
            maxHeight: "100vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

function Feed({
  deviceName,
  image,
  isFetching,
  isErrored,
  error,
  refresh,
}: {
  deviceName: string;
  image: { base64: string; timestamp: number } | null;
  isFetching: boolean;
  isErrored: boolean;
  error: string;
  refresh: () => void;
}) {
  const classes = useStyles();
  const [fullScreen, setFullScreen] = React.useState(false);

  return (
    <>
      {isErrored && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      {image && image.timestamp && <LastRefreshTime image={image} />}
      <Box className={classes.root}>
        {image ? (
          <Box
            height={"100%"}
            width={"100%"}
            display="flex"
            justifyContent="center"
            style={{ background: "black" }}
          >
            <img src={image.base64} className={classes.image} alt="Generated" />
            <Tooltip title="Refresh feed" arrow>
              <IconButton
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 1,
                  color: "black",
                  backgroundColor: "white",
                }}
                onClick={refresh}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Enter full screen" arrow>
              <IconButton
                style={{
                  position: "absolute",
                  top: 50,
                  right: 10,
                  zIndex: 1,
                  color: "black",
                  backgroundColor: "white",
                }}
                onClick={() => setFullScreen(!fullScreen)}
                size="small"
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" align="center" color="textSecondary">
              No camera feed
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              Enter RTSP credentials to connect a camera feed.
            </Typography>
          </Box>
        )}
        {isFetching && (
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
        {fullScreen && image && (
          <FullScreenImage
            deviceName={deviceName}
            image={image}
            open={fullScreen}
            handleClose={() => setFullScreen(false)}
            refresh={refresh}
            isFetching={isFetching}
          />
        )}
      </Box>
    </>
  );
}

export default Feed;
