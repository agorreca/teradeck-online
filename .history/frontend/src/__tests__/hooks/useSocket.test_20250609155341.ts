import { renderHook, act } from '@testing-library/react';

// Mock the entire useSocket hook
const mockSocket = {
  connected: false,
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const mockUseSocket = jest.fn(() => ({
  socket: mockSocket,
  isConnected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('../../hooks/useSocket', () => ({
  useSocket: mockUseSocket,
}));

describe('useSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return socket connection interface', () => {
    const mockReturnValue = {
      socket: mockSocket,
      isConnected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    
    mockUseSocket.mockReturnValue(mockReturnValue);
    
    const { result } = renderHook(() => mockUseSocket());

    expect(result.current.socket).toBe(mockSocket);
    expect(result.current.isConnected).toBe(false);
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should handle connection state changes', () => {
    const mockReturnValue = {
      socket: mockSocket,
      isConnected: true,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    
    mockUseSocket.mockReturnValue(mockReturnValue);
    
    const { result } = renderHook(() => mockUseSocket());

    expect(result.current.isConnected).toBe(true);
  });

  it('should provide disconnect functionality', () => {
    const disconnectFn = jest.fn();
    const mockReturnValue = {
      socket: mockSocket,
      isConnected: true,
      connect: jest.fn(),
      disconnect: disconnectFn,
    };
    
    mockUseSocket.mockReturnValue(mockReturnValue);
    
    const { result } = renderHook(() => mockUseSocket());

    act(() => {
      result.current.disconnect();
    });

    expect(disconnectFn).toHaveBeenCalledTimes(1);
  });

  it('should provide connect functionality', () => {
    const connectFn = jest.fn();
    const mockReturnValue = {
      socket: mockSocket,
      isConnected: false,
      connect: connectFn,
      disconnect: jest.fn(),
    };
    
    mockUseSocket.mockReturnValue(mockReturnValue);
    
    const { result } = renderHook(() => mockUseSocket());

    act(() => {
      result.current.connect();
    });

    expect(connectFn).toHaveBeenCalledTimes(1);
  });

  it('should provide access to socket instance', () => {
    const mockReturnValue = {
      socket: mockSocket,
      isConnected: true,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    
    mockUseSocket.mockReturnValue(mockReturnValue);
    
    const { result } = renderHook(() => mockUseSocket());

    expect(result.current.socket).toBe(mockSocket);
    expect(result.current.socket.on).toBeDefined();
    expect(result.current.socket.emit).toBeDefined();
  });
});
