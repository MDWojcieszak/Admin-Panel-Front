import { ReactNode } from 'react';
import { ThemeContext } from '~/contexts/Theme/ThemeContext';
import { Theme } from '~/utils/theme';

type ThemeProviderProps = {
  children: ReactNode;
  theme: Theme;
};

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
