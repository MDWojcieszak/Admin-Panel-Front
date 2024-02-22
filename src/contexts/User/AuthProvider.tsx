import Cookies from 'js-cookie';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { AuthService } from '~/api/Auth';
import { AuthContext, AuthContextType, CookieKey, UserData, UserState } from '~/contexts/User/AuthContext';
import {
  getAccessToken,
  getRefreshToken,
  getRemainingTokenTime,
  getTokenData,
  isTokenValid,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '~/utils/accessToken';

type UserProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: UserProviderProps) => {
  const [userState, setUserState] = useState<UserState>(UserState.UNKNOWN);
  const [userData, setUserData] = useState<UserData>();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initializeAppCredentials = () => {
    const visitData = Cookies.get(CookieKey.USER_VISIT);
    if (!visitData) {
      Cookies.set(CookieKey.USER_VISIT, '1');
      return setUserState(UserState.FIRST_VISIT);
    }
    Cookies.set(CookieKey.USER_VISIT, (Number(visitData) + 1).toString());

    const refreshToken = getRefreshToken();

    if (isTokenValid(refreshToken)) {
      const accessToken = getAccessToken();
      if (isTokenValid(accessToken)) {
        setUserState(UserState.LOGGED_IN);
        return scheduleTokenRefresh(accessToken!);
      }
      return refreshTokens();
    }
    setUserState(UserState.REQUIRES_LOGIN);
  };

  const setTokens: AuthContextType['setTokens'] = (tokens) => {
    const { access_token: accessToken, refresh_token: refresfToken } = tokens;

    setAccessToken(accessToken);
    setRefreshToken(refresfToken);

    const accessTokenData = getTokenData(accessToken);
    if (!accessTokenData) {
      setUserState(UserState.REQUIRES_LOGIN);
      return false;
    }
    setUserState(UserState.LOGGED_IN);
    return scheduleTokenRefresh(accessToken);
  };

  const scheduleTokenRefresh = (accessToken: string) => {
    const remainingTime = getRemainingTokenTime(accessToken);
    if (remainingTime === 0) {
      setUserState(UserState.REQUIRES_LOGIN);
      return false;
    }
    timeoutRef.current = setTimeout(refreshTokens, remainingTime);
    return true;
  };

  const refreshTokens = async () => {
    try {
      const tokens = await AuthService.refresh();
      setTokens(tokens);
    } catch (error) {
      console.log(error);
      setUserState(UserState.REQUIRES_LOGIN);
    }
  };

  const removeTokens = () => {
    removeAccessToken();
    removeRefreshToken();
    setUserState(UserState.REQUIRES_LOGIN);
    timeoutRef.current && clearInterval(timeoutRef.current);
  };

  useEffect(() => {
    console.log(userState);
  }, [userState]);

  useEffect(() => {
    initializeAppCredentials();
    return () => {
      timeoutRef.current && clearInterval(timeoutRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ userState, userData, setTokens, removeTokens }}>{children}</AuthContext.Provider>
  );
};
