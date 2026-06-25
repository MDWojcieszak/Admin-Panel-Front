import { useCallback, useEffect, useState } from 'react';
import { SystemStatusResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

/**
 * Fetches `GET /system/status`. On-demand only — the backend runs real connectivity
 * checks (up to ~5s per subsystem when something is down), so this never polls.
 * Runs once on mount; call `refresh` to re-run.
 */
export const useSystemStatus = () => {
  const { systemApi } = useApi();
  const [data, setData] = useState<SystemStatusResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!systemApi) return;
    setLoading(true);
    setError(false);
    systemApi
      .systemControllerStatus()
      .then((res) => setData(res.data))
      .catch((e) => {
        console.error('Error loading system status:', e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [systemApi]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
};
