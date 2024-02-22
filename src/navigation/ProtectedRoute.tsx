import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserState } from '~/contexts/User/AuthContext';
import { useAuth } from '~/hooks/useAuth';
import { CommonNavigationRoute } from '~/navigation/types';

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useAuth();
  switch (auth.userState) {
    case UserState.LOGGED_IN:
      return children;
    case UserState.UNKNOWN:
      return <></>;
    default:
      return <Navigate to={'/' + CommonNavigationRoute.SIGN_IN} />;
  }
};
