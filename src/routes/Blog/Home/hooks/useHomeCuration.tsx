import { useCallback, useEffect, useState } from 'react';
import { HomeConfigResponse, HomePinResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

/**
 * Home-page curation: the post count (how many cards the HP shows) + the pinned posts.
 * Pins use set-semantics — every change PUTs the whole, 1-based contiguous set.
 */
export const useHomeCuration = () => {
  const { blogHomeApi } = useApi();
  const [config, setConfig] = useState<HomeConfigResponse>();
  const [pins, setPins] = useState<HomePinResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!blogHomeApi) return;
    setLoading(true);
    try {
      const [cfg, pinsRes] = await Promise.all([blogHomeApi.homeControllerGetConfig(), blogHomeApi.homeControllerGetPins()]);
      setConfig(cfg.data);
      setPins([...pinsRes.data.pins].sort((a, b) => a.position - b.position));
    } catch (e) {
      console.error('Error loading home curation:', e);
    } finally {
      setLoading(false);
    }
  }, [blogHomeApi]);

  useEffect(() => {
    load();
  }, [load]);

  const saveConfig = useCallback(
    async (postCount: number) => {
      if (!blogHomeApi) return;
      try {
        const { data } = await blogHomeApi.homeControllerPatchConfig({ patchHomeConfigDto: { postCount } });
        setConfig(data);
      } catch (e) {
        console.error('Error saving home config:', e);
      }
    },
    [blogHomeApi],
  );

  const savePins = useCallback(
    async (next: HomePinResponse[]) => {
      if (!blogHomeApi) return;
      const renumbered = next.map((p, i) => ({ ...p, position: i + 1 }));
      setPins(renumbered); // optimistic
      try {
        const { data } = await blogHomeApi.homeControllerSetPins({
          setHomePinsDto: { pins: renumbered.map((p) => ({ postId: p.postId, position: p.position })) },
        });
        setPins([...data.pins].sort((a, b) => a.position - b.position));
      } catch (e) {
        console.error('Error saving home pins:', e);
        load(); // revert to server truth
      }
    },
    [blogHomeApi, load],
  );

  return { config, pins, loading, saveConfig, savePins };
};
