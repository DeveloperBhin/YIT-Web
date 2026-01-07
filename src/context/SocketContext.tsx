'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'https://yit-apis.onrender.com',
      {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
      }
    );

    s.on('connect', () => console.log('✅ Connected:', s.id));
    s.on('disconnect', () => console.log('⚠️ Disconnected'));
    s.on('connect_error', (err) =>
      console.error('❌ Socket error:', err.message)
    );

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
