import { createContext } from 'react';
import { Role } from '~/api/api';
import { Permission } from '~/acl/permissions';

export type PermissionsContextType = {
  role: Role | undefined;
  isOwner: boolean;
  permissions: string[];
  loading: boolean;
  /** OWNER bypass + membership check. Accepts a known Permission or any raw key. */
  can: (permission: Permission | string | undefined) => boolean;
  /** Re-fetch effective permissions (call after group changes / re-login). */
  refresh: F0;
};

export const PermissionsContext = createContext<PermissionsContextType | null>(null);
