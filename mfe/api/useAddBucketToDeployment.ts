import { useMutation } from 'react-query';
import { Device } from "../components/EditableDeviceForm";
import { getErrorMessage } from '../helpers/getErrorMessage';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';
import { stopStream } from './useCreateStream';
import { addLatestDeviceFrameToHistory } from './useCreateStream';

interface AddBucketToDeploymentData {
  edge: string;
  bucketSet: {id: string, path: string};
}

interface AddBucketToDeploymentResponse {
  message: string;
}


export const useAddBucketToDeployment = (onSuccess: () => void, onError: (error: Error) => void) => {
  return useMutation<AddBucketToDeploymentResponse, Error, AddBucketToDeploymentData>(
    async ({edge, bucketSet}) => {
      const { url } = getPlatformInfo();
      const { systemKey, userToken } = getAuthInfo();

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
