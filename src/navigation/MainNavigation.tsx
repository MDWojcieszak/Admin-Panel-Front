import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader } from '~/components/Loader';
import { SideBar } from '~/components/SideBar';
import { AnimatedRoute } from '~/navigation/AnimatedRoute';
import { PhotoManagementNavigation } from '~/navigation/PhotoManagementNavigation';
import { ProtectedRoute } from '~/navigation/ProtectedRoute';
import { ServerNavigation } from '~/navigation/ServerNavigation';
import {
  BlogNavigationRoute,
  GalleryNavigationRoute,
  MainNavigationRoute,
  MainRouteType,
  PhotoNavigationRoute,
} from '~/navigation/types';
import { Accounts } from '~/routes/Accounts';
import { AccessControl } from '~/routes/AccessControl';
import { Account } from '~/routes/Account';
import { About } from '~/routes/About';
import { Dashboard } from '~/routes/Dashboard';
import { GalleriesNavigation } from '~/navigation/GalleriesNavigation';
import { Integrations } from '~/routes/Integrations';
import { Settings } from '~/routes/Settings';
import { SystemStatus } from '~/routes/SystemStatus';

// Blog area (rich markdown + maps libs) — split into its own chunk.
const BlogNavigation = lazy(() => import('~/navigation/BlogNavigation').then((m) => ({ default: m.BlogNavigation })));

// Top navigation items (rendered in the sidebar list), grouped logically:
// overview → infrastructure → photography → people & security.
export const mainNavigationRoutes: MainRouteType[] = [
  { path: MainNavigationRoute.DASHBOARD, label: 'Dashboard', component: <Dashboard /> },
  {
    path: MainNavigationRoute.SERVERS,
    label: 'Servers',
    component: <ServerNavigation />,
    nested: true,
    permission: 'server.read',
  },
  {
    path: MainNavigationRoute.PHOTO_MANAGEMENT,
    label: 'Photography',
    component: <PhotoManagementNavigation />,
    nested: true,
    // Gear sits here but the /gear/* endpoints want gallery.manage, so the
    // section opens on either permission and each sub-item states its own.
    permission: ['photoEntry.read', 'gallery.manage'],
    subItems: [
      { path: PhotoNavigationRoute.LIBRARY, label: 'Library', permission: 'photoEntry.read' },
      { path: PhotoNavigationRoute.GEAR, label: 'Gear', permission: 'gallery.manage' },
      { path: PhotoNavigationRoute.ALBUMS, label: 'Immich Albums', permission: 'photoEntry.read' },
    ],
  },
  {
    path: MainNavigationRoute.GALLERIES,
    label: 'Galleries',
    component: <GalleriesNavigation />,
    nested: true,
    permission: 'gallery.manage',
    subItems: [
      { path: GalleryNavigationRoute.GALLERIES, label: 'Galleries' },
      { path: GalleryNavigationRoute.IMAGES, label: 'Images' },
      { path: GalleryNavigationRoute.HERO, label: 'Home' },
    ],
  },
  {
    path: MainNavigationRoute.BLOG,
    label: 'Blog',
    component: (
      <Suspense fallback={<Loader />}>
        <BlogNavigation />
      </Suspense>
    ),
    nested: true,
    permission: 'blog.read',
    subItems: [
      { path: BlogNavigationRoute.POSTS, label: 'Posts', permission: 'blog.read' },
      { path: BlogNavigationRoute.CATEGORIES, label: 'Categories', permission: 'blog.category.manage' },
      { path: BlogNavigationRoute.PLACES, label: 'Places', permission: 'blog.place.manage' },
      { path: BlogNavigationRoute.COUNTRIES, label: 'Countries', permission: 'blog.place.manage' },
      { path: BlogNavigationRoute.COLLECTIONS, label: 'Collections', permission: 'blog.place.manage' },
      { path: BlogNavigationRoute.HOME, label: 'Home page', permission: 'blog.home.manage' },
    ],
  },
  { path: MainNavigationRoute.ACCOUNTS, label: 'Users', component: <Accounts />, permission: 'user.read' },
  {
    path: MainNavigationRoute.ACCESS_CONTROL,
    label: 'Access Control',
    component: <AccessControl />,
    permission: ['acl.manage', 'acl.assign'],
  },
];

// Pages reachable from the sidebar footer (not part of the top nav list).
const footerRoutes: MainRouteType[] = [
  {
    path: MainNavigationRoute.SYSTEM_STATUS,
    label: 'System Status',
    component: <SystemStatus />,
    permission: 'system.read',
  },
  // Ungated: everyone manages their own connected apps here. The service-wide
  // sections inside the page still check `token.read` for themselves.
  { path: MainNavigationRoute.INTEGRATIONS, label: 'Integrations', component: <Integrations /> },
  { path: MainNavigationRoute.SETTINGS, label: 'User Settings', component: <Settings /> },
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
