import { NavigateFunction } from 'react-router-dom';

/**
 * Navigation for code outside the router. Modals render from the
 * ModalManagerProvider, above the RouterProvider, so `useNavigate()` throws in
 * them; they call `navigateTo` instead. The router's own navigate is handed in
 * by a component inside it (CommonNavigation).
 */
let current: NavigateFunction | null = null;

export const setNavigator = (navigate: NavigateFunction | null) => {
  current = navigate;
};

export const navigateTo = (path: string) => {
  if (current) current(path);
  else window.location.assign(path);
};
