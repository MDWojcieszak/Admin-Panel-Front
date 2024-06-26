import { z } from 'zod';

export enum ApiTag {
  AUTH = 'auth',
  USER = 'user',
  IMAGE = 'image',
  SESSION = 'session',
  FILE = 'file',
  SERVER = 'server',
  SERVER_COMMANDS = 'server/commands',
}

export enum Auth {
  PUBLIC,
  DEFAULT,
  REFRESH,
  CUSTOM,
}

export const PaginationDto = z.object({
  take: z.number().min(1).max(20),
  skip: z.number().optional(),
});

export type PaginationDto = z.infer<typeof PaginationDto>;
