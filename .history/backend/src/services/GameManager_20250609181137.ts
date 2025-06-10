import { createTeraDeckDeck } from '../../../shared/src/constants/cards';
import type {
  Card,
  GameAction,
  GameSettings,
  GameState,
  ModuleCard,
  PlayCardActionData,
  Player,
} from '../../../shared/src/types/game';
import {
  ActionType,
  CardType,
  ModuleColor,
  ModuleState,
} from '../../../shared/src/types/game';

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

    // Get the player before removing
    const leavingPlayer = room.gameState.players.find(p => p.id === playerId);
    
    // If game is in progress, add player's cards to discard pile
    if (leavingPlayer && room.gameState.status === 'IN_PROGRESS') {
      room.gameState.discardPile.push(...leavingPlayer.hand);
      console.log(`🗂️ Added ${leavingPlayer.hand.length} cards from ${leavingPlayer.nickname} to discard pile`);
    }

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

    // Check if only AI players remain
    const humanPlayers = room.gameState.players.filter(p => !p.isAI);
    const aiPlayers = room.gameState.players.filter(p => p.isAI);

    if (humanPlayers.length === 0) {
      if (aiPlayers.length > 0) {
        console.log(`🤖 Only AI players remain in room ${roomCode}, terminating game`);
      }
      // Delete room if empty or only AI players remain
      this.rooms.delete(roomCode);
      console.log(`🗑️ Room ${roomCode} deleted - ${aiPlayers.length > 0 ? 'only AIs remained' : 'empty'}`);
    } else {
      console.log(`👥 Room ${roomCode} continues with ${humanPlayers.length} human(s) and ${aiPlayers.length} AI(s)`);
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

  processAction(roomCode: string, action: GameAction): GameState {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState.status === ('WAITING' as any)) {
      throw new Error('Game not started');
    }

    // Basic validation - check if it's the player's turn
    const currentPlayer =
      room.gameState.players[room.gameState.currentPlayerIndex];
    if (currentPlayer.id !== action.playerId) {
      throw new Error('Not your turn');
    }

    // Process the action based on type
    if (action.type === ActionType.PLAY_CARD) {
      this.processPlayCardAction(room.gameState, action);
    }

    return room.gameState;
  }

  private processPlayCardAction(
    gameState: GameState,
    action: GameAction
  ): void {
    const actionData = action.data as PlayCardActionData;
    const card = actionData.card;
    const player = gameState.players.find(p => p.id === action.playerId);

    if (!player) {
      throw new Error('Player not found');
    }

    // Remove card from player's hand
    const cardIndex = player.hand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) {
      throw new Error('Card not in hand');
    }

    player.hand.splice(cardIndex, 1);

    // Process based on card type
    switch (card.type) {
      case CardType.MODULE:
        this.playModule(gameState, player, card as ModuleCard);
        break;

      case CardType.BUG:
        this.playBug(gameState, player, card, actionData);
        break;

      case CardType.PATCH:
        this.playPatch(gameState, player, card, actionData);
        break;

      case CardType.OPERATION:
        this.playOperation(gameState, player, card, actionData);
        break;
    }

    // Add to discard pile
    gameState.discardPile.push(card);

    // Draw a card to replace it (if deck has cards)
    if (gameState.deck.length > 0) {
      const drawnCard = gameState.deck.pop()!;
      player.hand.push(drawnCard);
    }

    // Move to next player
    this.nextTurn(gameState);
  }

  private playModule(
    _gameState: GameState,
    player: Player,
    moduleCard: ModuleCard
  ): void {
    // Check if player already has this color (unless it's multicolor)
    const hasColor = player.modules.some(
      m =>
        m.color === moduleCard.color &&
        moduleCard.color !== ModuleColor.MULTICOLOR
    );
    if (hasColor) {
      throw new Error('Already have this module color');
    }

    // Create new module instance
    const newModule: ModuleCard = {
      ...moduleCard,
      state: ModuleState.FREE,
      bugs: [],
      patches: [],
      isStabilized: false,
    };

    player.modules.push(newModule);
  }

  private playBug(
    gameState: GameState,
    _player: Player,
    bugCard: Card,
    actionData: PlayCardActionData
  ): void {
    if (!actionData.targetPlayerId || !actionData.targetModuleId) {
      throw new Error('Bug card requires target module');
    }

    const targetPlayer = gameState.players.find(
      p => p.id === actionData.targetPlayerId
    );
    if (!targetPlayer) {
      throw new Error('Target player not found');
    }

    const targetModule = targetPlayer.modules.find(
      m => m.id === actionData.targetModuleId
    );
    if (!targetModule) {
      throw new Error('Target module not found');
    }

    // Check if module can be targeted
    if (targetModule.state === ModuleState.STABILIZED) {
      throw new Error('Cannot target stabilized module');
    }

    // Check color compatibility
    if (
      bugCard.color !== ModuleColor.MULTICOLOR &&
      targetModule.color !== ModuleColor.MULTICOLOR &&
      bugCard.color !== targetModule.color
    ) {
      throw new Error('Bug color does not match module color');
    }

    // Apply TeraDeck rules for bug interactions
    if (targetModule.state === ModuleState.PATCHED) {
      // PATCH + BUG = both go to discard, module becomes FREE
      gameState.discardPile.push(...targetModule.patches);
      targetModule.patches = [];
      targetModule.state = ModuleState.FREE;
      console.log('🔧+🐛 Patch + Bug = both discarded, module is now free');
    } else if (targetModule.state === ModuleState.BUGGED) {
      // BUG + BUG = module destroyed (removed from player)
      const moduleIndex = targetPlayer.modules.findIndex(
        m => m.id === targetModule.id
      );
      if (moduleIndex !== -1) {
        // Send module and all its bugs to discard pile
        gameState.discardPile.push(targetModule, ...targetModule.bugs);
        targetPlayer.modules.splice(moduleIndex, 1);
        console.log('🐛+🐛 Bug + Bug = module destroyed');
      }
    } else {
      // Module is FREE - just add the bug
      targetModule.bugs.push(bugCard as any);
      targetModule.state = ModuleState.BUGGED;
      console.log('🐛 Bug added to free module');
    }
  }

  private playPatch(
    gameState: GameState,
    player: Player,
    patchCard: Card,
    actionData: PlayCardActionData
  ): void {
    if (!actionData.targetModuleId) {
      throw new Error('Patch card requires target module');
    }

    // Patches can be applied to own modules or others' modules
    let targetModule: any = null;

    // First check current player's modules
    targetModule = player.modules.find(m => m.id === actionData.targetModuleId);
    if (!targetModule) {
      // Check other players' modules
      for (const p of gameState.players) {
        if (p.id !== player.id) {
          const found = p.modules.find(m => m.id === actionData.targetModuleId);
          if (found) {
            targetModule = found;
            break;
          }
        }
      }
    }

    if (!targetModule) {
      throw new Error('Target module not found');
    }

    // Check if targeting stabilized module
    if (targetModule.isStabilized) {
      throw new Error('Cannot target stabilized module');
    }

    // Check if patch is being applied to own modules only
    const isOwnModule = player.modules.some(
      m => m.id === actionData.targetModuleId
    );
    if (!isOwnModule) {
      throw new Error('Can only apply patches to own modules');
    }

    // Check color compatibility
    if (
      patchCard.color !== ModuleColor.MULTICOLOR &&
      targetModule.color !== ModuleColor.MULTICOLOR &&
      patchCard.color !== targetModule.color
    ) {
      throw new Error('Patch color does not match module color');
    }

    // Apply TeraDeck rules for patch interactions
    if (targetModule.state === ModuleState.BUGGED) {
      // BUG + PATCH = both go to discard, module becomes FREE
      gameState.discardPile.push(...targetModule.bugs);
      targetModule.bugs = [];
      targetModule.state = ModuleState.FREE;
      console.log('🐛+🔧 Bug + Patch = both discarded, module is now free');
    } else if (targetModule.state === ModuleState.PATCHED) {
      // PATCH + PATCH = module becomes STABILIZED
      targetModule.patches.push(patchCard as any);
      targetModule.state = ModuleState.STABILIZED;
      targetModule.isStabilized = true;
      console.log('🔧+🔧 Patch + Patch = module stabilized');
    } else {
      // Module is FREE - just add the patch
      targetModule.patches.push(patchCard as any);
      targetModule.state = ModuleState.PATCHED;
      console.log('🔧 Patch added to free module');
    }
  }

  private playOperation(
    _gameState: GameState,
    _player: Player,
    operationCard: Card,
    _actionData: PlayCardActionData
  ): void {
    // For now, just log the operation - implement specific operation logic later
    console.log(`Playing operation: ${operationCard.effect}`);
  }

  private nextTurn(gameState: GameState): void {
    gameState.currentPlayerIndex =
      (gameState.currentPlayerIndex + 1) % gameState.players.length;

    // Skip AI turns for now (basic implementation)
    if (gameState.players[gameState.currentPlayerIndex]?.isAI) {
      // Simple AI: skip turn for now
      this.nextTurn(gameState);
    }

    if (gameState.currentPlayerIndex === 0) {
      gameState.turn++;
    }
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

    // Don't remove players from AI games in lobby - they might be navigating to the room
    const hasAIPlayers = room.gameState.players.some(p => p.isAI);
    const isHost = room.host === playerId;

    // Remove player if in lobby, but NOT if it's the host in an AI game
    if (
      room.gameState.status === ('WAITING' as any) &&
      !(hasAIPlayers && isHost)
    ) {
      this.leaveRoom(roomCode, playerId);
    }

    console.log(
      `🔌 Player ${playerId} disconnected from room ${roomCode}. AI game: ${hasAIPlayers}, Is host: ${isHost}, Removed: ${!(hasAIPlayers && isHost)}`
    );
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
    const cardsPerPlayer = 3;
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

  private createDeck(): Card[] {
    // Use the real TeraDeck deck from shared constants
    const deck = createTeraDeckDeck();
    console.log(`🃏 Created official TeraDeck with ${deck.length} cards`);
    console.log(`📊 Deck composition:
      - Modules: ${deck.filter((c: Card) => c.type === 'module').length}
      - Bugs: ${deck.filter((c: Card) => c.type === 'bug').length} 
      - Patches: ${deck.filter((c: Card) => c.type === 'patch').length}
      - Operations: ${deck.filter((c: Card) => c.type === 'operation').length}`);
    return deck;
  }

  private shuffleDeck(deck: Card[]): void {
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
      player.isConnected = true; // Mark as connected when updating socket ID
      room.players.set(newSocketId, player);

      // Update in game state players array
      const gamePlayer = room.gameState.players.find(p => p.id === oldSocketId);
      if (gamePlayer) {
        gamePlayer.id = newSocketId;
        gamePlayer.isConnected = true; // Mark as connected
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
