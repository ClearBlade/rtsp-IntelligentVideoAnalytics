import React, { useState } from "react";
import { Box, makeStyles, Paper, Tab, Tabs } from "@material-ui/core";
import EditableDeviceForm, { Device } from "../components/EditableDeviceForm";
import { Task } from "../components/Tasks";
import useFetchDeviceDetails from "../api/useFetchDeviceDetails";
import useFetchDeviceFeed from "../api/useFetchDeviceFeed";
import TaskTable from "../components/TaskTable";
import useFetchLatestFeed from "../api/useFetchLatestFeed";
import useIsMobileOrTab from "../hooks/useIsMobileOrTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const deviceType = useIsMobileOrTab();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: deviceType === "desktop" ? "50%" : "100%" }}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const IVADetails = (props: {
  image: string;
  device: Device;
  tasks: Task[];
}) => {
  const deviceType = useIsMobileOrTab();
  const [value, setValue] = useState(0);
  const [image, setImage] = useState<{
    base64: string;
    timestamp: number;
  } | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>([]);

  const {
    data: deviceDetails,
    isLoading: isDeviceLoading,
    isError: isDeviceError,
    error: deviceError,
  } = useFetchDeviceDetails("hik101");
  // const {
  //   data: deviceTasks,
  //   isLoading: isTasksLoading,
  //   isError: isTasksError,
  //   error: tasksError,
  // } = useFetchDeviceTasks("test");
  const {
    data: deviceFeed,
    isLoading: isFeedLoading,
    isError: isFeedError,
    error: feedError,
  } = useFetchDeviceFeed("hik101"); // this is the previously saved feed
  const {
    isLoading: isLoadingLatestFeed,
    isFetching: isFetchingLatestFeed,
    refetch: refetchLatestFeed,
  } = useFetchLatestFeed(device?.deviceId || "", deviceDetails?.edge || ""); // this is the refetching the latest feed

  const refresh = async () => {
    if (device) {
      const { data } = await refetchLatestFeed();
      if (data) {
        setImage({
          base64: data.image,
          timestamp: Date.now(),
        });
      }
    }
  };

  const isLoading = isDeviceLoading || isFeedLoading;
  const isError = isDeviceError || isFeedError;

  // Update state based on deviceDetails and deviceFeed
  if (deviceDetails && !device) {
    setDevice(deviceDetails);
    setTasks(deviceDetails.tasks);
  }
  if (deviceFeed && !image) {
    setImage({
      base64: deviceFeed.image,
      timestamp: new Date(deviceFeed.timestamp).getTime(),
    });
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTaskChange = (task: Task) => {
    console.log(task);
    setTasks((prev) => {
      if (!prev) return null;
      const newTasks = [...prev];
      const index = newTasks.findIndex((t) => t.uuid === task.uuid);
      if (index !== -1) {
        newTasks[index] = task;
      }
      return newTasks;
    });
  };

  const handleDeleteTask = (uuid: string) => {
    setTasks((prev) => {
      if (!prev) return null;
      return prev.filter((task) => task.uuid !== uuid);
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>{`Error occurred while fetching data: ${
        deviceError || feedError
      }`}</div>
    );
  }

  return (
    <Box>
      <Paper square>
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label="Details" {...a11yProps(0)} />
          <Tab label="Tasks" {...a11yProps(1)} />
        </Tabs>
      </Paper>
      <TabPanel value={value} index={0}>
        <EditableDeviceForm
          device={device}
          edgeId={deviceDetails?.edge || ""}
          image={image}
          setDevice={setDevice}
          setImage={setImage}
          isSetup={false}
          refresh={refresh}
          isRefreshing={isFetchingLatestFeed || isLoadingLatestFeed}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {tasks && (
          <TaskTable
            device={device}
            edgeId={deviceDetails?.edge || ""}
            tasks={tasks}
            image={image}
            handleTaskChange={handleTaskChange}
            handleDeleteTask={handleDeleteTask}
            setTasks={setTasks}
          />
        )}
      </TabPanel>
    </Box>
  );
};

export default IVADetails;
