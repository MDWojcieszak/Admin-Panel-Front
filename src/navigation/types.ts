import { ReactNode } from 'react';
import { Permission } from '~/acl/permissions';

export enum MainNavigationRoute {
  DASHBOARD = 'dashboard',
  ACCOUNTS = 'accounts',
  PHOTO_MANAGEMENT = 'photo-management',
  GALLERY = 'gallery',
  SETTINGS = 'settings',
  SERVERS = 'servers',
  ACCESS_CONTROL = 'access-control',
  ACCOUNT = 'account',
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
  /**
   * Entry-level permission gating sidebar visibility and route access (OWNER bypass).
   * An array means "any of" — the section is reachable with at least one of the permissions.
   */
  permission?: Permission | Permission[];
  /** Render without the full-screen glass card wrapper (page provides its own centered card). */
  bare?: boolean;
};

export type CommonRouteType = RouteType<CommonNavigationRoute>;

export type MainRouteType = RouteType<MainNavigationRoute>;

export type ServerRouteType = RouteType<ServerNavigationRoute>;
