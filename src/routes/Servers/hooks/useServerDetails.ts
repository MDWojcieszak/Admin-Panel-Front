import { useEffect, useState } from 'react';
import { ServerDetailsResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';

type UseServerDetailsProps = {
  id?: string;
};

export const useServerDetails = ({ id }: UseServerDetailsProps) => {
  const { serverApi } = useApi();
  const [serverDetails, setServerDetails] = useState<ServerDetailsResponseDto>();
  const loadDetails = () => {
    if (!serverApi || !id) return false;
    serverApi.serverControllerGetDetails({ serverId: id }).then((d) => setServerDetails(d.data));
  };

  useWebSocket('server.offline', () =>
    setServerDetails((prev) => ({ ...prev, properties: { ...prev.properties, isOnline: false } })),
  );
  useWebSocket('server.online', () =>
    setServerDetails((prev) => ({ ...prev, properties: { ...prev.properties, isOnline: true } })),
  );
  useWebSocket('server.update', loadDetails);

  useEffect(() => {
    loadDetails();
  }, []);

  return { serverDetails };
};
