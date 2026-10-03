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
  const [fetching, setFetching] = useState(false);
  // Whether /acl/me has answered for the current session. Loading is derived
  // from it rather than kept in state: on the render where the session turns
  // LOGGED_IN the effect below has not run yet, and a stored "not loading"
  // let permission-gated routes see no permissions and bounce to the
  // dashboard — which is why a refreshed deep link never stayed put.
  const [fetched, setFetched] = useState(false);
  const loading = userState === UserState.UNKNOWN || (userState === UserState.LOGGED_IN && !fetched) || fetching;

  const refresh = useCallback(async () => {
    if (!aclApi || userState !== UserState.LOGGED_IN) return;
    setFetching(true);
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
      setFetched(true);
      setFetching(false);
    }
  }, [aclApi, userState]);

  useEffect(() => {
    if (userState === UserState.LOGGED_IN) {
      refresh();
    } else {
      setRole(undefined);
      setIsOwner(false);
      setPermissions([]);
      setFetched(false);
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
