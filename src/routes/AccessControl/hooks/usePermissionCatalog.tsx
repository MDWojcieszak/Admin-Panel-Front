import { useEffect, useMemo, useState } from 'react';
import { PermissionDescriptorResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export type PermissionGroupByResource = {
  resource: string;
  permissions: PermissionDescriptorResponseDto[];
};

export const usePermissionCatalog = () => {
  const { aclApi } = useApi();
  const [catalog, setCatalog] = useState<PermissionDescriptorResponseDto[]>([]);

  useEffect(() => {
    if (!aclApi) return;
    aclApi
      .aclControllerGetCatalog()
      .then(({ data }) => setCatalog(data.permissions ?? []))
      .catch((e) => console.error('Error loading permission catalog:', e));
  }, [aclApi]);

  const grouped = useMemo<PermissionGroupByResource[]>(() => {
    const byResource = new Map<string, PermissionDescriptorResponseDto[]>();
    catalog.forEach((descriptor) => {
      const list = byResource.get(descriptor.resource) ?? [];
      list.push(descriptor);
      byResource.set(descriptor.resource, list);
    });
    return Array.from(byResource.entries()).map(([resource, permissions]) => ({ resource, permissions }));
  }, [catalog]);

  return { catalog, grouped };
};
