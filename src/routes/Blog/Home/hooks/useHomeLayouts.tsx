import { useCallback, useEffect, useState } from 'react';
import { HomeLayoutResponse, HomeLayoutSummaryResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useHomeLayouts = () => {
  const { blogHomeApi } = useApi();
  const [layouts, setLayouts] = useState<HomeLayoutSummaryResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [layout, setLayout] = useState<HomeLayoutResponse>();

  const refreshList = useCallback(async () => {
    if (!blogHomeApi) return;
    try {
      const { data } = await blogHomeApi.homeControllerList({ take: 100, skip: 0 });
      setLayouts(data.layouts);
      if (!selectedId && data.layouts[0]) setSelectedId(data.layouts[0].id);
    } catch (e) {
      console.error('Error loading home layouts:', e);
    }
  }, [blogHomeApi, selectedId]);

  const refreshLayout = useCallback(async () => {
    if (!blogHomeApi || !selectedId) {
      setLayout(undefined);
      return;
    }
    try {
      const { data } = await blogHomeApi.homeControllerGet({ layoutId: selectedId });
      setLayout(data);
    } catch (e) {
      console.error('Error loading layout:', e);
    }
  }, [blogHomeApi, selectedId]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);
  useEffect(() => {
    refreshLayout();
  }, [refreshLayout]);

  return { layouts, selectedId, setSelectedId, layout, refreshList, refreshLayout };
};
