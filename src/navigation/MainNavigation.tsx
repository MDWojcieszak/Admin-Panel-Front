import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { ProtectedRoute } from '~/navigation/ProtectedRoute';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { Dashboard } from '~/routes/Dashboard';
import { Gallery } from '~/routes/Images';

export const mainNavigationRoutes: MainRouteType[] = [
  { path: MainNavigationRoute.DASHBOARD, label: 'Dashboard', component: <Dashboard /> },
  { path: MainNavigationRoute.ACCOUNTS, label: 'Accounts', component: <Accounts /> },
  { path: MainNavigationRoute.GALLERY, label: 'Gallery', component: <Gallery /> },
  { path: MainNavigationRoute.SETTINGS, label: 'Setings', component: <Dashboard /> },
];

export const MainNavigation = () => {
  const location = useLocation();

  const renderRoute = (route: MainRouteType) => (
    <Route
      path={route.path}
      key={route.path}
      index={route.path === MainNavigationRoute.DASHBOARD}
      element={
        <ProtectedRoute>
          <AnimatedRoute key={route.path}>{route.component}</AnimatedRoute>
        </ProtectedRoute>
      }
    />
  );

  return (
    <>
      <SideBar items={mainNavigationRoutes} />
      <AnimatePresence mode='wait' key='navigation' presenceAffectsLayout>
        <Routes key={location.pathname} location={location}>
          {mainNavigationRoutes.map(renderRoute)}
          <Route path='/' element={<Navigate to={MainNavigationRoute.DASHBOARD} />} />
          <Route path='*' element={<Navigate to='not-found' />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};
