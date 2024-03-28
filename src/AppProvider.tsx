import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';
import { ModalManagerProvider } from '~/contexts/ModalManager/ModalManagerProvider';
import { AuthProvider } from '~/contexts/User/AuthProvider';
import { WebSocketProvider } from '~/contexts/WebSocket/WebSocketProvider';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return (
    <ThemeProvider theme={p.theme}>
      <AuthProvider>
        <WebSocketProvider>
          <ModalManagerProvider>{p.children}</ModalManagerProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
