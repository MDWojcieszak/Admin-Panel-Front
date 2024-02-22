import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { Dashboard } from '~/routes/Dashboard';

export const mainNavigationRoutes: MainRouteType[] = [
  { path: MainNavigationRoute.DASHBOARD, label: 'Dashboard', component: <Dashboard /> },
  { path: MainNavigationRoute.ACCOUNTS, label: 'Accounts', component: <Accounts /> },
  { path: MainNavigationRoute.GALLERY, label: 'Gallery', component: <Dashboard /> },
  { path: MainNavigationRoute.SETTINGS, label: 'Setings', component: <Dashboard /> },
];

export const MainNavigation = () => {
  const location = useLocation();

  const renderRoute = (route: MainRouteType) => (
    <Route
      path={route.path}
      key={route.path}
      index={route.path === MainNavigationRoute.DASHBOARD}
      element={<AnimatedRoute key={route.path}>{route.component}</AnimatedRoute>}
    />
  );

  return (
    <>
      <SideBar items={mainNavigationRoutes} />
      <AnimatePresence mode='wait' key='navigation' presenceAffectsLayout>
        <Routes key={location.pathname} location={location}>
          {mainNavigationRoutes.map(renderRoute)}
          <Route path='*' element={<Navigate to='not-found' />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};