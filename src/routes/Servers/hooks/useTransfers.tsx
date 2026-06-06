import { useCallback, useEffect, useState } from 'react';
import { CreateServerTransferDto, PatchServerTransferDto, ServerTransferResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useTransfers = (categoryId?: string) => {
  const { defaultApi } = useApi();
  const [transfers, setTransfers] = useState<ServerTransferResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!defaultApi || !categoryId) return;
    setLoading(true);
    try {
      const { data } = await defaultApi.serverTransferControllerListByCategory({ id: categoryId });
      setTransfers(data.transfers ?? []);
    } catch (e) {
      console.error('Error loading transfers:', e);
    } finally {
      setLoading(false);
    }
  }, [defaultApi, categoryId]);

  const createTransfer = useCallback(
    async (dto: CreateServerTransferDto) => {
      if (!defaultApi || !categoryId) return;
      await defaultApi.serverTransferControllerCreate({ id: categoryId, createServerTransferDto: dto });
      await refresh();
    },
    [defaultApi, categoryId, refresh],
  );

  const patchTransfer = useCallback(
    async (transferId: string, dto: PatchServerTransferDto) => {
      if (!defaultApi) return;
      await defaultApi.serverTransferControllerPatch({ id: transferId, patchServerTransferDto: dto });
      await refresh();
    },
    [defaultApi, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transfers, loading, refresh, createTransfer, patchTransfer };
};
