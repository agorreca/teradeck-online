import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../../hooks/useSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

// Mock import.meta.env
const mockEnv = {
  VITE_BACKEND_URL: undefined,
};

// Mock Vite's import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: mockEnv,
    },
  },
  writable: true,
});

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
    mockIo.mockReturnValue(mockSocket as any);
    mockEnv.VITE_BACKEND_URL = undefined;
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.socket).toBe(mockSocket);
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
    mockEnv.VITE_BACKEND_URL = 'https://custom-backend.com';
    
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

  it('should update state when socket connects', () => {
    const { result } = renderHook(() => useSocket());

    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )?.[1];

    act(() => {
      if (connectHandler) connectHandler();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should handle disconnect manually', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.disconnect();
    });

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(result.current.isConnected).toBe(false);
  });

  it('should disconnect socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket());

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
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
});
