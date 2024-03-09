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

export type AuthDto = z.infer<typeof AuthDto>;

const TokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export type TokenResponse = z.infer<typeof TokenResponse>;

const CheckRegisterToken = z.object({
  email: z.string().email(),
  firstName: z.string(),
});

export type CheckRegisterToken = z.infer<typeof CheckRegisterToken>;

const RegisterDto = z.object({
  password: z.string(),
});

export type RegisterDto = z.infer<typeof RegisterDto>;

export const AuthService = {
  tag: ApiTag.AUTH,

  async signIn(signInData: AuthDto): Promise<TokenResponse> {
    try {
      const response = await api<AuthDto>(AuthService.tag).post('local/signin', {
        body: signInData,
        auth: Auth.PUBLIC,
      });
      return TokenResponse.parse(response);
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
      return TokenResponse.parse(response);
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  async checkRegisterToken(token: string): Promise<CheckRegisterToken> {
    try {
      const response = await api(AuthService.tag).post('check-register', {
        auth: Auth.CUSTOM,
        token: token,
      });
      return CheckRegisterToken.parse(response);
    } catch (error) {
      console.error('Error checking token:', error);
      throw error;
    }
  },

  async registerUser(dto: RegisterDto, token: string): Promise<boolean> {
    try {
      await api<RegisterDto>(AuthService.tag).post('register', {
        auth: Auth.CUSTOM,
        token: token,
        body: dto,
      });
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
};
