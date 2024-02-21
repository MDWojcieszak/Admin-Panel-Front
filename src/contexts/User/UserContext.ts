import { createContext } from 'react';
import { F1 } from '~/types/types';

export enum CookieKey {
  USER_VISIT = 'user_visit',
}

export const TOKEN_TIME = 15 * 60 * 60;

export enum UserState {
  UNKNOWN,
  FIRST_VISIT,
  REQUIRES_LOGIN,
  LOGGED_IN,
}

export type UserData = {
  email: string;
  name: string;
  avatarUrl?: string;
};

export type UserContextType = {
  userState: UserState;
  userData: UserData | undefined;
  setTokens: F1<{ access_token: string; refresh_token: string }>;
};

export const UserContext = createContext<UserContextType | null>(null);
