import { renderHook, act, waitFor } from '@testing-library/react';
import { useSocket } from '../../hooks/useSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

describe('useSocket Hook', () => {
  const mockSocket = {
    connected: false,
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };

  const mockIo = io as jest.MockedFunction<typeof io>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
    
    // Default mock implementation
    mockIo.mockReturnValue(mockSocket as any);
    
    // Mock environment variable
    Object.defineProperty(import.meta, 'env', {
      value: {
        VITE_BACKEND_URL: undefined,
      },
      writable: true,
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSocket());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.socket).toBe(null);
      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
    });

    it('should auto-connect when hook is first used', () => {
      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith('http://localhost:7777', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });
    });

    it('should use VITE_BACKEND_URL when available', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {
          VITE_BACKEND_URL: 'https://custom-backend.com',
        },
        writable: true,
      });

      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith('https://custom-backend.com', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });
    });

    it('should set up socket event listeners on connect', () => {
      renderHook(() => useSocket());

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });
  });

  describe('Connection Management', () => {
    it('should update state when socket connects', async () => {
      const { result } = renderHook(() => useSocket());

      // Simulate socket connection
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should update state when socket disconnects', async () => {
      const { result } = renderHook(() => useSocket());

      // First connect
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);

      // Then disconnect
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];

      act(() => {
        if (disconnectHandler) disconnectHandler();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should handle connection errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useSocket());

      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )?.[1];

      const testError = new Error('Connection failed');

      act(() => {
        if (errorHandler) errorHandler(testError);
      });

      expect(result.current.isConnected).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Connection error:', testError);

      consoleSpy.mockRestore();
    });

    it('should log connect events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      renderHook(() => useSocket());

      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Connected to server');
      consoleSpy.mockRestore();
    });

    it('should log disconnect events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      renderHook(() => useSocket());

      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];

      act(() => {
        if (disconnectHandler) disconnectHandler();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Disconnected from server');
      consoleSpy.mockRestore();
    });
  });

  describe('Manual Connection Control', () => {
    it('should allow manual connection', () => {
      const { result } = renderHook(() => useSocket());

      // Clear the auto-connect call
      mockIo.mockClear();

      act(() => {
        result.current.connect();
      });

      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect if already connected', () => {
      mockSocket.connected = true;
      const { result } = renderHook(() => useSocket());

      // Clear the auto-connect call
      mockIo.mockClear();

      act(() => {
        result.current.connect();
      });

      expect(mockIo).not.toHaveBeenCalled();
    });

    it('should disconnect socket manually', () => {
      const { result } = renderHook(() => useSocket());

      // First connect to set up socket
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.socket).toBe(mockSocket);

      // Now disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
      expect(result.current.socket).toBe(null);
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle disconnect when no socket exists', () => {
      const { result } = renderHook(() => useSocket());

      // Disconnect without connecting first
      act(() => {
        result.current.disconnect();
      });

      // Should not throw error
      expect(result.current.socket).toBe(null);
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Socket Configuration', () => {
    it('should configure socket with correct transport options', () => {
      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
        })
      );
    });

    it('should create new socket instance each time with forceNew', () => {
      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          forceNew: true,
        })
      );
    });

    it('should set appropriate timeout for connections', () => {
      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 20000,
        })
      );
    });
  });

  describe('Cleanup', () => {
    it('should disconnect socket on unmount', () => {
      const { unmount } = renderHook(() => useSocket());

      unmount();

      expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle unmount when no socket exists', () => {
      // Mock a hook that never connects
      mockIo.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const { unmount } = renderHook(() => useSocket());

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Socket Instance Access', () => {
    it('should provide access to socket instance after connection', () => {
      const { result } = renderHook(() => useSocket());

      // Initially no socket
      expect(result.current.socket).toBe(null);

      // After connection setup
      expect(result.current.socket).toBe(mockSocket);
    });

    it('should allow emitting events through socket', () => {
      const { result } = renderHook(() => useSocket());

      // Socket should be available
      if (result.current.socket) {
        result.current.socket.emit('test-event', { data: 'test' });
        expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
      }
    });

    it('should allow setting up custom event listeners', () => {
      const { result } = renderHook(() => useSocket());

      const customHandler = jest.fn();

      if (result.current.socket) {
        result.current.socket.on('custom-event', customHandler);
        expect(mockSocket.on).toHaveBeenCalledWith('custom-event', customHandler);
      }
    });
  });

  describe('Connection State Tracking', () => {
    it('should track connection state accurately', () => {
      const { result } = renderHook(() => useSocket());

      // Initially disconnected
      expect(result.current.isConnected).toBe(false);

      // Connect
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);

      // Disconnect
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];

      act(() => {
        if (disconnectHandler) disconnectHandler();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should maintain connection state across rerenders', () => {
      const { result, rerender } = renderHook(() => useSocket());

      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];

      act(() => {
        if (connectHandler) connectHandler();
      });

      expect(result.current.isConnected).toBe(true);

      rerender();

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle socket creation failure gracefully', () => {
      mockIo.mockImplementation(() => {
        throw new Error('Failed to create socket');
      });

      expect(() => renderHook(() => useSocket())).not.toThrow();
    });

    it('should handle multiple rapid connect/disconnect cycles', () => {
      const { result } = renderHook(() => useSocket());

      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];

      // Rapid connect/disconnect cycles
      act(() => {
        if (connectHandler) connectHandler();
      });
      expect(result.current.isConnected).toBe(true);

      act(() => {
        if (disconnectHandler) disconnectHandler();
      });
      expect(result.current.isConnected).toBe(false);

      act(() => {
        if (connectHandler) connectHandler();
      });
      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should fallback to localhost when no environment URL is provided', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true,
      });

      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        'http://localhost:7777',
        expect.any(Object)
      );
    });

    it('should handle undefined environment variables', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {
          VITE_BACKEND_URL: undefined,
        },
        writable: true,
      });

      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        'http://localhost:7777',
        expect.any(Object)
      );
    });

    it('should handle empty string environment variables', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {
          VITE_BACKEND_URL: '',
        },
        writable: true,
      });

      renderHook(() => useSocket());

      expect(mockIo).toHaveBeenCalledWith(
        'http://localhost:7777',
        expect.any(Object)
      );
    });
  });
}); 