import { useCallback, useEffect, useState } from 'react';
import { CreatePermissionGroupDto, PermissionGroupResponseDto, UpdatePermissionGroupDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useAclGroups = () => {
  const { aclApi } = useApi();
  const [groups, setGroups] = useState<PermissionGroupResponseDto[]>();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!aclApi) return;
    setLoading(true);
    try {
      const { data } = await aclApi.aclControllerListGroups();
      setGroups(data.groups);
    } catch (e) {
      console.error('Error loading permission groups:', e);
    } finally {
      setLoading(false);
    }
  }, [aclApi]);

  const createGroup = useCallback(
    async (dto: CreatePermissionGroupDto) => {
      if (!aclApi) return;
      await aclApi.aclControllerCreateGroup({ createPermissionGroupDto: dto });
    },
    [aclApi],
  );

  const updateGroup = useCallback(
    async (id: string, dto: UpdatePermissionGroupDto) => {
      if (!aclApi) return;
      await aclApi.aclControllerUpdateGroup({ id, updatePermissionGroupDto: dto });
    },
    [aclApi],
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      if (!aclApi) return;
      await aclApi.aclControllerDeleteGroup({ id });
    },
    [aclApi],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, loading, refresh, createGroup, updateGroup, deleteGroup };
};
