import { useEffect, useState } from 'react';
import { ServerListResponseDto, ServerStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { ServerStatusPayload } from '~/routes/Servers/types';

/** The backend pages servers by at most 20 (a larger take is a 400). */
const PAGE = 20;

/** What the servers page reads from useServers. */
export type ServersQuery = ReturnType<typeof useServers>;

export const useServers = () => {
  const [servers, setServers] = useState<ServerListResponseDto['servers']>();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { serverApi } = useApi();

  // Every server, page by page: the tiles show them all at once.
  const handleGet = async () => {
    if (!serverApi) return;
    setLoading(true);
    try {
      const first = await serverApi.serverControllerGetAll({ take: PAGE, skip: 0 });
      const rest = [];
      for (let skip = PAGE; skip < first.data.total; skip += PAGE) {
        rest.push(serverApi.serverControllerGetAll({ take: PAGE, skip }));
      }
      const pages = await Promise.all(rest);
      setServers([...first.data.servers, ...pages.flatMap((page) => page.data.servers)]);
      setCount(first.data.total);
    } catch (e) {
      console.error('Error loading servers:', e);
    } finally {
      setLoading(false);
    }
  };

  // Patch the affected row in place — the lightweight `properties` (status/isOnline/
  // statusChangedAt) carries everything the badge + wake bar need, so no refetch.
  const patchServer = (
    serverId: string,
    patch: Partial<NonNullable<ServerListResponseDto['servers'][number]['properties']>>,
  ) =>
    setServers(
      (prev) => prev?.map((s) => (s.id === serverId ? { ...s, properties: { ...s.properties, ...patch } } : s)),
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
  useWebSocket<string>('server.online', (serverId) =>
    patchServer(serverId, { isOnline: true, status: ServerStatus.Online }),
  );
  useWebSocket<string>('server.offline', (serverId) =>
    patchServer(serverId, { isOnline: false, status: ServerStatus.Offline }),
  );
  // Structural changes (added/removed/renamed servers) still need a full refetch.
  useWebSocket('server.update', handleGet);

  useEffect(() => {
    handleGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverApi]);

  return { servers, loading, count };
};
