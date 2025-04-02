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


export const useUpdateTasks = (onSuccess: (data: any) => void, onError: (error: Error) => void) => {
  return useMutation<any, Error, UpdateTasksData>(
    async ({device, tasks, edge}) => {
      const { systemKey } = getAuthInfo();
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

        // TODO: Add tasks to device config in files/collections

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