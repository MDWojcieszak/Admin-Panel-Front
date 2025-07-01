import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';
import { ModalManagerProvider } from '~/contexts/ModalManager/ModalManagerProvider';
import { AuthProvider } from '~/contexts/User/AuthProvider';
import { WebSocketProvider } from '~/contexts/WebSocket/WebSocketProvider';
import { ApiProvider } from '~/contexts/Api/ApiProvider';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return (
    <ThemeProvider theme={p.theme}>
      <AuthProvider>
        <ApiProvider>
          <WebSocketProvider>
            <ModalManagerProvider>{p.children}</ModalManagerProvider>
          </WebSocketProvider>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
