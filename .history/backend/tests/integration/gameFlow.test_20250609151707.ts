import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { GameManager } from '../../src/services/GameManager';
import { setupGameSocketHandlers } from '../../src/socket/gameSocket';

describe('Game Flow Integration Tests', () => {
  let serverSocket: SocketServer;
  let hostClient: any;
  let playerClient: any;
  let gameManager: GameManager;
  const TEST_PORT = 8081;

  beforeAll((done) => {
    const httpServer = createServer();
    serverSocket = new SocketServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    gameManager = GameManager.getInstance();
    setupGameSocketHandlers(serverSocket);

    httpServer.listen(TEST_PORT, () => {
      hostClient = Client(`http://localhost:${TEST_PORT}`);
      playerClient = Client(`http://localhost:${TEST_PORT}`);
      
      let connectedClients = 0;
      const onConnect = () => {
        connectedClients++;
        if (connectedClients === 2) {
          done();
        }
      };
      
      hostClient.on('connect', onConnect);
      playerClient.on('connect', onConnect);
    });
  });

  afterAll((done) => {
    serverSocket.close();
    hostClient.close();
    playerClient.close();
    done();
  });

  beforeEach(() => {
    // Reset game manager state
    gameManager['rooms'] = new Map();
  });

  describe('Complete Room Creation and Join Flow', () => {
    it('should create room, join player, and start AI game', (done) => {
      let roomCode: string;
      let roomCreated = false;
      let playerJoined = false;
      let gameStarted = false;

      // Step 1: Host creates room
      hostClient.on('room-created', (data: any) => {
        expect(data.room).toBeDefined();
        expect(data.room.players).toHaveLength(1);
        expect(data.room.players[0].isHost).toBe(true);
        expect(data.room.aiOpponents).toBe(2);
        
        roomCode = data.room.code;
        roomCreated = true;
        
        // Step 2: Another player joins
        playerClient.emit('join-room', {
          roomCode: roomCode,
          nickname: 'Player2'
        });
      });

      // Step 3: Player joins successfully
      playerClient.on('room-joined', (data: any) => {
        expect(data.room.players).toHaveLength(2);
        expect(data.room.players.some((p: any) => p.nickname === 'Player2')).toBe(true);
        
        playerJoined = true;
        
        // Step 4: Host starts the game
        hostClient.emit('start-game', { roomCode: roomCode });
      });

      // Step 5: Game starts successfully
      hostClient.on('game-started', (data: any) => {
        expect(data.room.status).toBe('playing');
        expect(data.room.players).toHaveLength(2); // 2 human players
        expect(data.room.aiOpponents).toBe(2); // 2 AI opponents
        
        gameStarted = true;
        
        // Verify all steps completed
        if (roomCreated && playerJoined && gameStarted) {
          done();
        }
      });

      // Also listen on player client for game-started
      playerClient.on('game-started', (data: any) => {
        expect(data.room.status).toBe('playing');
      });

      // Start the flow
      hostClient.emit('create-room', {
        nickname: 'Host',
        maxPlayers: 4,
        aiOpponents: 2
      });
    }, 10000); // Increase timeout for integration test
  });

  describe('AI-Only Game Flow', () => {
    it('should create AI-only room and auto-start game', (done) => {
      let roomCode: string;

      hostClient.on('room-created', (data: any) => {
        expect(data.room).toBeDefined();
        expect(data.room.players).toHaveLength(1); // Only host
        expect(data.room.aiOpponents).toBe(3); // 3 AI opponents
        
        roomCode = data.room.code;
        
        // In AI-only game, host should be able to start immediately
        hostClient.emit('start-game', { roomCode: roomCode });
      });

      hostClient.on('game-started', (data: any) => {
        expect(data.room.status).toBe('playing');
        expect(data.room.players).toHaveLength(1); // Only human host
        expect(data.room.aiOpponents).toBe(3); // 3 AI opponents
        done();
      });

      // Create AI-only room (max 4 players, 3 AI, so only 1 human)
      hostClient.emit('create-room', {
        nickname: 'Host',
        maxPlayers: 4,
        aiOpponents: 3
      });
    });
  });

  describe('Room State Synchronization', () => {
    it('should keep room state synchronized between clients', (done) => {
      let roomCode: string;
      let hostStateReceived = false;
      let playerStateReceived = false;

      // Create room
      hostClient.on('room-created', (data: any) => {
        roomCode = data.room.code;
        
        // Player joins
        playerClient.emit('join-room', {
          roomCode: roomCode,
          nickname: 'Player2'
        });
      });

      // After player joins, both clients should receive updated state
      playerClient.on('room-joined', (data: any) => {
        // Request room state from both clients
        hostClient.emit('get-room-state', { roomCode: roomCode });
        playerClient.emit('get-room-state', { roomCode: roomCode });
      });

      // Both clients should receive identical room state
      hostClient.on('room-state', (data: any) => {
        expect(data.room.players).toHaveLength(2);
        expect(data.room.players.some((p: any) => p.nickname === 'Host')).toBe(true);
        expect(data.room.players.some((p: any) => p.nickname === 'Player2')).toBe(true);
        
        hostStateReceived = true;
        if (hostStateReceived && playerStateReceived) {
          done();
        }
      });

      playerClient.on('room-state', (data: any) => {
        expect(data.room.players).toHaveLength(2);
        expect(data.room.players.some((p: any) => p.nickname === 'Host')).toBe(true);
        expect(data.room.players.some((p: any) => p.nickname === 'Player2')).toBe(true);
        
        playerStateReceived = true;
        if (hostStateReceived && playerStateReceived) {
          done();
        }
      });

      // Start the flow
      hostClient.emit('create-room', {
        nickname: 'Host',
        maxPlayers: 4,
        aiOpponents: 2
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle joining non-existent room', (done) => {
      playerClient.on('room-error', (data: any) => {
        expect(data.message).toBe('Failed to join room');
        done();
      });

      playerClient.emit('join-room', {
        roomCode: 'INVALID',
        nickname: 'Player'
      });
    });

    it('should handle non-host trying to start game', (done) => {
      let roomCode: string;

      // Create room with host
      hostClient.on('room-created', (data: any) => {
        roomCode = data.room.code;
        
        // Player joins
        playerClient.emit('join-room', {
          roomCode: roomCode,
          nickname: 'Player2'
        });
      });

      // After joining, non-host tries to start game
      playerClient.on('room-joined', (data: any) => {
        playerClient.emit('start-game', { roomCode: roomCode });
      });

      // Should receive error
      playerClient.on('room-error', (data: any) => {
        expect(data.message).toBe('Only the host can start the game');
        done();
      });

      hostClient.emit('create-room', {
        nickname: 'Host',
        maxPlayers: 4,
        aiOpponents: 2
      });
    });
  });

  describe('Player Disconnection', () => {
    it('should handle player leaving room', (done) => {
      let roomCode: string;

      hostClient.on('room-created', (data: any) => {
        roomCode = data.room.code;
        playerClient.emit('join-room', {
          roomCode: roomCode,
          nickname: 'Player2'
        });
      });

      playerClient.on('room-joined', (data: any) => {
        expect(data.room.players).toHaveLength(2);
        
        // Player leaves room
        playerClient.emit('leave-room', { roomCode: roomCode });
      });

      hostClient.on('player-left', (data: any) => {
        expect(data.room.players).toHaveLength(1);
        expect(data.room.players[0].nickname).toBe('Host');
        done();
      });

      hostClient.emit('create-room', {
        nickname: 'Host',
        maxPlayers: 4,
        aiOpponents: 2
      });
    });
  });
}); 