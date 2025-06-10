import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useGameSocket } from '../../hooks/useGameSocket';
import gameSlice from '../../store/gameSlice';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameSlice.reducer
    },
    preloadedState: {
      game: {
        currentRoom: null,
        currentPlayer: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

const createWrapper = (store: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useGameSocket Hook', () => {
  let mockSocket: any;
  let store: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock socket
    mockSocket = {
      connected: true,
      id: 'test-socket-id',
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn()
    };
    
    (io as jest.Mock).mockReturnValue(mockSocket);
    
    // Create store
    store = createMockStore();
  });

  afterEach(() => {
    // Clean up
    if (mockSocket) {
      mockSocket.disconnect();
    }
  });

  describe('Socket Connection', () => {
    it('should establish socket connection on mount', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      expect(io).toHaveBeenCalledWith('http://localhost:7777', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
    });

    it('should register socket event listeners', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      expect(mockSocket.on).toHaveBeenCalledWith('room-created', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('room-joined', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('room-state', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('game-started', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('player-left', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('room-error', expect.any(Function));
    });

    it('should cleanup socket on unmount', () => {
      const { unmount } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('room-created');
      expect(mockSocket.off).toHaveBeenCalledWith('room-joined');
      expect(mockSocket.off).toHaveBeenCalledWith('room-state');
      expect(mockSocket.off).toHaveBeenCalledWith('game-started');
      expect(mockSocket.off).toHaveBeenCalledWith('player-left');
      expect(mockSocket.off).toHaveBeenCalledWith('room-error');
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Room Creation', () => {
    it('should emit create-room event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const roomData = {
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2
      };

      act(() => {
        result.current.createRoom(roomData);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('create-room', roomData);
    });

    it('should handle room-created event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'test-socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      // Simulate room-created event
      const roomCreatedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-created'
      )[1];

      act(() => {
        roomCreatedHandler({ room: mockRoom });
      });

      expect(mockNavigate).toHaveBeenCalledWith(`/room/${mockRoom.code}`);
    });
  });

  describe('Room Joining', () => {
    it('should emit join-room event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const joinData = {
        roomCode: 'TEST123',
        nickname: 'Player2'
      };

      act(() => {
        result.current.joinRoom(joinData);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('join-room', joinData);
    });

    it('should handle room-joined event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [
          { id: 'host-id', nickname: 'Host', isHost: true },
          { id: 'test-socket-id', nickname: 'Player2', isHost: false }
        ],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      // Simulate room-joined event
      const roomJoinedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-joined'
      )[1];

      act(() => {
        roomJoinedHandler({ room: mockRoom });
      });

      expect(mockNavigate).toHaveBeenCalledWith(`/room/${mockRoom.code}`);
    });
  });

  describe('Game Actions', () => {
    it('should emit start-game event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      act(() => {
        result.current.startGame('TEST123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('start-game', { roomCode: 'TEST123' });
    });

    it('should emit leave-room event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      act(() => {
        result.current.leaveRoom('TEST123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', { roomCode: 'TEST123' });
    });

    it('should emit get-room-state event', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      act(() => {
        result.current.getRoomState('TEST123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('get-room-state', { roomCode: 'TEST123' });
    });
  });

  describe('Event Handling', () => {
    it('should handle room-state event', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'test-socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      // Simulate room-state event
      const roomStateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-state'
      )[1];

      act(() => {
        roomStateHandler({ room: mockRoom });
      });

      // Check if store was updated (would need to test store state)
      const state = store.getState();
      expect(state.game.currentRoom).toEqual(mockRoom);
    });

    it('should handle game-started event', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'test-socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'playing'
      };

      // Simulate game-started event
      const gameStartedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'game-started'
      )[1];

      act(() => {
        gameStartedHandler({ room: mockRoom });
      });

      const state = store.getState();
      expect(state.game.currentRoom.status).toBe('playing');
    });

    it('should handle player-left event', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'test-socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      // Simulate player-left event
      const playerLeftHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'player-left'
      )[1];

      act(() => {
        playerLeftHandler({ room: mockRoom });
      });

      const state = store.getState();
      expect(state.game.currentRoom.players).toHaveLength(1);
    });

    it('should handle room-error event', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const errorMessage = 'Room is full';

      // Simulate room-error event
      const roomErrorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-error'
      )[1];

      act(() => {
        roomErrorHandler({ message: errorMessage });
      });

      const state = store.getState();
      expect(state.game.error).toBe(errorMessage);
    });
  });

  describe('Loading States', () => {
    it('should set loading state during room creation', () => {
      const { result } = renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      act(() => {
        result.current.createRoom({
          nickname: 'TestPlayer',
          maxPlayers: 4,
          aiOpponents: 2
        });
      });

      const state = store.getState();
      expect(state.game.loading).toBe(true);
    });

    it('should clear loading state on success', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'test-socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      // Simulate room-created event
      const roomCreatedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-created'
      )[1];

      act(() => {
        roomCreatedHandler({ room: mockRoom });
      });

      const state = store.getState();
      expect(state.game.loading).toBe(false);
    });

    it('should clear loading state on error', () => {
      renderHook(() => useGameSocket(), {
        wrapper: createWrapper(store)
      });

      const errorMessage = 'Failed to create room';

      // Simulate room-error event
      const roomErrorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room-error'
      )[1];

      act(() => {
        roomErrorHandler({ message: errorMessage });
      });

      const state = store.getState();
      expect(state.game.loading).toBe(false);
      expect(state.game.error).toBe(errorMessage);
    });
  });
}); 