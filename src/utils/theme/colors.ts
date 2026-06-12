const palette = {
  white: '#FFFFFF',
  black: '#000000',
  dark01: '#1E2025',
  dark02: '#29343D',
  dark03: '#3C5665',
  dark04: '#5A7480',
  dark05: '#92A4B1',
} as const;

const bluePalette = {
  blue01: '#142632',
  blue02: '#203B4C',
  blue03: '#447596',
  blue04: '#B7D3E8',
};

const purplePalette = {
  purple01: '#784DFF',
  purple02: '#B178FF',
  purple03: '#D895FF',
};

const fallSeasonPalette = {
  gray01: '#333944',
  gray02: '#292d38',
  gray03: '#1f222a',
  gray04: '#14171c',
  gray045: '#0F1115',
  gray05: '#0B0C0D',
  mainGreen: '#359E7A',
  lightGreen: '#8CCF77',
  yellow: '#F9F871',
  red: '#F75E79',
  blue: '#009DF8',
  lightBlue: '#D1F5FF',
};

export const colors = {
  background: palette.black,
  ...bluePalette,
  ...purplePalette,
  ...fallSeasonPalette,
  ...palette,
} as const;

/**
 * Light variant — same KEYS as the dark palette so `mkUseStyles` styles adapt just by swapping the
 * theme. Semantics are preserved: `gray05` = main background (lightest here), `white` = primary text /
 * subtle borders (dark here), `dark05` = muted text.
 */
export const lightColors: Record<keyof typeof colors, string> = {
  background: '#FFFFFF',
  blue01: '#E6F1FA',
  blue02: '#CFE3F1',
  blue03: '#3F7592',
  blue04: '#356179',
  purple01: '#6A45E6',
  purple02: '#5B39C8',
  purple03: '#4C2FA8',
  gray01: '#CED4DA',
  gray02: '#DEE3E9',
  gray03: '#E8ECF0',
  gray04: '#F1F3F5',
  gray045: '#F7F8FA',
  gray05: '#FFFFFF',
  mainGreen: '#2E8C6A',
  lightGreen: '#4F9B3C',
  yellow: '#B58900',
  red: '#DC3545',
  blue: '#0086D6',
  lightBlue: '#2C7DA0',
  dark01: '#1E2025',
  dark02: '#29343D',
  dark03: '#3C5665',
  dark04: '#5A7480',
  dark05: '#6B7785',
  white: '#1A1D21',
  black: '#000000',
};
