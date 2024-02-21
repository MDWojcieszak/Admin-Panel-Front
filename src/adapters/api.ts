import Cookies from 'js-cookie';
import { ApiTag, Auth } from '~/api/types';

const getToken = (authType: Auth) =>
  Cookies.get(
    authType === Auth.DEFAULT
      ? (import.meta.env.VITE_TOKEN_KEY as string)
      : (import.meta.env.VITE_REFRESH_TOKEN_KEY as string),
  );

export const api = <T extends Object, P extends Object>(tag: ApiTag) => {
  const request = async (endpoint: string, method: string, body?: T, auth: Auth = Auth.DEFAULT): Promise<P> => {
    const token = getToken(auth);
    const apiUrl = import.meta.env.VITE_API_URL as string;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(auth !== Auth.PUBLIC && { Authorization: `Bearer ${token}` }),
    };

    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${apiUrl}/${tag}/${endpoint}`, options);
    if (!response.ok) throw new Error((await response.json()).message);

    return response.json();
  };

  return {
    get: async (endpoint: string, auth: Auth = Auth.DEFAULT, body?: T) => request(endpoint, 'GET', body, auth),

    post: async (endpoint: string, body: T, auth: Auth = Auth.DEFAULT) => request(endpoint, 'POST', body, auth),

    put: async (endpoint: string, body: T, auth: Auth = Auth.DEFAULT) => request(endpoint, 'PUT', body, auth),

    delete: async (endpoint: string, body: T, auth: Auth = Auth.DEFAULT) => request(endpoint, 'DELETE', body, auth),
  };
};
