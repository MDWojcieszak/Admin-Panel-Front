import { useContext, useEffect } from 'react';
import { WebSocketContext } from '~/contexts/WebSocket/WebSocketContext';

const useWebSocket = (messageType: string, callback: F0) => {
  const ctx = useContext(WebSocketContext);

  useEffect(() => {
    if (!ctx || !ctx.socket) return;

    ctx.socket.on(messageType, callback);
    return () => {
      ctx?.socket?.off(messageType, callback);
    };
  }, [ctx, ctx?.socket, messageType, callback]);
};

export default useWebSocket;
