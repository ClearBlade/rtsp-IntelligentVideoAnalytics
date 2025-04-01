import { useQuery } from 'react-query';
import { Task } from '../components/Tasks';

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


const fetchBucketSets = async (platformURL: string, systemKey: string, token: string): Promise<BucketSet[]> => {
  try {
    const response = await fetch(`${platformURL}/api/v/4/bucket_sets/${systemKey}`, {
      headers: {
        'Clearblade-DevToken': token
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

const useFetchBucketSets = (platformURL: string, systemKey: string, token: string) => {
  return useQuery<BucketSet[], Error>('bucketSets', () => fetchBucketSets(platformURL, systemKey, token));
};

export default useFetchBucketSets;