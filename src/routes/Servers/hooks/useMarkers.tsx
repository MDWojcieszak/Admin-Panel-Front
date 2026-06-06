import { useCallback, useEffect, useState } from 'react';
import {
  CommandProgressMarkerResponseDto,
  CreateCommandProgressMarkerDto,
  UpdateCommandProgressMarkerDto,
} from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useMarkers = (commandId?: string) => {
  const { serverApi } = useApi();
  const [markers, setMarkers] = useState<CommandProgressMarkerResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!serverApi || !commandId) return;
    setLoading(true);
    try {
      const { data } = await serverApi.serverCommandsControllerGetProgressMarkers({ id: commandId });
      setMarkers(data.markers ?? []);
    } catch (e) {
      console.error('Error loading command markers:', e);
    } finally {
      setLoading(false);
    }
  }, [serverApi, commandId]);

  const createMarker = useCallback(
    async (dto: CreateCommandProgressMarkerDto) => {
      if (!serverApi || !commandId) return;
      await serverApi.serverCommandsControllerCreateProgressMarker({ id: commandId, createCommandProgressMarkerDto: dto });
      await refresh();
    },
    [serverApi, commandId, refresh],
  );

  const updateMarker = useCallback(
    async (markerId: string, dto: UpdateCommandProgressMarkerDto) => {
      if (!serverApi) return;
      await serverApi.serverCommandsControllerUpdateProgressMarker({ markerId, updateCommandProgressMarkerDto: dto });
      await refresh();
    },
    [serverApi, refresh],
  );

  const deleteMarker = useCallback(
    async (markerId: string) => {
      if (!serverApi) return;
      await serverApi.serverCommandsControllerDeleteProgressMarker({ markerId });
      await refresh();
    },
    [serverApi, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { markers, loading, refresh, createMarker, updateMarker, deleteMarker };
};
