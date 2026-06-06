import { useContext } from 'react';
import { PermissionsContext } from '~/contexts/Permissions/PermissionsContext';

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw Error('Use this hook in PermissionsProvider scope');
  return ctx;
};

/** Convenience accessor returning just the `can` helper. */
export const useCan = () => usePermissions().can;
