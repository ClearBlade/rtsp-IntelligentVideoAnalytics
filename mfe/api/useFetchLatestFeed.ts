import { useQuery } from 'react-query';
import { Device } from '../components/EditableDeviceForm';
import { addLatestDeviceFrameToHistory } from './useCreateStream';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';

const fetchLatestFeed = async (deviceId: string, edgeId: string) => {
  const { systemKey, userToken } = getAuthInfo();
  const { url } = getPlatformInfo();

  if (!url || !systemKey) {
    throw new Error('Platform URL or system key is missing');
  }

  console.log(`fetching latest feed for ${deviceId} on ${url} with system key ${systemKey}`);

  const response = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/manageStreams`, {
    method: 'POST',
    headers: {
      'clearblade-edge': edgeId,
      'clearblade-systemkey': systemKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "action": "get_stream_image",
      "body": {
        "camera_id": deviceId,
      }
    }),
  });

  if (response.status !== 200) {
    const text = await response.text()
    console.error('text: ', text);
    throw new Error('Failed to fetch latest feed. Please check logs.');
  }

  const responseData = await response.json();
  
  await addLatestDeviceFrameToHistory(deviceId, responseData.results.image, url, systemKey, userToken);

  return { image: responseData.results.image };
};

const useFetchLatestFeed = (deviceId: string, edgeId: string) => {
  return useQuery('latestFeed', () => fetchLatestFeed(deviceId, edgeId), { enabled: false });
};

export default useFetchLatestFeed;