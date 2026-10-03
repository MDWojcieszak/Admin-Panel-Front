import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  switch (auth.userState) {
    case UserState.LOGGED_IN:
      if (!permission) return children;
      // Wait for effective permissions before deciding to avoid a false redirect.
      if (loading) return <></>;
      return hasAccess(can, permission) ? children : <Navigate to={'/' + MainNavigationRoute.DASHBOARD} />;
    case UserState.UNKNOWN:
      return <></>;
    default: {
      // Carry the address along, so signing in lands where the link pointed
      // instead of on the dashboard.
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      return <Navigate replace to={`/${CommonNavigationRoute.SIGN_IN}?returnUrl=${returnUrl}`} />;
    }
  }
};
