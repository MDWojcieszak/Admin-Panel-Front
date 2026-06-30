/** HTTP status of a failed axios request, if any. */
export const getApiErrorStatus = (e: unknown): number | undefined =>
  (e as { response?: { status?: number } })?.response?.status;

/**
 * Human-readable message from a failed axios request. Nest's validation pipe
 * returns `message` as a string or string[]; fall back to the given default.
 */
export const getApiErrorMessage = (e: unknown, fallback: string): string => {
  const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : raw;
  return message || fallback;
};
