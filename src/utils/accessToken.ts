import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const TIME_OFFSET = 1000 * 5;

export const getAccessToken = () => {
  return Cookies.get(import.meta.env.VITE_TOKEN_KEY as string);
};

export const getRefreshToken = () => {
  return Cookies.get(import.meta.env.VITE_REFRESH_TOKEN_KEY as string);
};

export const setAccessToken = (token: string) => {
  return Cookies.set(import.meta.env.VITE_TOKEN_KEY as string, token);
};

export const setRefreshToken = (token: string) => {
  return Cookies.set(import.meta.env.VITE_REFRESH_TOKEN_KEY as string, token);
};

export const removeAccessToken = () => {
  return Cookies.remove(import.meta.env.VITE_TOKEN_KEY as string);
};

export const removeRefreshToken = () => {
  return Cookies.remove(import.meta.env.VITE_REFRESH_TOKEN_KEY as string);
};

export const isTokenValid = (accessToken: string | undefined) => {
  if (!accessToken) return false;

  const tokenData = jwtDecode(accessToken);
  if (!tokenData || typeof tokenData === 'string' || !tokenData.exp || Date.now() >= tokenData.exp * 1000) return false;
  return true;
};

export const getTokenData = (accessToken: string) => {
  const tokenData = jwtDecode(accessToken);
  if (!tokenData || typeof tokenData === 'string') return false;
  return tokenData;
};

export const getRemainingTokenTime = (accessToken: string): number => {
  const tokenData = jwtDecode(accessToken);
  if (!tokenData || typeof tokenData === 'string' || !tokenData.exp) return 0;

  const expirationTime = tokenData.exp * 1000;
  const currentTime = Date.now();

  if (currentTime >= expirationTime) return 0;

  return expirationTime - currentTime - TIME_OFFSET;
};
