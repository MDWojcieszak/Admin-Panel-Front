/**
 * Device-flow user codes. The generating alphabet omits 0/O/1/I/L so a code
 * survives being read off one screen and typed into another; anything outside
 * it can never be part of a real code, so it is dropped rather than rejected.
 * That keeps a pasted `wxyz 1234` or `wxyz1234` working — the backend
 * normalizes the same way before it looks the code up.
 */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const OUTSIDE_ALPHABET = new RegExp(`[^${CODE_ALPHABET}]`, 'g');
const CODE_LENGTH = 8;

/** `wxyz 1234` → `WXYZ1234`. Undashed, upper case, capped at full length. */
export const normalizeUserCode = (raw: string): string =>
  raw.toUpperCase().replace(OUTSIDE_ALPHABET, '').slice(0, CODE_LENGTH);

/** `wxyz1234` → `WXYZ-1234`, the form the backend stores and the app displays. */
export const formatUserCode = (raw: string): string => {
  const bare = normalizeUserCode(raw);
  return bare.length > 4 ? `${bare.slice(0, 4)}-${bare.slice(4)}` : bare;
};

export const isCompleteUserCode = (raw: string): boolean => normalizeUserCode(raw).length === CODE_LENGTH;
