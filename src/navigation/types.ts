import { ReactNode } from 'react';

export enum MainNavigationRoute {
  DASHBOARD = 'dashboard',
  ACCOUNTS = 'accounts',
  GALLERY = 'gallery',
  SETTINGS = 'settings',
}

export enum CommonNavigationRoute {
  WELCOME = 'welcome',
  SIGN_IN = 'sign-in',
  MAIN_NAVIGATION = '*',
  NOT_FOUND = 'not-found',
}

export type CommonRouteType = {
  path: CommonNavigationRoute;
  label: string;
  component: ReactNode;
};

export type MainRouteType = {
  path: MainNavigationRoute;
  label: string;
  component: ReactNode;
};
