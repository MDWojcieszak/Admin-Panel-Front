const palette = {
  white: '#FFFFFF',
  black: '#000000',
  dark01: '#1E2025',
  dark02: '#29343D',
  dark03: '#3C5665',
  dark04: '#5A7480',
  dark05: '#92A4B1',
} as const;

export const colors = {
  background: palette.black,
  ...palette,
} as const;
