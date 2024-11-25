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

const ResetPasswordRequestDto = z.object({
  email: z.string().email(),
  deleteSessions: z.boolean().optional(),
});

export type ResetPasswordRequestDto = z.infer<typeof ResetPasswordRequestDto>;

const ResetPasswordDto = z.object({
  newPassword: z.string().email(),
  deleteSessions: z.boolean(),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

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

  async resetPasswordRequest(dto: ResetPasswordRequestDto): Promise<boolean> {
    try {
      await api<ResetPasswordRequestDto>(AuthService.tag).post('reset-password-request', {
        auth: Auth.PUBLIC,
        body: dto,
      });
      return true;
    } catch (error) {
      console.error('Error reseting password:', error);
      throw error;
    }
  },

  async resetPassword(dto: ResetPasswordDto, token: string): Promise<boolean> {
    try {
      await api<ResetPasswordDto>(AuthService.tag).post('reset-password', {
        auth: Auth.CUSTOM,
        token,
        body: dto,
      });
      return true;
    } catch (error) {
      console.error('Error reseting password:', error);
      throw error;
    }
  },
};
