import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';
import { ModalManagerProvider } from '~/contexts/ModalManager/ModalManagerProvider';
import { UserProvider } from '~/contexts/User/UserProvider';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return (
    <ThemeProvider theme={p.theme}>
      <UserProvider>
        <ModalManagerProvider>{p.children}</ModalManagerProvider>
      </UserProvider>
    </ThemeProvider>
  );
};
