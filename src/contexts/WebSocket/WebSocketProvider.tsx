import { ReactNode, useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { UserState } from '~/contexts/User/AuthContext';
import { WebSocketContext } from '~/contexts/WebSocket/WebSocketContext';
import { useAuth } from '~/hooks/useAuth';

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userState, accessToken } = useAuth();

  // Keep the latest token available to the connection effect without recreating
  // the socket on every refresh (token rotation is handled separately below).
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const connectedTokenRef = useRef<string>();

  useEffect(() => {
    if (userState !== UserState.LOGGED_IN) return;
    const newSocket = io(import.meta.env.VITE_API_URL as string, {
      auth: { token: tokenRef.current },
    });
    connectedTokenRef.current = tokenRef.current;
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [userState]);

  // On access-token rotation (refresh) re-auth the existing socket and reconnect.
  useEffect(() => {
    if (!socket || !accessToken) return;
    if (connectedTokenRef.current === accessToken) return; // already connected with this token
    connectedTokenRef.current = accessToken;
    socket.auth = { token: accessToken };
    socket.disconnect().connect();
  }, [accessToken, socket]);

  return <WebSocketContext.Provider value={{ socket }}>{children}</WebSocketContext.Provider>;
};
