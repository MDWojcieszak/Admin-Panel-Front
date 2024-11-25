import { ReactNode } from 'react';

export enum MainNavigationRoute {
  DASHBOARD = 'dashboard',
  ACCOUNTS = 'accounts',
  GALLERY = 'gallery',
  SETTINGS = 'settings',
  SERVERS = 'servers',
}

export enum CommonNavigationRoute {
  WELCOME = 'welcome',
  SIGN_IN = 'sign-in',
  RESET_PASSWORD = 'reset-password',
  USER_REGISTRATION = 'register',
  MAIN_NAVIGATION = '*',
  NOT_FOUND = 'not-found',
}

export enum ServerNavigationRoute {
  SERVERS = '',
  MANAGE = ':serverId',
}

type RouteType<T> = {
  path: T;
  label: string;
  component: ReactNode;
  nested?: true;
};

export type CommonRouteType = RouteType<CommonNavigationRoute>;

export type MainRouteType = RouteType<MainNavigationRoute>;

export type ServerRouteType = RouteType<ServerNavigationRoute>;
