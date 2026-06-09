import { useCallback, useEffect, useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { BlogPostStatus, PostResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useBlogPosts = () => {
  const { blogPostsApi } = useApi();
  const [posts, setPosts] = useState<PostResponse[]>();
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });
  const [status, setStatus] = useState<BlogPostStatus | undefined>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search term so we don't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!blogPostsApi) return;
    try {
      const { data } = await blogPostsApi.postControllerList({
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
        status,
        search: debouncedSearch.trim() || undefined,
      });
      setPosts(data.posts);
      setTotal(data.total);
    } catch (e) {
      console.error('Error loading blog posts:', e);
    }
  }, [blogPostsApi, pagination, status, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { posts, total, pagination, setPagination, status, setStatus, search, setSearch, refresh: fetchData };
};
