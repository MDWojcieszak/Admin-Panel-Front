import { useCallback, useEffect, useState } from 'react';
import { CollectionSummaryResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useCollections = () => {
  const { blogCollectionsApi } = useApi();
  const [collections, setCollections] = useState<CollectionSummaryResponse[]>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!blogCollectionsApi) return;
    try {
      const { data } = await blogCollectionsApi.collectionControllerList({
        take: 20,
        skip: 0,
        search: debouncedSearch.trim() || undefined,
      });
      setCollections(data.collections);
    } catch (e) {
      console.error('Error loading collections:', e);
    }
  }, [blogCollectionsApi, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { collections, search, setSearch, refresh: fetchData };
};
