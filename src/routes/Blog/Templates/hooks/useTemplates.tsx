import { useCallback, useEffect, useState } from 'react';
import { TemplateResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useTemplates = () => {
  const { blogTemplatesApi } = useApi();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);

  const refresh = useCallback(async () => {
    if (!blogTemplatesApi) return;
    try {
      const { data } = await blogTemplatesApi.templateControllerList();
      setTemplates(data.templates);
    } catch (e) {
      console.error('Error loading templates:', e);
    }
  }, [blogTemplatesApi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { templates, refresh };
};
