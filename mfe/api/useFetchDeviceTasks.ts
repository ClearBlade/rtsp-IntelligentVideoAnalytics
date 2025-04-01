import { useQuery } from 'react-query';
import { Task } from '../components/Tasks';

const fetchDeviceTasks = async (deviceId: string) => {
  return new Promise<Task[]>((resolve, reject) => {
    setTimeout(() => {
      return resolve([
        {
          uuid: "8e2da6ae-d544-4c89-8abf-332c786b4932",
          name: "Count number of people",
          type: "object_detection",
          isOpen: false,
          settings: {
            "objects_to_detect": {
              "person": {
                "show_labels": true,
                "enable_tracking": false,
                "show_boxes": true,
                "blur_faces": false
              }
            }
          },
          mappings: []
        }
      ])
  }, 1000)});
};

const useFetchDeviceTasks = (deviceId: string) => {
  return useQuery('deviceTasks', () => fetchDeviceTasks(deviceId));
};

export default useFetchDeviceTasks;