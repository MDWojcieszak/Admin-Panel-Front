import { ReactNode, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { UserState } from '~/contexts/User/AuthContext';
import { WebSocketContext } from '~/contexts/WebSocket/WebSocketContext';
import { useAuth } from '~/hooks/useAuth';

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const auth = useAuth();

  useEffect(() => {
    if (auth.userState !== UserState.LOGGED_IN) return;
    const newSocket = io(import.meta.env.VITE_API_URL as string);
    setSocket(newSocket);
    console.log(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [auth.userState]);

  return <WebSocketContext.Provider value={{ socket }}>{children}</WebSocketContext.Provider>;
};
