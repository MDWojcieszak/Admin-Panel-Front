import { useCallback, useEffect, useMemo, useState } from 'react';
import { PermissionDescriptorResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export type PermissionGroupByResource = {
  resource: string;
  permissions: PermissionDescriptorResponseDto[];
};

/**
 * @param enabled Set false while the caller has no session yet — the catalog
 * needs one, and firing the request anyway just logs a 401 on a public page.
 */
export const usePermissionCatalog = (enabled = true) => {
  const { aclApi } = useApi();
  const [catalog, setCatalog] = useState<PermissionDescriptorResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!aclApi || !enabled) return;
    aclApi
      .aclControllerGetCatalog()
      .then(({ data }) => setCatalog(data.permissions ?? []))
      .catch((e) => console.error('Error loading permission catalog:', e))
      .finally(() => setLoading(false));
  }, [aclApi, enabled]);

  const grouped = useMemo<PermissionGroupByResource[]>(() => {
    const byResource = new Map<string, PermissionDescriptorResponseDto[]>();
    catalog.forEach((descriptor) => {
      const list = byResource.get(descriptor.resource) ?? [];
      list.push(descriptor);
      byResource.set(descriptor.resource, list);
    });
    return Array.from(byResource.entries()).map(([resource, permissions]) => ({ resource, permissions }));
  }, [catalog]);

  const byKey = useMemo(() => new Map(catalog.map((descriptor) => [descriptor.key, descriptor])), [catalog]);

  /**
   * Human-readable label for a permission key. Falls back to the raw key so a
   * scope the catalog does not know about is still shown rather than dropped —
   * on a consent screen, silently hiding a grant is the worst failure mode.
   */
  const describe = useCallback((key: string) => byKey.get(key)?.description || key, [byKey]);

  return { catalog, grouped, describe, loading };
};
