import { useContext, useEffect } from 'react';
import { WebSocketContext } from '~/contexts/WebSocket/WebSocketContext';

/**
 * Subscribe to a socket.io event. The callback receives the event payload.
 * Server events (server.*) carry only an id; process.* / server-command.update
 * carry full payloads — type them via the generic.
 */
const useWebSocket = <T = void>(messageType: string, callback: (payload: T) => void) => {
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
