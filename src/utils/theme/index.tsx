import { useContext, useMemo } from 'react';
import { colors, lightColors } from './colors';
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

const colorOpacity = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0');

export type ThemeColors = Record<keyof typeof colors, string>;

export type Theme = typeof baseTheme & {
  colors: ThemeColors;
  colorOpacity: (value: number) => string;
  mode: 'dark' | 'light';
};

export const theme: Theme = {
  ...baseTheme,
  colors,
  colorOpacity,
  mode: 'dark',
};

/** Dark is the app default; the blog editor can switch its subtree to light via a nested provider. */
export const darkTheme: Theme = theme;
export const lightTheme: Theme = {
  ...baseTheme,
  colors: lightColors,
  colorOpacity,
  mode: 'light',
};

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
