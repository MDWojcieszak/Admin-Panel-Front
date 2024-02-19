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

const fallSeasonPalette = {
  gray01: '#333944',
  gray02: '#292d38',
  gray03: '#1f222a',
  gray04: '#14171c',
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
  ...fallSeasonPalette,
  ...palette,
} as const;
