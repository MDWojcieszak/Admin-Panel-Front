import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { CommonNavigation } from '~/navigation/CommonNavigation';

const router = createBrowserRouter([{ path: '*', Component: CommonNavigation }]);

export const AppNavigation = () => {
  return <RouterProvider router={router} />;
};
