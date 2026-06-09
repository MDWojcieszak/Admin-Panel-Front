import { useCallback, useEffect, useState } from 'react';
import { CategoryKind, CategoryResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const categoryLabel = (c: CategoryResponse, locale: string): string =>
  c.translations.find((t) => t.locale === locale)?.label || c.translations[0]?.label || c.key;

export const useBlogCategories = (kind: CategoryKind, locale: string) => {
  const { blogCategoriesApi } = useApi();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!blogCategoriesApi) return;
    setLoading(true);
    try {
      const { data } = await blogCategoriesApi.categoryControllerList({ kind, locale });
      setCategories(data.categories ?? []);
    } catch (e) {
      console.error('Error loading blog categories:', e);
    } finally {
      setLoading(false);
    }
  }, [blogCategoriesApi, kind, locale]);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, refresh: load };
};
