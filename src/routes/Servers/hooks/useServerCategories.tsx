import { useEffect, useState } from 'react';
import { ServerCategoriesType, ServerService } from '~/api/Server';

export const useServerCategires = (serverId?: string) => {
  const [categories, setCategories] = useState<ServerCategoriesType[]>();
  const [loading, setLoading] = useState(false);
  const handleGet = async () => {
    if (!serverId) return;
    try {
      const response = await ServerService.getCategories(serverId);
      setCategories(response);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleGet();
  }, [serverId]);

  return {
    categories,
    loading,
  };
};
