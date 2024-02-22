import { ApiTag, Auth } from '~/api/types';
import { getAccessToken, getRefreshToken } from '~/utils/accessToken';

const getToken = (authType: Auth) => (authType === Auth.DEFAULT ? getAccessToken() : getRefreshToken());

type Params<T> = {
  body?: T;
  auth?: Auth;
};

export const api = <T extends Object>(tag: ApiTag) => {
  const request = async (endpoint: string, method: string, body?: T, auth: Auth = Auth.DEFAULT): Promise<Response> => {
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
    return response;
  };

  return {
    get: async (endpoint: string, params: Params<T> = { auth: Auth.DEFAULT }) =>
      request(endpoint, 'GET', params.body, params.auth),

    post: async (endpoint: string, params: Params<T> = { auth: Auth.DEFAULT }) =>
      request(endpoint, 'POST', params.body, params.auth),

    put: async (endpoint: string, params: Params<T> = { auth: Auth.DEFAULT }) =>
      request(endpoint, 'PUT', params.body, params.auth),

    delete: async (endpoint: string, params: Params<T> = { auth: Auth.DEFAULT }) =>
      request(endpoint, 'DELETE', params.body, params.auth),
  };
};
