import { useCallback, useEffect, useState } from 'react';
import { ServerSettingsResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useSettings = (serverId?: string, categoryId?: string) => {
  const { serverApi } = useApi();
  const [settings, setSettings] = useState<ServerSettingsResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!serverApi || !serverId) return;
    setLoading(true);
    try {
      console.warn('Loading server settings for serverId:', serverId, 'categoryId:', categoryId);
      const { data } = await serverApi.serverSettingsControllerGetSettings({ serverId, categoryId });
      setSettings(data.settings ?? []);
    } catch (e) {
      console.error('Error loading server settings:', e);
    } finally {
      setLoading(false);
    }
  }, [serverApi, serverId, categoryId]);

  const updateSetting = useCallback(
    async (id: string, name: string, value: string) => {
      if (!serverApi) return;
      await serverApi.serverSettingsControllerPutCommand({ id, patchServerSettingDto: { name, value } });
      await refresh();
    },
    [serverApi, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, refresh, updateSetting };
};
