import { useEffect, useState } from 'react';
import { ServerDetailsResponseDto, ServerStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';

type UseServerDetailsProps = {
  id?: string;
};

export const useServerDetails = ({ id }: UseServerDetailsProps) => {
  const { serverApi } = useApi();
  const [serverDetails, setServerDetails] = useState<ServerDetailsResponseDto>();
  const [powerLoading, setPowerLoading] = useState(false);

  const loadDetails = () => {
    if (!serverApi || !id) return false;
    serverApi.serverControllerGetDetails({ serverId: id }).then((d) => setServerDetails(d.data));
  };

  const patchProperties = (patch: Partial<ServerDetailsResponseDto['properties']>) =>
    setServerDetails((prev) => (prev ? { ...prev, properties: { ...prev.properties, ...patch } } : prev));

  const runPower = async (action: 'start' | 'stop' | 'reboot') => {
    if (!serverApi || !id) return;
    setPowerLoading(true);
    // Optimistic lifecycle status; the real ONLINE/OFFLINE arrives via WS events.
    patchProperties({
      status: action === 'start' ? ServerStatus.WakeInProgress : ServerStatus.ShutdownInProgress,
    });
    try {
      if (action === 'start') await serverApi.serverControllerStart({ serverId: id });
      else if (action === 'stop') await serverApi.serverControllerStop({ serverId: id });
      else await serverApi.serverControllerReboot({ serverId: id });
    } catch (e) {
      console.error(`Error performing ${action} on server:`, e);
      loadDetails();
    } finally {
      setPowerLoading(false);
    }
  };

  useWebSocket<string>('server.offline', (serverId) => {
    if (serverId === id) patchProperties({ isOnline: false, status: ServerStatus.Offline });
  });
  useWebSocket<string>('server.online', (serverId) => {
    if (serverId === id) patchProperties({ isOnline: true, status: ServerStatus.Online });
  });
  useWebSocket<string>('server.update', (serverId) => {
    if (!serverId || serverId === id) loadDetails();
  });

  useEffect(() => {
    loadDetails();
  }, [id]);

  return {
    serverDetails,
    powerLoading,
    refresh: loadDetails,
    start: () => runPower('start'),
    stop: () => runPower('stop'),
    reboot: () => runPower('reboot'),
  };
};
