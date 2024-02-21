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

export enum Role {
  USER,
  MODERATOR,
  ADMIN,
  OWNER,
}
