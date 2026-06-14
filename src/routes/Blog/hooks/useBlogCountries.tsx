import { useCallback, useEffect, useState } from 'react';
import { BlogCountryAdminResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

/** Display name of a country in a locale; falls back to any translation, then the slug. */
export const countryName = (c: BlogCountryAdminResponse | undefined, locale: string): string => {
  if (!c) return '';
  const tr = c.translations.find((t) => t.locale === locale) ?? c.translations[0];
  return tr?.name || c.slug;
};

/** Admin list of countries (first-class entities) — the source of names for tagging posts/POI by countryId. */
export const useBlogCountries = () => {
  const { blogCountriesApi } = useApi();
  const [countries, setCountries] = useState<BlogCountryAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!blogCountriesApi) return;
    setLoading(true);
    try {
      const { data } = await blogCountriesApi.countryControllerList();
      setCountries(
        [...data.countries].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug)),
      );
    } catch (e) {
      console.error('Error loading countries:', e);
    } finally {
      setLoading(false);
    }
  }, [blogCountriesApi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { countries, loading, refresh };
};
