import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag, Auth } from '~/api/types';

const AuthDto = z.object({
  email: z.string().email(),
  password: z.string(),
  platform: z.string(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

type AuthDto = z.infer<typeof AuthDto>;

const TokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

type TokenResponse = z.infer<typeof TokenResponse>;

export const AuthService = {
  tag: ApiTag.AUTH,

  async signIn(signInData: AuthDto): Promise<TokenResponse> {
    try {
      const response = await api<AuthDto>(AuthService.tag).post('local/signin', {
        body: signInData,
        auth: Auth.PUBLIC,
      });
      return TokenResponse.parse(await response.json());
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api(AuthService.tag).post('logout');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  async refresh(): Promise<TokenResponse> {
    try {
      const response = await api(AuthService.tag).post('refresh', { auth: Auth.REFRESH });
      return TokenResponse.parse(await response.json());
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },
};
