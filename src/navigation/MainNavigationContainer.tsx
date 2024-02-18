import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { MainNavigationRoutes, RouteType } from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { Dashboard } from '~/routes/Dashboard';
import { mkUseStyles } from '~/utils/theme';

const routes: RouteType[] = [
  { path: MainNavigationRoutes.DASHBOARD, label: 'Dashboard', component: <Dashboard /> },
  { path: MainNavigationRoutes.ACCOUNTS, label: 'Accounts', component: <Accounts /> },
  { path: MainNavigationRoutes.GALLERY, label: 'Gallery', component: <Dashboard /> },
  { path: MainNavigationRoutes.SETTINGS, label: 'Setings', component: <Dashboard /> },
];

export const MainNavigationContainer = () => {
  const styles = useStyles();
  const location = useLocation();

  const renderRoute = (route: RouteType) => (
    <Route
      path={route.path}
      key={route.path}
      element={<AnimatedRoute key={route.path}>{route.component}</AnimatedRoute>}
    />
  );

  return (
    <div style={styles.container}>
      <SideBar items={routes} />
      <AnimatePresence mode='wait' presenceAffectsLayout>
        <Routes key={location.pathname} location={location}>
          {routes.map(renderRoute)}
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
}));
