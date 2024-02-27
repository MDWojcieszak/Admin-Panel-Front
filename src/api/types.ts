import { z } from 'zod';

export enum ApiTag {
  AUTH = 'auth',
  USER = 'user',
  IMAGE = 'image',
  SESSION = 'session',
  FILE = 'file',
}

export enum Auth {
  PUBLIC,
  DEFAULT,
  REFRESH,
}

export const PaginationDto = z.object({
  take: z.number().min(1).max(20),
  skip: z.number().optional(),
});

export type PaginationDto = z.infer<typeof PaginationDto>;
