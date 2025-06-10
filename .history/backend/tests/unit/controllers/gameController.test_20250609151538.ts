import { Request, Response } from 'express';
import { gameController } from '../../../src/controllers/gameController';
import { GameManager } from '../../../src/services/GameManager';

// Mock GameManager
jest.mock('../../../src/services/GameManager');

describe('Game Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockGameManager: jest.Mocked<GameManager>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockGameManager = GameManager.getInstance() as jest.Mocked<GameManager>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/rooms/:roomCode', () => {
    it('should return room data when room exists', async () => {
      const mockRoom = {
        code: 'TEST123',
        players: [],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting',
      };

      mockRequest.params = { roomCode: 'TEST123' };
      mockGameManager.getRoom.mockReturnValue(mockRoom as any);

      await gameController.getRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameManager.getRoom).toHaveBeenCalledWith('TEST123');
      expect(mockResponse.json).toHaveBeenCalledWith({ room: mockRoom });
    });

    it('should return 404 when room does not exist', async () => {
      mockRequest.params = { roomCode: 'INVALID' };
      mockGameManager.getRoom.mockReturnValue(null);

      await gameController.getRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Room not found',
      });
    });
  });

  describe('POST /api/rooms', () => {
    it('should create a new room successfully', async () => {
      const mockRoom = {
        code: 'NEW123',
        players: [],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting',
      };

      mockRequest.body = {
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2,
      };

      mockGameManager.createRoom.mockReturnValue(mockRoom as any);

      await gameController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameManager.createRoom).toHaveBeenCalledWith({
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ room: mockRoom });
    });

    it('should handle creation errors', async () => {
      mockRequest.body = {
        nickname: 'TestPlayer',
        maxPlayers: 4,
        aiOpponents: 2,
      };

      mockGameManager.createRoom.mockImplementation(() => {
        throw new Error('Room creation failed');
      });

      await gameController.createRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create room',
      });
    });
  });

  describe('POST /api/rooms/:roomCode/join', () => {
    it('should join existing room successfully', async () => {
      const mockRoom = {
        code: 'JOIN123',
        players: [{ id: 'player1', nickname: 'NewPlayer' }],
        maxPlayers: 4,
        aiOpponents: 2,
        status: 'waiting',
      };

      mockRequest.params = { roomCode: 'JOIN123' };
      mockRequest.body = { nickname: 'NewPlayer' };

      mockGameManager.joinRoom.mockReturnValue(mockRoom as any);

      await gameController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameManager.joinRoom).toHaveBeenCalledWith(
        'JOIN123',
        'NewPlayer'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({ room: mockRoom });
    });

    it('should handle join failures', async () => {
      mockRequest.params = { roomCode: 'FULL123' };
      mockRequest.body = { nickname: 'NewPlayer' };

      mockGameManager.joinRoom.mockImplementation(() => {
        throw new Error('Room is full');
      });

      await gameController.joinRoom(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to join room',
      });
    });
  });
});
