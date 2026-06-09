import { useCallback, useEffect, useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { PoiAdminResponse, PoiStatus } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const usePoiList = () => {
  const { blogPoiApi } = useApi();
  const [pois, setPois] = useState<PoiAdminResponse[]>();
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [status, setStatus] = useState<PoiStatus | undefined>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!blogPoiApi) return;
    try {
      const { data } = await blogPoiApi.poiControllerListAdmin({
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
        status,
        search: debouncedSearch.trim() || undefined,
      });
      setPois(data.pois);
      setTotal(data.total);
    } catch (e) {
      console.error('Error loading POIs:', e);
    }
  }, [blogPoiApi, pagination, status, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { pois, total, pagination, setPagination, status, setStatus, search, setSearch, refresh: fetchData };
};
