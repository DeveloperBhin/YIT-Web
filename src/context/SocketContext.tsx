'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://yit-apis.onrender.com', {
      autoConnect: true,
      withCredentials: true,
    });

    s.on('connect', () => console.log('✅ Connected:', s.id));
    s.on('disconnect', (reason) => console.log('⚠️ Disconnected:', reason));
    s.on('connect_error', (err) => console.log('❌ Connect error:', err));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
