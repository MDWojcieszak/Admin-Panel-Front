import { useEffect, useState } from 'react';
import { DashboardTrendsResponseDto, TrendsRange } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';

export const useDashboardTrends = () => {
  const { dashboardApi } = useApi();
  const can = useCan();
  const canRead = can('dashboard.read');

  const [range, setRange] = useState<TrendsRange>(TrendsRange._7d);
  const [trends, setTrends] = useState<DashboardTrendsResponseDto>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dashboardApi || !canRead) {
      setLoading(false);
      return;
    }
    setLoading(true);
    dashboardApi
      .dashboardControllerGetTrends({ range })
      .then((res) => setTrends(res.data))
      .catch((e) => console.error('Error loading trends:', e))
      .finally(() => setLoading(false));
  }, [dashboardApi, canRead, range]);

  return { trends, loading, range, setRange };
};
