import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { getErrorMessage } from '../helpers/getErrorMessage';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';
interface StreamData {
  edge: string;
  device: Device
}

interface StreamResponse {
  image: string;
}

const getRTSPUrl = (credentials: Device) => {
  const {username, password, ip, port, rtspUrl, streamingChannel} = credentials;
  return rtspUrl || `rtsp://${username}:${password}@${ip}:${port}/${streamingChannel}`;
}

export const addLatestDeviceFrameToHistory = async (deviceId: string, image: string, url: string, systemKey: string, userToken: string) => {
  if (!systemKey || !url) {
    throw new Error('systemKey or platform info or edgeId missing.');
  }

  const headers = {
    'Clearblade-DevToken': userToken,
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${url}/api/v/4/collection/${systemKey}/device_feeds/upsert?conflictColumn=device_id`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({
      last_updated: new Date().toISOString(),
      device_id: deviceId,
      frame_b64: image,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add device feed.');
  }

  return response.json();
}

const addDeviceDetailsToCollection = async (device: Device, edge: string, url: string, systemKey: string, userToken: string) => {
  const response = await fetch(`${url}/api/v/4/collection/${systemKey}/device_configs/upsert?conflictColumn=device_id`, {
    method: 'PUT',
    headers: {
      'Clearblade-UserToken': userToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      last_updated: new Date().toISOString(),
      last_active_time: new Date().toISOString(),
      is_active: true,
      device_id: device.deviceId,
      device_name: device.deviceName,
      credentials: { 
        username: device.username, 
        password: device.password, 
        ip: device.ip, 
        port: device.port, 
        rtspUrl: device.rtspUrl, 
        streamingChannel: device.streamingChannel 
      },
      root_path: device.rootPath,
      tasks: [],
      edge: edge
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add device details to collection: ${response.statusText}`);
  }

  return response.json();
}

export const stopStream = async (deviceId: string, url: string, systemKey: string, edge: string) => {
  const response = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/manageStreams`, {
    method: 'POST',
    headers: {
      // 'Clearblade-UserToken': token, // Can't give the IA user token to the edge 
      'clearblade-edge': edge,
      'clearblade-systemkey': systemKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "action": "stop_stream", // stops and starts the stream
      "body": {
        "camera_id": deviceId,
      }
    }),
  });

  if (response.status === 404 || response.status === 200) {
    return;
  }

  if (!response.ok) {
    throw new Error(response.statusText);
  }
}

export const useCreateStream = (onSuccess: (data: StreamResponse) => void) => {
  return useMutation<StreamResponse, Error, StreamData>(
    async ({device, edge}) => {

      const { systemKey, userToken } = getAuthInfo();
      const { url } = getPlatformInfo();

      console.log(`initiate stream for ${edge} with ${JSON.stringify(device)}`);
      if (!systemKey || !edge || !url) {
        throw new Error('systemKey or platform info or edgeId missing.');
      }

      const baseHeaders = {
        // 'Clearblade-UserToken': token, // Can't give the IA user token to the edge 
        'clearblade-edge': edge,
        'clearblade-systemkey': systemKey,
        'Content-Type': 'application/json',
      }

      try {
        const startStreamResponse = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/manageStreams`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            "action": "restart_stream", // stops and starts the stream
            "body": {
              "camera_id": device.deviceId,
              "camera_url": getRTSPUrl(device),
              "tasks": []
            }
          }),
        });

        if (!startStreamResponse.ok) {
          const text = await startStreamResponse.text()
          console.error(text);
          throw new Error('Failed to start stream. Please check logs.');
        }
        const startStreamResponseData = await startStreamResponse.json();
        const image = startStreamResponseData.results.image;

        await Promise.all([
          addLatestDeviceFrameToHistory(device.deviceId, image, url, systemKey, userToken),
          addDeviceDetailsToCollection(device, edge, url, systemKey, userToken),
        ]).catch((error) => {
          stopStream(device.deviceId, url, systemKey, edge);
          throw error;
        });

        return { image: image };
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