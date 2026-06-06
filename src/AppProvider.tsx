import { ReactNode } from 'react';
import { ThemeProvider } from './contexts/Theme/ThemeProvider';
import { Theme } from './utils/theme';
import { ModalManagerProvider } from '~/contexts/ModalManager/ModalManagerProvider';
import { AuthProvider } from '~/contexts/User/AuthProvider';
import { WebSocketProvider } from '~/contexts/WebSocket/WebSocketProvider';
import { ApiProvider } from '~/contexts/Api/ApiProvider';
import { PermissionsProvider } from '~/contexts/Permissions/PermissionsProvider';

type AppProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export const AppProvider = (p: AppProviderProps) => {
  return (
    <ThemeProvider theme={p.theme}>
      <AuthProvider>
        <ApiProvider>
          <PermissionsProvider>
            <WebSocketProvider>
              <ModalManagerProvider>{p.children}</ModalManagerProvider>
            </WebSocketProvider>
          </PermissionsProvider>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
