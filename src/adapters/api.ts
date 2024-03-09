import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiTag, Auth } from '~/api/types';
import { getAccessToken, getRefreshToken } from '~/utils/accessToken';

const getToken = (authType: Auth) => (authType === Auth.DEFAULT ? getAccessToken() : getRefreshToken());
type RequestType = 'JSON' | 'FormData';
type Params<T> = {
  body?: T;
  auth?: Auth;
  type?: RequestType;
  token?: string;
  uploadProgressCallback?: F1<ProgressEvent>;
  downloadProgressCallback?: F1<ProgressEvent>;
};

export const api = <T extends Object>(tag: ApiTag) => {
  const request = async (endpoint: string, method: string, params?: Params<T>): Promise<Response> => {
    const token = params?.auth === Auth.CUSTOM ? params.token : getToken(params?.auth || Auth.DEFAULT);
    const apiUrl = import.meta.env.VITE_API_URL as string;
    const headers: Record<string, string> = {
      'Content-Type': params?.type === 'FormData' ? 'multipart/form-data' : 'application/json',
      ...(params?.auth !== Auth.PUBLIC && { Authorization: `Bearer ${token}` }),
    };
    try {
      const response = await axios.request({
        url: `${apiUrl}/${tag}/${endpoint}`,
        method,
        headers,
        params: method === 'GET' ? params?.body : undefined,
        data: params?.body,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error((axiosError?.response?.data as any)?.message || error.message || 'Unknown error occurred');
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  };

  const getBlob = async (endpoint: string, params?: Params<T>) => {
    const apiUrl = import.meta.env.VITE_API_URL as string;

    try {
      const response: AxiosResponse<Blob> = await axios.get(`${apiUrl}/${tag}/${endpoint}`, {
        params: params?.body,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  return {
    getBlob,
    get: async (endpoint: string, params?: Params<T>) => request(endpoint, 'GET', params),

    post: async (endpoint: string, params?: Params<T>) => request(endpoint, 'POST', params),

    put: async (endpoint: string, params?: Params<T>) => request(endpoint, 'PUT', params),

    delete: async (endpoint: string, params?: Params<T>) => request(endpoint, 'DELETE', params),
  };
};
