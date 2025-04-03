import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { Task } from '../components/Tasks';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';

interface UpdateTasksData {
  device: Device,
  tasks: Task[],
  edge: string
}

const addTasksToDeviceConfig = async (device: Device, tasks: Task[], systemKey: string, url: string, userToken: string) => {
  const response = await fetch(`${url}/api/v/1/collection/${systemKey}/device_configs`, {
    method: 'PUT',
    headers: {
      'Clearblade-UserToken': userToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      '$set': {
        'tasks': tasks,
        'root_path': device.rootPath
      },
      'query': {
        "FILTERS": [
          [
            {
              "EQ": [
                {
                  "device_id": device.deviceId
                }
              ]
            }
          ]
        ]
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add device details to collection: ${response.statusText}`);
  }

  return response.json();
}

export const useUpdateTasks = (onSuccess: (data: any) => void, onError: (error: Error) => void) => {
  return useMutation<any, Error, UpdateTasksData>(
    async ({device, tasks, edge}) => {
      const { systemKey, userToken } = getAuthInfo();
      const { url } = getPlatformInfo();
      console.log(`update tasks for ${device.deviceId}`);
      try {
        const updatedTasks = tasks.map(task => ({
          ...task,
          settings: {
            ...task.settings,
            root_path: device.rootPath
          }
        }));

        await addTasksToDeviceConfig(device, updatedTasks, systemKey, url, userToken);

        const updateTasksResponse = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/manageStreams`, {
          method: 'POST',
          headers: {
            'clearblade-edge': edge,
            'clearblade-systemkey': systemKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "action": "add_stream_tasks", 
            "body": {
              "camera_id": device.deviceId,
              "tasks": updatedTasks
            }
          }),
        });

        if (!updateTasksResponse.ok) {
          const text = await updateTasksResponse.text()
          console.error(text);
          throw new Error('Failed to update tasks. Please check logs.');
        }
        return updateTasksResponse.json();
      } catch (error) {
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      } 
    },
    {
      onSuccess,
      onError,
    }
  );
};