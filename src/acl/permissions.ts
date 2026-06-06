/**
 * Static catalog of permission keys (resource.action) mirroring the backend ACL.
 * Runtime source of truth remains `GET /acl/permissions`; this list exists only
 * to give autocomplete and compile-time safety for `can(...)` calls and gating.
 */
export const PERMISSIONS = [
  'server.read',
  'server.power',
  'server.category.manage',
  'server.disk.manage',
  'command.read',
  'command.execute',
  'command.manage',
  'process.read',
  'process.delete',
  'settings.read',
  'settings.manage',
  'transfer.read',
  'transfer.manage',
  'user.read',
  'user.manage',
  'token.read',
  'token.manage',
  'session.read',
  'session.manage',
  'image.delete',
  'photoEntry.read',
  'photoEntry.manage',
  'astroObject.read',
  'astroObject.manage',
  'ai.manage',
  'ocr.use',
  'acl.manage',
  'acl.assign',
  'dashboard.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Resolve "any of" semantics for an optional permission requirement. */
export const hasAccess = (
  can: (permission: Permission | string | undefined) => boolean,
  required?: Permission | Permission[],
): boolean => {
  if (!required) return true;
  if (Array.isArray(required)) return required.some((p) => can(p));
  return can(required);
};
