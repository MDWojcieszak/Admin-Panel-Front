import { useCallback, useEffect, useState } from 'react';
import { PostDraftResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useBlogDraft = (id?: string, locale?: string) => {
  const { blogPostsApi } = useApi();
  const [draft, setDraft] = useState<PostDraftResponse>();
  const [loading, setLoading] = useState(true);

  const fetchDraft = useCallback(async () => {
    if (!blogPostsApi || !id || !locale) return;
    setLoading(true);
    try {
      const { data } = await blogPostsApi.postControllerGetDraft({ id, locale });
      setDraft(data);
    } catch (e) {
      console.error('Error loading blog draft:', e);
    } finally {
      setLoading(false);
    }
  }, [blogPostsApi, id, locale]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  return { draft, loading, refresh: fetchDraft, setDraft };
};
