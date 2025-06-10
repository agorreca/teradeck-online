import { SocketEvents } from '@shared/types/game';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket<SocketEvents> | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (socket?.connected) return;

    const newSocket = io(
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:7777',
      {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      }
    );

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', error => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Auto-connect when hook is first used
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
