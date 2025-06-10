import type { GameAction, GameSettings } from '@shared/types/game';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseGameSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  createRoom: (settings: GameSettings, nickname: string) => Promise<void>;
  joinRoom: (roomCode: string, nickname: string) => Promise<void>;
  leaveRoom: () => void;
  sendGameAction: (action: GameAction) => void;
  startGame: () => void;
}

export function useGameSocket(): UseGameSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_SERVER_URL || 'http://localhost:7777'
    );

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = async (
    settings: GameSettings,
    nickname: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('create-room', settings);

      const timeout = setTimeout(() => {
        reject(new Error('Timeout creating room'));
      }, 5000);

      socket.once('room-created', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.once('room-error', (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      });
    });
  };

  const joinRoom = async (
    roomCode: string,
    nickname: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('join-room', roomCode, nickname);

      const timeout = setTimeout(() => {
        reject(new Error('Timeout joining room'));
      }, 5000);

      socket.once('room-joined', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.once('room-error', (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      });
    });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
  };

  const sendGameAction = (action: GameAction) => {
    if (socket) {
      socket.emit('game-action', action);
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('start-game');
    }
  };

  return {
    socket,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    sendGameAction,
    startGame,
  };
}
