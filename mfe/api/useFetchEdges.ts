import { useQuery } from 'react-query';
import { Device } from '../components/EditableDeviceForm';
import { Task } from '../components/Tasks';
import { getPlatformInfo } from '../utils/platformInfo';
import { getAuthInfo } from '../utils/authInfo';
import { Edge } from '../components/EdgeSetup';

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

const fetchEdges = async (): Promise<Edge[]> => {
  const { url } = getPlatformInfo();
  const { systemKey, userToken } = getAuthInfo();

  const fetchEdgesResponse = await fetch(`${url}/api/v/4/webhook/execute/${systemKey}/rtsp_getEdges`, {
    method: 'POST',
    headers: {
      'Clearblade-UserToken': userToken,
      'clearblade-systemkey': systemKey,
      'Content-Type': 'application/json',
    }
  });

  if (!fetchEdgesResponse.ok) {
    throw new Error(`Failed to fetch edges: ${fetchEdgesResponse.statusText}`);
  }

  const data = await fetchEdgesResponse.json();
  // throw new Error(`Failed to fetch edges: ${fetchEdgesResponse.statusText}`);
  return data.results || [];
};

const useFetchEdges = () => {
  return useQuery(['edges'], () => fetchEdges(), {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export default useFetchEdges;