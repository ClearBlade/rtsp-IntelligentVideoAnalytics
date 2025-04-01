import React, { useState } from "react";
import VerticalTabs from "../components/VerticalTabs";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Snackbar,
  Theme,
} from "@material-ui/core";
import EditableDeviceForm, { Device } from "../components/EditableDeviceForm";
import Tasks, { Task } from "../components/Tasks";
import { MultiStepModal } from "../components/MultiStepModal";
import useIsMobileOrTab from "../api/useIsMobileOrTab";
import { MultiStepModalStep } from "../components/MultiStepModal/types";
import useFetchLatestFeed from "../api/useFetchLatestFeed";
import { usePlatformInfo } from "@clearblade/ia-mfe-react";
import { ConfigProvider } from "../context/ConfigContext";
import { useUpdateTasks } from "../api/useUpdateTasks";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    height: "90%",
  },
}));

interface IVASetupProps {
  systemKey: string;
  userToken: string;
  edgeId: string;
  assets: { id: string; label: string; attributes: Record<string, string> }[];
}

export default function IVASetup(props: IVASetupProps) {
  const { edgeId, assets, systemKey, userToken } = props;

  const { platformInfo } = usePlatformInfo();
  if (!platformInfo || !platformInfo.url) {
    return null;
  }

  const classes = useStyles();

  const [openMFE, setOpenMFE] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [image, setImage] = useState<{
    base64: string;
    timestamp: number;
  } | null>(null);
  const [device, setDevice] = useState<Device | null>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<Error | null>(null);
  // {
  //   username: "",
  //   password: "",
  //   rtspUrl: "test",
  //   ip: "",
  //   streamingChannel: "",
  //   port: "",
  //   deviceId: "test",
  //   deviceName: "test",
  //   rootPath: { id: "ia-images", path: "/tmp/clearblade_platform_buckets" },
  // }

  // {
  //   uuid: "1",
  //   name: "Task 1",
  //   isOpen: true,
  //   mappings: [],
  //   settings: {},
  //   type: "line_crossing",
  // },

  const { isLoading, isFetching, refetch } = useFetchLatestFeed(
    device?.deviceId || "",
    edgeId || "ivaEdge1", //TODO: Remove "ivaEdge1"
    platformInfo.url,
    systemKey,
    userToken
  );

  const {
    mutate: updateTasks,
    isLoading: isUpdatingTasks,
    error: updateTasksError,
    isError,
  } = useUpdateTasks(
    () => {
      setOpenMFE(false);
    },
    (error) => {
      setError(error);
    }
  );

  const refresh = async () => {
    if (device) {
      const { data } = await refetch();
      if (data) {
        setImage({
          base64: data.image,
          timestamp: Date.now(),
        });
      }
    }
  };

  const deviceType = useIsMobileOrTab();

  const handleTaskChange = (task: Task) => {
    console.log(task);
    setTasks((prev) => {
      if (!prev) return [];
      const newTasks = [...prev];
      const index = newTasks.findIndex((t) => t.uuid === task.uuid);
      if (index !== -1) {
        newTasks[index] = task;
      }
      return newTasks;
    });
  };

  const handleExpandAll = () => {
    setTasks((prev) => {
      if (!prev) return [];
      const anyExpanded = prev.some((task) => task.isOpen);
      return prev.map((task) => ({
        ...task,
        isOpen: !anyExpanded ? true : false,
      }));
    });
  };

  const handleDeleteTask = (uuid: string) => {
    setTasks((prev) => {
      if (!prev) return [];
      return prev.filter((task) => task.uuid !== uuid);
    });
  };

  const steps: MultiStepModalStep[] = [
    {
      Title: "Overview",
      Content: (
        <EditableDeviceForm
          device={device || null}
          edgeId={edgeId || "ivaEdge1"} // TODO: Remove "ivaEdge1"
          image={image}
          tasks={tasks}
          setTasks={setTasks}
          isSetup={true}
          refresh={refresh}
          isRefreshing={isFetching || isLoading}
          setImage={setImage}
          setDevice={setDevice}
        />
      ),
      Actions: (
        <>
          <Button
            autoFocus
            onClick={() =>
              tabIndex === 0
                ? setOpenMFE(false)
                : setTabIndex((prev) => prev - 1)
            }
            color="secondary"
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Button
            autoFocus
            onClick={() => {
              if (tabIndex === 0) {
                setTabIndex((prev) => prev + 1);
              } else {
                // save
                console.log("saving: ", device, tasks);
                setOpenMFE(false);
              }
            }}
            color="primary"
            variant="contained"
            size="small"
            disabled={image === null}
          >
            {tabIndex === 0 ? "Next" : "Save"}
          </Button>
        </>
      ),
    },
    {
      Title: "Tasks",
      Content: (
        <Tasks
          deviceId={device?.deviceId || ""}
          edgeId={edgeId}
          assets={assets}
          image={image}
          tasks={tasks}
          refresh={refresh}
          isRefreshing={isFetching || isLoading}
          setTasks={setTasks}
          onTaskChange={handleTaskChange}
          handleExpandAll={handleExpandAll}
          handleDeleteTask={handleDeleteTask}
        />
      ),
      Actions: (
        <>
          <Button
            autoFocus
            onClick={() =>
              tabIndex === 0
                ? setOpenMFE(false)
                : setTabIndex((prev) => prev - 1)
            }
            color="secondary"
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Button
            autoFocus
            onClick={() => {
              if (tabIndex === 0) {
                setTabIndex((prev) => prev + 1);
              } else {
                // save
                console.log("saving: ", device, tasks);
                setOpenMFE(false);
              }
            }}
            color="primary"
            variant="contained"
            size="small"
            disabled={image === null}
          >
            {tabIndex === 0 ? "Next" : "Save"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <ConfigProvider
      systemKey={systemKey}
      userToken={userToken}
      platformURL={platformInfo.url}
    >
      {deviceType === "desktop" ? (
        <Dialog
          scroll="paper"
          fullWidth
          maxWidth="md"
          disablePortal
          open={openMFE}
          onClose={() => {
            setOpenMFE(false);
          }}
          aria-labelledby="form-dialog-title"
          className={classes.dialog}
        >
          <DialogTitle id="form-dialog-title">
            {"New RTSP camera device"}
          </DialogTitle>
          <DialogContent style={{ padding: 0 }} dividers>
            <VerticalTabs
              tabs={steps}
              tabIndex={tabIndex}
              setTabIndex={setTabIndex}
              disabled={image === null}
            />
            {error && (
              <Snackbar
                open={true}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={() => setError(null)}
              >
                <Alert severity="error">{error.message}</Alert>
              </Snackbar>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() =>
                tabIndex === 0
                  ? setOpenMFE(false)
                  : setTabIndex((prev) => prev - 1)
              }
              color="secondary"
              variant="text"
              size="small"
            >
              Back
            </Button>
            <Button
              autoFocus
              onClick={async () => {
                if (tabIndex === 0) {
                  setTabIndex((prev) => prev + 1);
                } else {
                  // TODO save and add device rootpath to tasks
                  console.log("saving: ", device, tasks, edgeId);
                  if (device) {
                    updateTasks({
                      device,
                      tasks,
                      platformURL: platformInfo.url,
                      systemKey,
                      token: userToken,
                      edge: edgeId || "ivaEdge1", //TODO: Remove "ivaEdge1",
                    });
                  }
                }
              }}
              color="primary"
              variant="contained"
              size="small"
              disabled={image === null || isUpdatingTasks}
            >
              {tabIndex === 0 ? (
                "Next"
              ) : isUpdatingTasks ? (
                <CircularProgress size={20} />
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
        <MultiStepModal
          MainTitle="New RTSP camera device"
          steps={steps}
          open={openMFE}
          onClose={() => setOpenMFE(false)}
          setActiveStepIdx={(idx) => {
            setTabIndex(idx);
          }}
          activeStepIdx={tabIndex}
          disableNextSteps={image === null}
        />
      )}
    </ConfigProvider>
  );
}
