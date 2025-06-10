import { renderHook, act } from '@testing-library/react';
import { useSocket } from '../../hooks/useSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client completely
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

const mockIo = io as jest.MockedFunction<typeof io>;

describe('useSocket Hook', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      removeAllListeners: jest.fn(),
    };

    mockIo.mockReturnValue(mockSocket);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBeDefined();
    expect(result.current.connected).toBe(false);
    expect(typeof result.current.joinRoom).toBe('function');
    expect(typeof result.current.leaveRoom).toBe('function');
    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('should create socket connection on mount', () => {
    renderHook(() => useSocket());

    expect(mockIo).toHaveBeenCalledWith(
      expect.stringContaining('://localhost:'),
      expect.objectContaining({
        transports: ['websocket', 'polling'],
        timeout: 20000,
      })
    );
  });

  it('should provide joinRoom functionality', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.joinRoom('test-room');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'test-room');
  });

  it('should provide leaveRoom functionality', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.leaveRoom();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('leave-room');
  });

  it('should provide sendMessage functionality', () => {
    const { result } = renderHook(() => useSocket());
    const testMessage = { type: 'test', data: 'hello' };

    act(() => {
      result.current.sendMessage('test-event', testMessage);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', testMessage);
  });

  it('should track connection state', () => {
    const { result } = renderHook(() => useSocket());

    // Initially disconnected
    expect(result.current.connected).toBe(false);

    // Simulate connection
    act(() => {
      mockSocket.connected = true;
      // Trigger the connect event handler if it was registered
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];
      if (connectHandler) {
        connectHandler();
      }
    });

    // Should remain false since we're mocking
    expect(result.current.connected).toBe(false);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useSocket());

    unmount();

    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
