import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { ServerListResponseDto, ServerStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { ServerStatusPayload } from '~/routes/Servers/types';

export const useServers = () => {
  const [servers, setServers] = useState<ServerListResponseDto['servers']>();
  const [count, setCount] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const [loading, setLoading] = useState(false);
  const { serverApi } = useApi();

  const handleGet = async () => {
    try {
      if (!serverApi) throw new Error('Server api not avaliable');
      serverApi
        .serverControllerGetAll({ take: pagination.pageSize, skip: pagination.pageIndex * pagination.pageSize })
        .then((s) => {
          setServers(s.data.servers);
          setCount(s.data.total);
        });
    } catch (e) {
      setLoading(false);
    }
  };

  // Patch the affected row in place — the lightweight `properties` (status/isOnline/
  // statusChangedAt) carries everything the badge + wake bar need, so no refetch.
  const patchServer = (serverId: string, patch: Partial<NonNullable<ServerListResponseDto['servers'][number]['properties']>>) =>
    setServers((prev) =>
      prev?.map((s) => (s.id === serverId ? { ...s, properties: { ...s.properties, ...patch } } : s)),
    );

  useWebSocket<ServerStatusPayload>('server.status', (payload) => {
    if (!payload?.serverId) return;
    patchServer(payload.serverId, {
      status: payload.status,
      isOnline: payload.isOnline,
      statusChangedAt: payload.since,
    });
  });
  // Backward-compat with the id-only online/offline events; server.status supersedes them.
  useWebSocket<string>('server.online', (serverId) => patchServer(serverId, { isOnline: true, status: ServerStatus.Online }));
  useWebSocket<string>('server.offline', (serverId) => patchServer(serverId, { isOnline: false, status: ServerStatus.Offline }));
  // Structural changes (added/removed/renamed servers) still need a full refetch.
  useWebSocket('server.update', handleGet);

  useEffect(() => {
    handleGet();
  }, [pagination]);

  return {
    servers,
    loading,
    pagination,
    count,
    setPagination,
  };
};
