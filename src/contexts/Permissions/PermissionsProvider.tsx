import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Role } from '~/api/api';
import { Permission } from '~/acl/permissions';
import { PermissionsContext } from '~/contexts/Permissions/PermissionsContext';
import { UserState } from '~/contexts/User/AuthContext';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';

type PermissionsProviderProps = {
  children: ReactNode;
};

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const { userState } = useAuth();
  const { aclApi } = useApi();

  const [role, setRole] = useState<Role>();
  const [isOwner, setIsOwner] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  // Start "loading" so permission-gated routes wait for /acl/me instead of
  // redirecting on the first render before effective permissions arrive.
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!aclApi || userState !== UserState.LOGGED_IN) return;
    setLoading(true);
    try {
      const { data } = await aclApi.aclControllerGetMyPermissions();
      setRole(data.role);
      setIsOwner(data.isOwner);
      setPermissions(data.permissions);
    } catch (e) {
      setRole(undefined);
      setIsOwner(false);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [aclApi, userState]);

  useEffect(() => {
    if (userState === UserState.LOGGED_IN) {
      refresh();
    } else {
      setRole(undefined);
      setIsOwner(false);
      setPermissions([]);
      setLoading(false);
    }
  }, [userState, refresh]);

  const can = useCallback(
    (permission: Permission | string | undefined) => {
      if (isOwner) return true;
      if (!permission) return true;
      return permissions.includes(permission);
    },
    [isOwner, permissions],
  );

  return (
    <PermissionsContext.Provider value={{ role, isOwner, permissions, loading, can, refresh }}>
      {children}
    </PermissionsContext.Provider>
  );
};
