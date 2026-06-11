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
