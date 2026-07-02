import { ReactNode } from 'react';
import { Permission } from '~/acl/permissions';

export enum MainNavigationRoute {
  DASHBOARD = 'dashboard',
  ACCOUNTS = 'accounts',
  PHOTO_MANAGEMENT = 'photo-management',
  GALLERIES = 'galleries',
  GALLERY = 'gallery',
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations',
  SERVERS = 'servers',
  SYSTEM_STATUS = 'system-status',
  ACCESS_CONTROL = 'access-control',
  ACCOUNT = 'account',
  ABOUT = 'about',
  BLOG = 'blog',
}

export enum PhotoNavigationRoute {
  LIBRARY = '',
  ALBUMS = 'albums',
}

export enum GalleryNavigationRoute {
  GALLERIES = '',
  IMAGES = 'images',
  HERO = 'hero',
  GEAR = 'gear',
  PROCESSING = 'processing',
}

export enum BlogNavigationRoute {
  POSTS = '',
  CATEGORIES = 'categories',
  PLACES = 'places',
  COUNTRIES = 'countries',
  COLLECTIONS = 'collections',
  HOME = 'home',
  TEMPLATES = 'templates',
  INSIGHTS = 'insights',
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

/** A nested link shown in the sidebar beneath its active parent item. */
export type SubNavItem = {
  /** Relative path under the parent (e.g. '' for the index, 'albums' for a child). */
  path: string;
  label: string;
  permission?: Permission | Permission[];
};

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
  /** Sub-links revealed in the sidebar under this item when its section is active. */
  subItems?: SubNavItem[];
  /** Render without the full-screen glass card wrapper (page provides its own centered card). */
  bare?: boolean;
};

export type CommonRouteType = RouteType<CommonNavigationRoute>;

export type MainRouteType = RouteType<MainNavigationRoute>;

export type ServerRouteType = RouteType<ServerNavigationRoute>;

export type BlogRouteType = RouteType<BlogNavigationRoute>;
