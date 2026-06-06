import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { ProtectedRoute } from '~/navigation/ProtectedRoute';
import { ServerNavigation } from '~/navigation/ServerNavigation';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { AccessControl } from '~/routes/AccessControl';
import { Dashboard } from '~/routes/Dashboard';
import { Gallery } from '~/routes/Images';
import { PhotoManagement } from '~/routes/PhotoManagement';

export const mainNavigationRoutes: MainRouteType[] = [
  { path: MainNavigationRoute.DASHBOARD, label: 'Dashboard', component: <Dashboard /> },
  { path: MainNavigationRoute.ACCOUNTS, label: 'Accounts', component: <Accounts />, permission: 'user.read' },
  {
    path: MainNavigationRoute.PHOTO_MANAGEMENT,
    label: 'Photo Library',
    component: <PhotoManagement />,
    permission: 'photoEntry.read',
  },
  { path: MainNavigationRoute.GALLERY, label: 'Personal Gallery', component: <Gallery /> },
  { path: MainNavigationRoute.SETTINGS, label: 'Settings', component: <Dashboard />, permission: 'settings.read' },
  {
    path: MainNavigationRoute.SERVERS,
    label: 'Servers',
    component: <ServerNavigation />,
    nested: true,
    permission: 'server.read',
  },
  {
    path: MainNavigationRoute.ACCESS_CONTROL,
    label: 'Access Control',
    component: <AccessControl />,
    permission: ['acl.manage', 'acl.assign'],
  },
];

export const MainNavigation = () => {
  const location = useLocation();

  const renderRoute = (route: MainRouteType) => (
    <Route
      path={route.path + `${route.nested ? '/*' : ''}`}
      key={route.path}
      index={route.path === MainNavigationRoute.DASHBOARD}
      element={
        <ProtectedRoute permission={route.permission}>
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
