import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return <ThemeProvider theme={p.theme}>{p.children}</ThemeProvider>;
};
