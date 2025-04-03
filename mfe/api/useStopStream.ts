import { useMutation } from 'react-query';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';
import { stopStream } from './useCreateStream';

interface StreamData {
  edge: string;
  deviceId: string;
}

interface StreamResponse {
  message: string;
}

const updateDeviceDetails = async (deviceId: string, url: string, systemKey: string, userToken: string) => {
  const response = await fetch(`${url}/api/v/4/collection/${systemKey}/device_configs`, {
    method: 'PUT',
    headers: {
      'Clearblade-UserToken': userToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "$set": {
        "is_active": false,
        "last_updated": new Date().toISOString()
      },
      "query": {
        "FILTERS": [
          [
            {
              "EQ": [
                {
                  "device_id": deviceId
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


export const useStopStream = (onSuccess: (data: StreamResponse) => void) => {
  return useMutation<StreamResponse, Error, StreamData>(
    async ({deviceId, edge}) => {

      try {
        const { systemKey, userToken } = getAuthInfo();
        const { url } = getPlatformInfo();
        await stopStream(deviceId, url, systemKey, edge);
        await updateDeviceDetails(deviceId, url, systemKey, userToken);
        return { message: "Stream stopped" };
      } catch (error) {
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      }
    },
    {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (error) => {
        // Handle error
        // console.error('Error creating stream:', error);
      },
    }
  );
};