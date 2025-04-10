import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { Task } from '../components/Tasks';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';
import { Mappings } from '../components/Mapper';

interface UpdateTasksData {
  device: Device,
  tasks: Task[],
  edge: string
}

const addTasksToDeviceConfig = async (device: Device, tasks: Omit<Task, 'mappings' | 'isOpen'>[], systemKey: string, url: string, userToken: string) => {
  const response = await fetch(`${url}/api/v/1/collection/${systemKey}/rtsp_configs`, {
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

const addMappings = async (device: Device, tasks: Task[], systemKey: string, url: string, userToken: string) => {
  await Promise.all(tasks.map(async (task) => {
    return fetch(`${url}/api/v/4/collection/${systemKey}/rtsp_targets/upsert?conflictColumn=task_uuid`, {
      method: 'PUT',
      headers: {
        'Clearblade-UserToken': userToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_id: 'ia',
        device_id: device.deviceId,
        task_uuid: task.uuid,
        task_type: task.id,
        mappings: task.mappings
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to add mappings to collection: ${response.statusText}`);
      }
      return response.json();
    })
  }))
}

const addBucketToDeployment = async (edge: string, bucketSet: {id: string, path: string}, systemKey: string, url: string, userToken: string) => {
  const addBucketToDeploymentResponse = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/rtsp_addBucketToDeployment`, {
    method: 'POST',
    headers: {
      'Clearblade-UserToken': userToken,
      'clearblade-systemkey': systemKey,
      'Content-Type': 'application/json',
    },  
    body: JSON.stringify({
      "edge": edge,
      "bucketSet": bucketSet,
    }),
  });

  if (!addBucketToDeploymentResponse.ok) {
    throw new Error(`Failed to add bucket to deployment: ${addBucketToDeploymentResponse.statusText}`);
  }

  return Promise.resolve({ message: 'Bucket added to deployment.' });
}

export const useUpdateTasks = (onSuccess: (data: any) => void, onError: (error: Error) => void) => {
  return useMutation<any, Error, UpdateTasksData>(
    async ({device, tasks, edge}) => {
      const { systemKey, userToken } = getAuthInfo();
      const { url } = getPlatformInfo();
      console.log(`update tasks for ${device.deviceId}`);

      try {
        const updatedTasks = tasks.map(task => {
          const { mappings, isOpen, ...rest } = task;
          return {
            ...rest,
            settings: {
              ...rest.settings,
              root_path: device.rootPath
            }
          }
        })

        await Promise.all([
          addTasksToDeviceConfig(device, updatedTasks, systemKey, url, userToken),
          addMappings(device, tasks, systemKey, url, userToken),
          addBucketToDeployment(edge, device.rootPath, systemKey, url, userToken)
        ])

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