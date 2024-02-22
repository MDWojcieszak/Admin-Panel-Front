import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';
import { ModalManagerProvider } from '~/contexts/ModalManager/ModalManagerProvider';
import { AuthProvider } from '~/contexts/User/AuthProvider';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return (
    <ThemeProvider theme={p.theme}>
      <AuthProvider>
        <ModalManagerProvider>{p.children}</ModalManagerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
