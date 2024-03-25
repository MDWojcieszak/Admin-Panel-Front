import { Route, Routes } from 'react-router-dom';
import { ServerNavigationRoute, ServerRouteType } from '~/navigation/types';
import { Servers } from '~/routes/Servers';
import { ManageServer } from '~/routes/Servers/ManageServer';

export const serverNavigationRoutes: ServerRouteType[] = [
  { path: ServerNavigationRoute.SERVERS, label: 'Servers', component: <Servers /> },
  { path: ServerNavigationRoute.MANAGE, label: 'Manage Servers', component: <ManageServer /> },
];

export const ServerNavigation = () => {
  const renderRoute = (route: ServerRouteType) => (
    <Route
      path={route.path}
      key={route.path}
      index={route.path === ServerNavigationRoute.SERVERS}
      element={route.component}
    />
  );
  return <Routes>{serverNavigationRoutes.map(renderRoute)}</Routes>;
};
