import { useEffect, useState } from 'react';
import { ProcessLog, ServerProcessStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';
import { ProcessLogPayload, ProcessProgressPayload, ProcessStatusPayload } from '~/routes/Servers/types';

/** Loads historical logs for a process and keeps it live via process.* events. */
export const useProcess = (processId?: string) => {
  const { serverApi } = useApi();
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState<string>();
  const [status, setStatus] = useState<ServerProcessStatus>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serverApi || !processId) return;
    setLogs([]);
    setProgress(0);
    setLabel(undefined);
    setStatus(undefined);
    setLoading(true);
    // Logs come back DESC — reverse for chronological terminal output.
    serverApi
      .serverProcessControllerGetAllLogs({ id: processId, take: 20, skip: 0 })
      .then(({ data }) => setLogs([...data.logs].reverse()))
      .catch((e) => console.error('Error loading process logs:', e))
      .finally(() => setLoading(false));
    serverApi
      .serverProcessControllerGetOne({ id: processId })
      .then(({ data }) => {
        setStatus(data.status);
        setProgress(data.progress ?? 0);
      })
      .catch((e) => console.error('Error loading process:', e));
  }, [serverApi, processId]);

  useWebSocket<ProcessLogPayload>('process.log', (payload) => {
    if (payload.processId !== processId) return;
    setLogs((prev) => [
      ...prev,
      { id: payload.id, message: payload.message, level: payload.level, timestamp: payload.timestamp },
    ]);
  });
  useWebSocket<ProcessProgressPayload>('process.progress', (payload) => {
    if (payload.processId !== processId) return;
    setProgress(payload.progress);
    setLabel(payload.label);
  });
  useWebSocket<ProcessStatusPayload>('process.status', (payload) => {
    if (payload.processId !== processId) return;
    setStatus(payload.status);
    setProgress(payload.progress);
  });

  return { logs, progress, label, status, loading };
};
