import Cookies from 'js-cookie';
import { ReactNode, useEffect, useState } from 'react';
import { CookieKey, UserContext, UserContextType, UserData, UserState } from '~/contexts/User/UserContext';

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userState, setUserState] = useState<UserState>(UserState.UNKNOWN);
  const [userData, setUserData] = useState<UserData>();

  const initializeAppCredentials = () => {
    const visitData = Cookies.get(CookieKey.USER_VISIT);
    if (!visitData) {
      return setUserState(UserState.FIRST_VISIT);
    }
    const refreshToken = Cookies.get(import.meta.env.VITE_REFRESH_TOKEN_KEY as string);
    if (!refreshToken) {
      return setUserState(UserState.REQUIRES_LOGIN);
    }
  };

  const setTokens: UserContextType['setTokens'] = (tokens) => {
    setUserState(UserState.LOGGED_IN);
    Cookies.set(import.meta.env.VITE_TOKEN_KEY as string, tokens.access_token);
    Cookies.set(import.meta.env.VITE_REFRESH_TOKEN_KEY as string, tokens.refresh_token);
  };

  useEffect(() => {
    initializeAppCredentials();
  }, []);

  return <UserContext.Provider value={{ userState, userData, setTokens }}>{children}</UserContext.Provider>;
};
