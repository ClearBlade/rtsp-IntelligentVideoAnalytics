import { useQuery } from 'react-query';
import { Task } from '../components/Tasks';
import { getPlatformInfo } from '../utils/platformInfo';
import { getAuthInfo } from '../utils/authInfo';
type BucketSet = {
  edge_config: {
    root: string;
  };
  edge_storage: string; 
  name: string;
  platform_config: {
    bucket_name: string;
    credentials: {
      auth_provider_x509_cert_url: string;
      auth_uri: string;
      token_uri: string;
      type: string;
    };
  };
  platform_storage: string; 
  system_key: string;
};


const fetchBucketSets = async (): Promise<BucketSet[]> => {
  const { url } = getPlatformInfo();
  const { systemKey, userToken } = getAuthInfo();
  try {
    const response = await fetch(`${url}/api/v/4/bucket_sets/${systemKey}`, {
      headers: {
        'Clearblade-DevToken': userToken
      }
    });

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error(response.statusText);
  }
    return response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

const useFetchBucketSets = () => {
  return useQuery<BucketSet[], Error>('bucketSets', () => fetchBucketSets());
};

export default useFetchBucketSets;