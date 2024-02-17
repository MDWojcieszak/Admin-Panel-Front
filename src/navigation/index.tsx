import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SideMenu } from '~/navigation/SideMenu';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SideMenu></SideMenu>,
  },
]);

export const AppNavigation = () => {
  return <RouterProvider router={router} />;
};
