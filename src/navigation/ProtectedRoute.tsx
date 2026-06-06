import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Permission, hasAccess } from '~/acl/permissions';
import { UserState } from '~/contexts/User/AuthContext';
import { useAuth } from '~/hooks/useAuth';
import { usePermissions } from '~/hooks/usePermissions';
import { CommonNavigationRoute, MainNavigationRoute } from '~/navigation/types';

type ProtectedRouteProps = {
  children: ReactNode;
  permission?: Permission | Permission[];
};

export const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const auth = useAuth();
  const { can, loading } = usePermissions();

  switch (auth.userState) {
    case UserState.LOGGED_IN:
      if (!permission) return children;
      // Wait for effective permissions before deciding to avoid a false redirect.
      if (loading) return <></>;
      return hasAccess(can, permission) ? children : <Navigate to={'/' + MainNavigationRoute.DASHBOARD} />;
    case UserState.UNKNOWN:
      return <></>;
    default:
      return <Navigate to={'/' + CommonNavigationRoute.SIGN_IN} />;
  }
};
