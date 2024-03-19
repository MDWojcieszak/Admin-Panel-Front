import { useEffect, useState } from 'react';
import { ServerService, ServerType } from '~/api/Server';

export const useServers = () => {
  const [servers, setServers] = useState<ServerType[]>();
  const [loading, setLoading] = useState(false);
  const handleGet = async () => {
    try {
      const response = await ServerService.getAll();
      setServers(response.servers);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleGet();
  }, []);

  return {
    servers,
    loading,
  };
};
