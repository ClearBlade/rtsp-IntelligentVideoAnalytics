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
import useIsMobileOrTab from "../hooks/useIsMobileOrTab";
import { MultiStepModalStep } from "../components/MultiStepModal/types";
import useFetchLatestFeed from "../api/useFetchLatestFeed";
import { useUpdateTasks } from "../api/useUpdateTasks";
import { Alert } from "@material-ui/lab";
import EdgeSetup, { Edge } from "../components/EdgeSetup";

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    height: "90vh",
  },
}));

interface IVASetupProps {
  edgeId: string;
  assets: { id: string; label: string; attributes: Record<string, string> }[];
}

export default function IVASetup(props: IVASetupProps) {
  const { edgeId, assets } = props;

  const classes = useStyles();

  const [openMFE, setOpenMFE] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [image, setImage] = useState<{
    base64: string;
    timestamp: number;
  } | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [edge, setEdge] = useState<Edge | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBucketSet, setSelectedBucketSet] = useState<{
    id: string;
    path: string;
  } | null>(device?.rootPath || null);
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
    edge?.name || ""
  );

  const { mutate: updateTasks, isLoading: isUpdatingTasks } = useUpdateTasks(
    () => {
      setOpenMFE(false);
      setIsSuccess(true);
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
      Title: "Connect to edge",
      Content: <EdgeSetup edge={edge} setEdge={setEdge} />,
      Actions: (
        <>
          <Button
            autoFocus
            onClick={() => setOpenMFE(false)}
            color="secondary"
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Button
            autoFocus
            onClick={() => setTabIndex((prev) => prev + 1)}
            color="primary"
            variant="contained"
            size="small"
            disabled={edge === null}
          >
            Next
          </Button>
        </>
      ),
    },
    {
      Title: "Overview",
      Content: (
        <EditableDeviceForm
          device={device || null}
          edgeId={edge?.name || ""}
          image={image}
          isSetup={true}
          refresh={refresh}
          isRefreshing={isFetching || isLoading}
          setImage={setImage}
          setDevice={setDevice}
          selectedBucketSet={selectedBucketSet || { id: "", path: "" }}
          setSelectedBucketSet={setSelectedBucketSet}
        />
      ),
      Actions: (
        <>
          <Button
            autoFocus
            onClick={() => setTabIndex((prev) => prev - 1)}
            color="secondary"
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Button
            autoFocus
            onClick={() => setTabIndex((prev) => prev + 1)}
            color="primary"
            variant="contained"
            size="small"
            disabled={image === null}
          >
            Next
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
            onClick={() => setTabIndex((prev) => prev - 1)}
            color="secondary"
            variant="text"
            size="small"
          >
            Back
          </Button>
          <Button
            autoFocus
            onClick={() => {
              if (device) {
                updateTasks({
                  device: {
                    ...device,
                    rootPath: selectedBucketSet || { id: "", path: "" },
                  },
                  tasks,
                  edge: edge?.name || "",
                });
              }
            }}
            color="primary"
            variant="contained"
            size="small"
            disabled={image === null}
          >
            {isUpdatingTasks ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      {deviceType === "desktop" ? (
        <>
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
            PaperProps={{
              style: {
                height: "80%",
                maxHeight: "80%",
                overflow: "auto",
              },
            }}
          >
            <DialogTitle id="form-dialog-title">
              {"New RTSP camera device"}
            </DialogTitle>
            <DialogContent style={{ padding: 0 }} dividers>
              <VerticalTabs
                tabs={steps}
                tabIndex={tabIndex}
                setTabIndex={setTabIndex}
                disabled={edge === null}
                image={image}
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
                  if (tabIndex !== 2) {
                    setTabIndex((prev) => prev + 1);
                  } else {
                    if (device) {
                      updateTasks({
                        device: {
                          ...device,
                          rootPath: selectedBucketSet || { id: "", path: "" },
                        },
                        tasks,
                        edge: edge?.name || "",
                      });
                    }
                  }
                }}
                color="primary"
                variant="contained"
                size="small"
                disabled={
                  tabIndex === 0
                    ? edge === null
                    : image === null || isUpdatingTasks
                }
              >
                {tabIndex !== 2 ? (
                  "Next"
                ) : isUpdatingTasks ? (
                  <CircularProgress size={20} />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogActions>
          </Dialog>
          {isSuccess && (
            <Snackbar
              open={true}
              autoHideDuration={4000}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              onClose={() => setIsSuccess(false)}
            >
              <Alert severity="success">Saved successfully</Alert>
            </Snackbar>
          )}
        </>
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
    </>
  );
}
