import { useCallback, useEffect, useState } from 'react';
import { CommandResponseDto, CommandRuntimeStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { ServerCommandUpdatePayload } from '~/routes/Servers/types';

export type CommandRuntime = {
  runtimeStatus?: CommandRuntimeStatus;
  runningProgress?: number;
};

export const useCommands = (categoryId: string) => {
  const { serverApi } = useApi();
  const [commands, setCommands] = useState<CommandResponseDto[]>();
  // Runtime phase/progress is live-only (no longer part of CommandResponseDto).
  const [runtime, setRuntime] = useState<Record<string, CommandRuntime>>({});
  const [loading, setLoading] = useState(false);

  const handleGet = useCallback(async () => {
    if (!serverApi || !categoryId) return;
    setLoading(true);
    try {
      const { data } = await serverApi.serverCommandsControllerGetCommands({ categoryId });
      setCommands(data.commands);
    } catch (e) {
      console.error('Error getting server commands list:', e);
    } finally {
      setLoading(false);
    }
  }, [serverApi, categoryId]);

  useWebSocket<ServerCommandUpdatePayload>('server-command.update', (payload) => {
    setRuntime((prev) => ({
      ...prev,
      [payload.commandId]: {
        runtimeStatus: payload.runtimeStatus,
        runningProgress: payload.runningProgress,
      },
    }));
  });

  useEffect(() => {
    handleGet();
  }, [handleGet]);

  return { commands, runtime, loading, refresh: handleGet };
};
