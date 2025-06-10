import type {
  GameAction,
  GameSettings,
  GameState,
  Player,
} from '@shared/types/game';

interface Room {
  code: string;
  settings: GameSettings;
  gameState: GameState;
  players: Map<string, Player>;
  host: string;
  created: Date;
}

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();

  createRoom(
    settings: GameSettings,
    hostId: string,
    nickname?: string
  ): string {
    const roomCode = this.generateRoomCode();
    const host: Player = {
      id: hostId,
      nickname: nickname || 'Host',
      isAI: false,
      isHost: true,
      isConnected: true,
      hand: [],
      modules: [],
      skippedTurns: 0,
    };

    // Create AI players if specified
    const allPlayers = [host];
    const playerMap = new Map([[hostId, host]]);

    for (let i = 0; i < settings.aiPlayers; i++) {
      const aiPlayer: Player = {
        id: `ai-${roomCode}-${i}`,
        nickname: `IA ${i + 1}`,
        isAI: true,
        isHost: false,
        isConnected: true,
        hand: [],
        modules: [],
        skippedTurns: 0,
      };
      allPlayers.push(aiPlayer);
      playerMap.set(aiPlayer.id, aiPlayer);
    }

    const room: Room = {
      code: roomCode,
      settings,
      gameState: {
        id: roomCode,
        status: 'WAITING' as any,
        players: allPlayers,
        currentPlayerIndex: 0,
        turn: 0,
        deck: [],
        discardPile: [],
        winner: undefined,
        settings,
        language: settings.language,
      },
      players: playerMap,
      host: hostId,
      created: new Date(),
    };

    this.rooms.set(roomCode, room);
    this.playerRooms.set(hostId, roomCode);
    return roomCode;
  }

  joinRoom(roomCode: string, playerId: string, nickname: string): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState.status !== ('WAITING' as any)) {
      throw new Error('Game already in progress');
    }

    if (room.players.size >= room.settings.maxPlayers) {
      throw new Error('Room is full');
    }

    const player: Player = {
      id: playerId,
      nickname,
      isAI: false,
      isHost: false,
      isConnected: true,
      hand: [],
      modules: [],
      skippedTurns: 0,
    };

    room.players.set(playerId, player);
    room.gameState.players.push(player);
    this.playerRooms.set(playerId, roomCode);

    return room.gameState;
  }

  leaveRoom(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players.delete(playerId);
    room.gameState.players = room.gameState.players.filter(
      p => p.id !== playerId
    );
    this.playerRooms.delete(playerId);

    // If host leaves, assign new host
    if (room.host === playerId && room.players.size > 0) {
      const newHost = Array.from(room.players.values())[0];
      newHost.isHost = true;
      room.host = newHost.id;
    }

    // If room is empty, delete it
    if (room.players.size === 0) {
      this.rooms.delete(roomCode);
    }
  }

  startGame(roomCode: string, playerId: string): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.host !== playerId) {
      throw new Error('Only host can start the game');
    }

    const minPlayers = 2; // Minimum players for TeraDeck
    if (room.players.size < minPlayers) {
      throw new Error(`Need at least ${minPlayers} players`);
    }

    // All players are considered ready when host starts the game

    // Initialize game state
    room.gameState = this.initializeGameState(
      room.gameState.players,
      room.settings
    );

    return room.gameState;
  }

  processAction(roomCode: string, _action: GameAction): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState.status === ('WAITING' as any)) {
      throw new Error('Game not started');
    }

    // Process the action using shared game logic
    // const result = processGameAction(room.gameState, action);
    // if (!result.isValid) {
    //   throw new Error(result.errorKey || 'Invalid action');
    // }
    // TODO: Implement game logic processing

    return room.gameState;
  }

  getPlayerRoom(playerId: string): string | undefined {
    return this.playerRooms.get(playerId);
  }

  getPlayer(roomCode: string, playerId: string): Player | undefined {
    const room = this.rooms.get(roomCode);
    return room?.players.get(playerId);
  }

  getRoomState(roomCode: string): GameState | undefined {
    const room = this.rooms.get(roomCode);
    return room?.gameState;
  }

  handleDisconnection(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.isConnected = false;

      // Mark player as disconnected in game state
      const gamePlayer = room.gameState.players.find(p => p.id === playerId);
      if (gamePlayer) {
        gamePlayer.isConnected = false;
      }
    }

    // Remove player if in lobby
    if (room.gameState.status === ('WAITING' as any)) {
      this.leaveRoom(roomCode, playerId);
    }
  }

  private generateRoomCode(): string {
    // Generate a 6-character room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Make sure it's unique
    return this.rooms.has(result) ? this.generateRoomCode() : result;
  }

  private initializeGameState(
    players: Player[],
    settings: GameSettings
  ): GameState {
    // Create and shuffle deck
    const deck = this.createDeck();
    this.shuffleDeck(deck);

    // Deal initial cards
    const cardsPerPlayer = 7;
    players.forEach(player => {
      player.hand = deck.splice(0, cardsPerPlayer);
      player.modules = [];
    });

    return {
      id: 'game-' + Date.now(),
      status: 'IN_PROGRESS' as any,
      players,
      currentPlayerIndex: 0,
      turn: 1,
      deck,
      discardPile: [],
      winner: undefined,
      settings,
      language: settings.language,
    };
  }

  private createDeck(): any[] {
    // This should create the full TeraDeck with all cards
    // For now, returning empty array - this would be implemented
    // using the shared game logic
    return [];
  }

  private shuffleDeck(deck: any[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  updatePlayerSocketId(
    roomCode: string,
    oldSocketId: string,
    newSocketId: string
  ): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Update in room players map
    const player = room.players.get(oldSocketId);
    if (player) {
      room.players.delete(oldSocketId);
      player.id = newSocketId;
      room.players.set(newSocketId, player);

      // Update in game state players array
      const gamePlayer = room.gameState.players.find(p => p.id === oldSocketId);
      if (gamePlayer) {
        gamePlayer.id = newSocketId;
      }

      // Update host if needed
      if (room.host === oldSocketId) {
        room.host = newSocketId;
      }

      // Update player rooms mapping
      this.playerRooms.delete(oldSocketId);
      this.playerRooms.set(newSocketId, roomCode);

      console.log(
        `🔄 Player socket ID updated in room ${roomCode}: ${oldSocketId} -> ${newSocketId}`
      );
    }
  }
}
