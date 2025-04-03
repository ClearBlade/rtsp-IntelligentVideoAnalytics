import { useQuery } from 'react-query';
import { Device } from '../components/EditableDeviceForm';
import { Task } from '../components/Tasks';
import { getPlatformInfo } from '../utils/platformInfo';
import { getAuthInfo } from '../utils/authInfo';

interface DeviceConfig {
  device_id: string;
  device_name: string;
  credentials: {
    username: string;
    password: string;
    ip: string;
    port: string;
    streamingChannel: string;
    rtspUrl: string;
  }
  root_path: {
    id: string;
    path: string;
  };
  tasks: Task[];
  last_updated: string;
  last_active_time: string;
  is_active: boolean;
  edge: string;
}

const fetchDeviceDetails = async (deviceId: string): Promise<Device & { tasks: Task[] }> => {
  const { url } = getPlatformInfo();
  const { systemKey, userToken } = getAuthInfo();

  const queryString = `?query=${encodeURIComponent(JSON.stringify({ device_id: deviceId }))}`;

  const response = await fetch(`${url}/api/v/1/collection/${systemKey}/device_configs${queryString}`, {
    method: 'GET',
    headers: {
      'Clearblade-UserToken': userToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch device details: ${response.statusText}`);
  }

  const data = await response.json() as {DATA: DeviceConfig[], TOTAL: number};

  if (data.DATA.length === 0) {
    throw new Error(`Device details not found for device_id: ${deviceId}`);
  }

  const deviceConfig = data.DATA[0];

  return {
    deviceId: deviceConfig.device_id,
    deviceName: deviceConfig.device_name,
    ip: deviceConfig.credentials.ip,
    password: deviceConfig.credentials.password,
    port: deviceConfig.credentials.port,
    rtspUrl: deviceConfig.credentials.rtspUrl,
    streamingChannel: deviceConfig.credentials.streamingChannel,
    username: deviceConfig.credentials.username,
    rootPath: deviceConfig.root_path,
    tasks: deviceConfig.tasks,
  };
};

const useFetchDeviceDetails = (deviceId: string) => {
  return useQuery(['deviceDetails', deviceId], () => fetchDeviceDetails(deviceId));
};

export default useFetchDeviceDetails;