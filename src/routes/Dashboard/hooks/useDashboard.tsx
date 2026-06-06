import { useEffect, useState } from 'react';
import { DashboardGalleryResponseDto, DashboardResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';

export const useDashboard = () => {
  const { dashboardApi } = useApi();
  const can = useCan();
  const canRead = can('dashboard.read');

  const [overview, setOverview] = useState<DashboardResponseDto>();
  const [gallery, setGallery] = useState<DashboardGalleryResponseDto>();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!dashboardApi) return;
    if (!canRead) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    setForbidden(false);
    setLoading(true);
    Promise.allSettled([
      dashboardApi.dashboardControllerGetOverview(),
      dashboardApi.dashboardControllerGetGallery(),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setOverview(results[0].value.data);
      else if ((results[0].reason as { response?: { status?: number } })?.response?.status === 403)
        setForbidden(true);
      if (results[1].status === 'fulfilled') setGallery(results[1].value.data);
      setLoading(false);
    });
  }, [dashboardApi, canRead]);

  return { overview, gallery, loading, forbidden };
};
