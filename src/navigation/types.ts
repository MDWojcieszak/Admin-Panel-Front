import { ReactNode } from 'react';

export enum MainNavigationRoutes {
  DASHBOARD = 'dashboard',
  ACCOUNTS = 'accounts',
  GALLERY = 'gallery',
  SETTINGS = 'settings',
}

export type RouteType = {
  path: MainNavigationRoutes;
  label: string;
  component: ReactNode;
};
