import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { MainNavigationContainer } from '~/navigation/MainNavigationContainer';

const router = createBrowserRouter([{ path: '*', Component: MainNavigationContainer }]);

export const AppNavigation = () => {
  return <RouterProvider router={router} />;
};
