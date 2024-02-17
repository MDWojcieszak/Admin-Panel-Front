import { useMemo } from 'react';
import { colors } from './colors';

import { useContext } from 'react';
import { ThemeContext } from '~/contexts/Theme/ThemeContext';

export const baseTheme = {
  spacing: {
    xxs: 4,
    xs: 6,
    s: 8,
    sm: 12,
    m: 16,
    l: 22,
    xl: 32,
    xxl: 42,
  },
  borderRadius: {
    small: 4,
    default: 8,
    medium: 10,
    large: 12,
  },
};

export const theme = {
  ...baseTheme,
  colors,
};

export type Theme = typeof theme;

export const useTheme = () => {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw Error('Use this hook in ThemeProvider scope!');
  return ctx;
};

type NamedStyle<T> = { [P in keyof T]: React.CSSProperties };

export const mkUseStyles =
  <T extends NamedStyle<T>>(styles: (globalTheme: Theme) => T) =>
  () => {
    const currentTheme = useTheme();
    return useMemo(() => ({ ...styles(currentTheme) }), [currentTheme]);
  };
