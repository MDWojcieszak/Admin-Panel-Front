import { useEffect, useState } from 'react';
import { ServerDetailsResponseDto, ServerStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { DEFAULT_WAKE_TIMEOUT_MS } from '~/routes/Servers/hooks/useWakeProgress';
import { ServerStatusPayload } from '~/routes/Servers/types';

type UseServerDetailsProps = {
  id?: string;
};

export const useServerDetails = ({ id }: UseServerDetailsProps) => {
  const { serverApi } = useApi();
  const [serverDetails, setServerDetails] = useState<ServerDetailsResponseDto>();
  const [powerLoading, setPowerLoading] = useState(false);
  // Wake deadline from the latest server.status event; REST doesn't carry it.
  const [wakeTimeoutMs, setWakeTimeoutMs] = useState(DEFAULT_WAKE_TIMEOUT_MS);

  const loadDetails = () => {
    if (!serverApi || !id) return false;
    serverApi.serverControllerGetDetails({ serverId: id }).then((d) => setServerDetails(d.data));
  };

  const patchProperties = (patch: Partial<ServerDetailsResponseDto['properties']>) =>
    setServerDetails((prev) => (prev ? { ...prev, properties: { ...prev.properties, ...patch } } : prev));

  const runPower = async (action: 'start' | 'stop' | 'reboot') => {
    if (!serverApi || !id) return;
    setPowerLoading(true);
    // Optimistic lifecycle status; the authoritative status + `since` arrive via
    // server.status. Stamp statusChangedAt now so the wake bar starts from 0 rather
    // than the stale REST value.
    patchProperties({
      status: action === 'start' ? ServerStatus.WakeInProgress : ServerStatus.ShutdownInProgress,
      statusChangedAt: new Date().toISOString(),
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

  // Primary source of truth — one event per transition, rendered straight from payload.
  useWebSocket<ServerStatusPayload>('server.status', (payload) => {
    if (payload?.serverId !== id) return;
    setWakeTimeoutMs(payload.wakeTimeoutMs || DEFAULT_WAKE_TIMEOUT_MS);
    patchProperties({
      status: payload.status,
      isOnline: payload.isOnline,
      statusChangedAt: payload.since,
    });
  });
  // Backward-compat: older backend emits id-only online/offline. server.status supersedes.
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
    wakeTimeoutMs,
    refresh: loadDetails,
    start: () => runPower('start'),
    stop: () => runPower('stop'),
    reboot: () => runPower('reboot'),
  };
};
