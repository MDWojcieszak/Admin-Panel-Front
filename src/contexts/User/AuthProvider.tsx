import Cookies from 'js-cookie';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { AuthService } from '~/apiOld/Auth';
import { AuthContext, AuthContextType, CookieKey, UserData, UserState } from '~/contexts/User/AuthContext';
import {
  getAccessToken,
  getRefreshToken,
  getRemainingTokenTime,
  getTokenData,
  isTokenValid,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken as setAccessTokenToCookie,
  setRefreshToken as setRefreshTokenToCookie,
} from '~/utils/accessToken';

type UserProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: UserProviderProps) => {
  const [userState, setUserState] = useState<UserState>(UserState.UNKNOWN);
  const [userData, setUserData] = useState<UserData>();
  const [accessToken, setAccessToken] = useState<string>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUserData = (token: string): UserData | undefined => {
    const data = getTokenData(token);
    if (!data || typeof data === 'string') return undefined;
    const claims = data as { sub?: string; email?: string; role?: string };
    return {
      email: claims.email ?? '',
      name: claims.email ?? '',
      id: claims.sub,
      role: claims.role,
    };
  };

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
        setAccessToken(accessToken);
        setUserData(buildUserData(accessToken!));
        setUserState(UserState.LOGGED_IN);
        return scheduleTokenRefresh(accessToken!);
      }
      return refreshTokens();
    }
    setUserState(UserState.REQUIRES_LOGIN);
  };

  const setTokens: AuthContextType['setTokens'] = (tokens) => {
    const { access_token: accessToken, refresh_token: refresfToken } = tokens;
    setUserData(buildUserData(accessToken));
    setAccessToken(accessToken);
    setAccessTokenToCookie(accessToken);
    setRefreshTokenToCookie(refresfToken);

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
      if (!tokens.access_token || !tokens.refresh_token) throw new Error('Invalid tokens received');
      setTokens({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
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
    initializeAppCredentials();
    return () => {
      timeoutRef.current && clearInterval(timeoutRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ userState, userData, accessToken, setTokens, removeTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
