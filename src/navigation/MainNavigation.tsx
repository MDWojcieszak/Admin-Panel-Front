import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { ProtectedRoute } from '~/navigation/ProtectedRoute';
import { ServerNavigation } from '~/navigation/ServerNavigation';
import { MainNavigationRoute, MainRouteType } from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { AccessControl } from '~/routes/AccessControl';
import { Account } from '~/routes/Account';
import { About } from '~/routes/About';
import { Dashboard } from '~/routes/Dashboard';
import { Gallery } from '~/routes/Images';
import { PhotoManagement } from '~/routes/PhotoManagement';
import { Settings } from '~/routes/Settings';

// Top navigation items (rendered in the sidebar list).
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

// Personal pages reachable from the sidebar footer (not part of the top nav list).
const footerRoutes: MainRouteType[] = [
  { path: MainNavigationRoute.SETTINGS, label: 'User Settings', component: <Settings />, bare: true },
  { path: MainNavigationRoute.ACCOUNT, label: 'Account', component: <Account />, bare: true },
  { path: MainNavigationRoute.ABOUT, label: 'About', component: <About />, bare: true },
];

const allRoutes = [...mainNavigationRoutes, ...footerRoutes];

export const MainNavigation = () => {
  const location = useLocation();

  const renderRoute = (route: MainRouteType) => (
    <Route
      path={route.path + `${route.nested ? '/*' : ''}`}
      key={route.path}
      index={route.path === MainNavigationRoute.DASHBOARD}
      element={
        <ProtectedRoute permission={route.permission}>
          <AnimatedRoute key={route.path} bare={route.bare}>
            {route.component}
          </AnimatedRoute>
        </ProtectedRoute>
      }
    />
  );

  return (
    <>
      <SideBar items={mainNavigationRoutes} />
      <AnimatePresence mode='wait' key='navigation' presenceAffectsLayout>
        <Routes key={location.pathname} location={location}>
          {allRoutes.map(renderRoute)}
          <Route path='/' element={<Navigate to={MainNavigationRoute.DASHBOARD} />} />
          <Route path='*' element={<Navigate to='not-found' />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};
