import { api } from '~/adapters/api';
import { ApiTag, Auth } from '~/api/types';

interface AuthDto {
  email: string;
  password: string;
  platform: string;
  browser?: string;
  os?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const AuthService = {
  tag: ApiTag.AUTH,

  async signIn(signInData: AuthDto): Promise<TokenResponse> {
    try {
      return await api<AuthDto, TokenResponse>(AuthService.tag).post('local/signin', signInData, Auth.PUBLIC);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api<any, any>(AuthService.tag).post('logout', {});
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  async refresh(): Promise<TokenResponse> {
    try {
      return await api<any, TokenResponse>(AuthService.tag).post('refresh', {}, Auth.REFRESH);
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },
};
