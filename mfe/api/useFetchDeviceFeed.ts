import { useQuery } from 'react-query';
import { getAuthInfo } from '../utils/authInfo';
import { getPlatformInfo } from '../utils/platformInfo';

interface DeviceFeed {
  device_id: string;
  frame_b64: string;
  last_updated: string;
}

const fetchDeviceFeed = async (deviceId: string): Promise<{image: string, timestamp: string}> => {
  const { url } = getPlatformInfo();
  const { systemKey, userToken } = getAuthInfo();
  
  const queryString = `?query=${encodeURIComponent(JSON.stringify({ device_id: deviceId }))}`;
  const response = await fetch(`${url}/api/v/1/collection/${systemKey}/rtsp_feeds${queryString}`, {
    headers: {
      'Clearblade-UserToken': userToken,
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch device feed: ${response.statusText}`);
  }

  const data = await response.json() as {DATA: DeviceFeed[], TOTAL: number};

  if (data.TOTAL === 0) {
    return {
      image: '',
      timestamp: ''
    }
  }

  return {
    image: data.DATA[0].frame_b64,
    timestamp: data.DATA[0].last_updated,
  }
};
const useFetchDeviceFeed = (deviceId: string) => {
  return useQuery('deviceFeed', () => fetchDeviceFeed(deviceId));
};

export default useFetchDeviceFeed;