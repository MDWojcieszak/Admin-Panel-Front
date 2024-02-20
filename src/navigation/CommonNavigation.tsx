import { Route, Routes, useLocation } from 'react-router-dom';

import { MainNavigation } from '~/navigation/MainNavigation';
import { CommonNavigationRoute, CommonRouteType } from '~/navigation/types';
import { NotFound } from '~/routes/NotFound';
import { SignIn } from '~/routes/SignIn';
import { Welcome } from '~/routes/Welcome';
import { mkUseStyles } from '~/utils/theme';

const commonRoutes: CommonRouteType[] = [
  { path: CommonNavigationRoute.WELCOME, label: 'Welcome', component: <Welcome /> },
  { path: CommonNavigationRoute.SIGN_IN, label: 'Sign In', component: <SignIn /> },
  { path: CommonNavigationRoute.MAIN_NAVIGATION, label: 'Dashboard', component: <MainNavigation /> },
  { path: CommonNavigationRoute.NOT_FOUND, label: 'Not Found', component: <NotFound /> },
];

export const CommonNavigation = () => {
  const styles = useStyles();
  const location = useLocation();

  const renderRoute = (route: CommonRouteType) => (
    <Route path={route.path} key={route.path} element={route.component} />
  );

  return (
    <div style={styles.container}>
      <Routes location={location}>{commonRoutes.map(renderRoute)}</Routes>
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
}));
