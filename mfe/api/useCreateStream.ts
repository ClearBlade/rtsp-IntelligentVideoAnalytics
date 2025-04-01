import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { getErrorMessage } from '../helpers/getErrorMessage';

interface StreamData {
  platformURL: string;
  systemKey: string;
  token: string;
  edge: string;
  credentials: Device
}

interface StreamResponse {
  image: string;
}

const getRTSPUrl = (credentials: Device) => {
  const {username, password, ip, port, rtspUrl, streamingChannel} = credentials;
  return rtspUrl || `rtsp://${username}:${password}@${ip}:${port}/${streamingChannel}`;
}

export const addLatestDeviceFrameToHistory = async (deviceId: string, image: string, platformURL: string, systemKey: string, token: string) => {
  if (!systemKey || !platformURL) {
    throw new Error('systemKey or platform info or edgeId missing.');
  }

  const headers = {
    'Clearblade-DevToken': token,
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${platformURL}/api/v/4/collection/${systemKey}/device_feeds/upsert?conflictColumn=device_id`, {
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

export const useCreateStream = (onSuccess: (data: StreamResponse) => void) => {
  return useMutation<StreamResponse, Error, StreamData>(
    async ({credentials, edge, platformURL, systemKey, token}) => {
      console.log(`initiate stream for ${edge} with ${JSON.stringify(credentials)}`);
      if (!systemKey || !edge || !platformURL) {
        throw new Error('systemKey or platform info or edgeId missing.');
      }

      const baseHeaders = {
        // 'Clearblade-UserToken': token, // Can't give the IA user token to the edge 
        'clearblade-edge': edge,
        'clearblade-systemkey': systemKey,
        'Content-Type': 'application/json',
      }

      try {
        const startStreamResponse = await fetch(`${platformURL}/api/v/4/webhook/execute/${systemKey}/manageStreams`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            "action": "restart_stream", // stops and starts the stream
            "body": {
              "camera_id": credentials.deviceId,
              "camera_url": getRTSPUrl(credentials),
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

        // TODO - Add device details to file/collection
        await addLatestDeviceFrameToHistory(credentials.deviceId, image, platformURL, systemKey, token);
        
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