import { useEffect, useState } from 'react';
import { BlogLocaleResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useBlogLocales = () => {
  const { blogLocalesApi } = useApi();
  const [locales, setLocales] = useState<BlogLocaleResponse[]>([]);
  const [defaultLocale, setDefaultLocale] = useState<string>('');

  useEffect(() => {
    if (!blogLocalesApi) return;
    let active = true;
    blogLocalesApi
      .localeControllerList()
      .then((r) => {
        if (!active) return;
        setLocales(r.data.locales ?? []);
        setDefaultLocale(r.data.defaultLocale ?? r.data.locales?.[0]?.code ?? '');
      })
      .catch((e) => console.error('Error loading blog locales:', e));
    return () => {
      active = false;
    };
  }, [blogLocalesApi]);

  return { locales, defaultLocale };
};
