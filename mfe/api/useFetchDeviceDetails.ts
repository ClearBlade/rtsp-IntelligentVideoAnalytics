import { useQuery } from 'react-query';
import { Device } from '../components/EditableDeviceForm';

const fetchDeviceDetails = async (deviceId: string) => {
  return new Promise<Device>((resolve, reject) => {
      setTimeout(() => {
        return resolve({
          deviceId: "Test Device",
          deviceName: "testDevice",
          ip: "admin",
          password: "admin",
          port: "554",
          rtspUrl: "", //rtsp://admin:admin@192.168.10.10:554/stream1 
          streamingChannel: "stream1",
          username: "admin",
          rootPath: { id: "", path: "" },
        })
    }, 1000)});
};

const useFetchDeviceDetails = (deviceId: string) => {
  return useQuery(['deviceDetails', deviceId], () => fetchDeviceDetails(deviceId));
};

export default useFetchDeviceDetails;