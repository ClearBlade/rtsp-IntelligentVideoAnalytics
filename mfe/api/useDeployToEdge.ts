import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { getErrorMessage } from '../helpers/getErrorMessage';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';
import { stopStream } from './useCreateStream';
import { addLatestDeviceFrameToHistory } from './useCreateStream';

interface DeployToEdgeData {
  edge: string;
}

interface DeployToEdgeResponse {
  message: string;
}


export const useDeployToEdge = (onSuccess: () => void, onError: (error: Error) => void) => {
  return useMutation<DeployToEdgeResponse, Error, DeployToEdgeData>(
    async ({edge}) => {
      const { url } = getPlatformInfo();
      const { systemKey, userToken } = getAuthInfo();

      const deployToEdgeResponse = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/rtsp_deployToEdge`, {
        method: 'POST',
        headers: {
          'Clearblade-UserToken': userToken,
          'clearblade-systemkey': systemKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "edge": edge,
        }),
      });

      if (!deployToEdgeResponse.ok) {
        throw new Error(`Failed to deploy to edge: ${deployToEdgeResponse.statusText}`);
      }

      return Promise.resolve({ message: 'Deployment and adapter connection successful.' });
    },
    {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        onError(error);
      },
    }
  );
};
