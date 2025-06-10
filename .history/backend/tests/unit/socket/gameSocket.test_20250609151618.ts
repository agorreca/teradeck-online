import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { GameManager } from '../../../src/services/GameManager';
import { setupGameSocketHandlers } from '../../../src/socket/gameSocket';

// Mock GameManager
jest.mock('../../../src/services/GameManager');

describe('Game Socket Handlers', () => {
  let serverSocket: SocketServer;
  let clientSocket: any;
  let mockGameManager: jest.Mocked<GameManager>;
  const TEST_PORT = 8080;

  beforeAll((done) => {
    const httpServer = createServer();
    serverSocket = new SocketServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    httpServer.listen(TEST_PORT, () => {
      clientSocket = Client(`http://localhost:${TEST_PORT}`);
      setupGameSocketHandlers(serverSocket);
      
      clientSocket.on('connect', done);
    });
  });

  beforeEach(() => {
    mockGameManager = GameManager.getInstance() as jest.Mocked<GameManager>;
    jest.clearAllMocks();
  });

  afterAll((done) => {
    serverSocket.close();
    clientSocket.close();
    done();
  });

  describe('create-room event', () => {
    it('should create room and emit room-created', (done) => {
      const mockRoom = {
        code: 'TEST123',
        players: [{ id: 'socket-id', nickname: 'TestPlayer', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      mockGameManager.createRoom.mockReturnValue(mockRoom as any);

      clientSocket.on('room-created', (data: any) => {
        expect(data.room).toEqual(mockRoom);
        expect(mockGameManager.createRoom).toHaveBeenCalledWith(
          expect.objectContaining({
            nickname: 'TestPlayer',
            maxPlayers: 4,
            aiOpponents: 2
          }),
          expect.any(String)
        );
        done();
      });

      clientSocket.emit('create-room', {
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2
      });
    });

    it('should handle room creation errors', (done) => {
      mockGameManager.createRoom.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      clientSocket.on('room-error', (data: any) => {
        expect(data.message).toBe('Failed to create room');
        done();
      });

      clientSocket.emit('create-room', {
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2
      });
    });
  });

  describe('join-room event', () => {
    it('should join room and emit room-joined', (done) => {
      const mockRoom = {
        code: 'JOIN123',
        players: [
          { id: 'host-id', nickname: 'Host', isHost: true },
          { id: 'socket-id', nickname: 'NewPlayer', isHost: false }
        ],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      mockGameManager.joinRoom.mockReturnValue(mockRoom as any);

      clientSocket.on('room-joined', (data: any) => {
        expect(data.room).toEqual(mockRoom);
        expect(mockGameManager.joinRoom).toHaveBeenCalledWith(
          'JOIN123',
          'NewPlayer',
          expect.any(String)
        );
        done();
      });

      clientSocket.emit('join-room', {
        roomCode: 'JOIN123',
        nickname: 'NewPlayer'
      });
    });

    it('should handle join room errors', (done) => {
      mockGameManager.joinRoom.mockImplementation(() => {
        throw new Error('Room is full');
      });

      clientSocket.on('room-error', (data: any) => {
        expect(data.message).toBe('Failed to join room');
        done();
      });

      clientSocket.emit('join-room', {
        roomCode: 'FULL123',
        nickname: 'NewPlayer'
      });
    });
  });

  describe('get-room-state event', () => {
    it('should return current room state', (done) => {
      const mockRoom = {
        code: 'STATE123',
        players: [{ id: 'socket-id', nickname: 'Player', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      mockGameManager.getRoom.mockReturnValue(mockRoom as any);
      mockGameManager.updatePlayerSocketId.mockReturnValue(true);

      clientSocket.on('room-state', (data: any) => {
        expect(data.room).toEqual(mockRoom);
        expect(mockGameManager.getRoom).toHaveBeenCalledWith('STATE123');
        done();
      });

      clientSocket.emit('get-room-state', { roomCode: 'STATE123' });
    });

    it('should handle non-existent room', (done) => {
      mockGameManager.getRoom.mockReturnValue(null);

      clientSocket.on('room-error', (data: any) => {
        expect(data.message).toBe('Room not found');
        done();
      });

      clientSocket.emit('get-room-state', { roomCode: 'INVALID' });
    });
  });

  describe('start-game event', () => {
    it('should start game when host initiates', (done) => {
      const mockRoom = {
        code: 'START123',
        players: [{ id: 'socket-id', nickname: 'Host', isHost: true }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'playing'
      };

      mockGameManager.getRoom.mockReturnValue({
        ...mockRoom,
        status: 'waiting'
      } as any);
      mockGameManager.startGame.mockReturnValue(mockRoom as any);

      clientSocket.on('game-started', (data: any) => {
        expect(data.room).toEqual(mockRoom);
        expect(mockGameManager.startGame).toHaveBeenCalledWith('START123');
        done();
      });

      clientSocket.emit('start-game', { roomCode: 'START123' });
    });

    it('should reject game start from non-host', (done) => {
      const mockRoom = {
        code: 'START123',
        players: [
          { id: 'host-id', nickname: 'Host', isHost: true },
          { id: 'socket-id', nickname: 'Player', isHost: false }
        ],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      mockGameManager.getRoom.mockReturnValue(mockRoom as any);

      clientSocket.on('room-error', (data: any) => {
        expect(data.message).toBe('Only the host can start the game');
        done();
      });

      clientSocket.emit('start-game', { roomCode: 'START123' });
    });
  });

  describe('leave-room event', () => {
    it('should remove player from room', (done) => {
      const mockRoom = {
        code: 'LEAVE123',
        players: [],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting'
      };

      mockGameManager.leaveRoom.mockReturnValue(mockRoom as any);

      clientSocket.on('player-left', (data: any) => {
        expect(data.room).toEqual(mockRoom);
        expect(mockGameManager.leaveRoom).toHaveBeenCalledWith(
          'LEAVE123',
          expect.any(String)
        );
        done();
      });

      clientSocket.emit('leave-room', { roomCode: 'LEAVE123' });
    });
  });

  describe('disconnect event', () => {
    it('should handle player disconnection', () => {
      mockGameManager.handlePlayerDisconnect.mockReturnValue(undefined);

      clientSocket.disconnect();

      // Give some time for the disconnect handler to execute
      setTimeout(() => {
        expect(mockGameManager.handlePlayerDisconnect).toHaveBeenCalledWith(
          expect.any(String)
        );
      }, 100);
    });
  });
}); 