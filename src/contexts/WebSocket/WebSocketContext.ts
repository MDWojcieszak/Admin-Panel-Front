import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export type UserData = {
  email: string;
  name: string;
  avatarUrl?: string;
};

export type WebSocketContextType = {
  socket: Socket | null;
};

export const WebSocketContext = createContext<WebSocketContextType | null>(null);
