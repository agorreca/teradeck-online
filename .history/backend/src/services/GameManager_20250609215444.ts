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
  GameStatus,
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
    if (leavingPlayer && room.gameState.status === GameStatus.IN_PROGRESS) {
      room.gameState.discardPile.push(...leavingPlayer.hand);
      console.log(
        `🗂️ Added ${leavingPlayer.hand.length} cards from ${leavingPlayer.nickname} to discard pile`
      );
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
        console.log(
          `🤖 Only AI players remain in room ${roomCode}, terminating game`
        );
      }
      // Delete room if empty or only AI players remain
      this.rooms.delete(roomCode);
      console.log(
        `🗑️ Room ${roomCode} deleted - ${aiPlayers.length > 0 ? 'only AIs remained' : 'empty'}`
      );
    } else {
      console.log(
        `👥 Room ${roomCode} continues with ${humanPlayers.length} human(s) and ${aiPlayers.length} AI(s)`
      );
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
    } else if (action.type === ActionType.DISCARD_CARDS) {
      this.processDiscardAction(room.gameState, action);
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

  private processDiscardAction(gameState: GameState, action: GameAction): void {
    const actionData = action.data as any; // DiscardCardsActionData
    const cardsToDiscard = actionData.cards || actionData.cardIds;
    const player = gameState.players.find(p => p.id === action.playerId);

    if (!player) {
      throw new Error('Player not found');
    }

    if (!cardsToDiscard || cardsToDiscard.length === 0) {
      throw new Error('No cards specified for discard');
    }

    if (cardsToDiscard.length < 1 || cardsToDiscard.length > 3) {
      throw new Error('Must discard between 1 and 3 cards');
    }

    // Remove cards from player's hand and add to discard pile
    const discardedCards: Card[] = [];

    for (const cardData of cardsToDiscard) {
      const cardId = typeof cardData === 'string' ? cardData : cardData.id;
      const cardIndex = player.hand.findIndex(c => c.id === cardId);

      if (cardIndex === -1) {
        throw new Error(`Card ${cardId} not found in hand`);
      }

      const discardedCard = player.hand.splice(cardIndex, 1)[0];
      discardedCards.push(discardedCard);
    }

    // Add discarded cards to the discard pile (last card on top)
    gameState.discardPile.push(...discardedCards);

    // Draw replacement cards from deck
    const cardsToDraw = Math.min(discardedCards.length, gameState.deck.length);
    for (let i = 0; i < cardsToDraw; i++) {
      if (gameState.deck.length > 0) {
        const drawnCard = gameState.deck.pop()!;
        player.hand.push(drawnCard);
      }
    }

    console.log(
      `Player ${player.nickname} discarded ${discardedCards.length} cards and drew ${cardsToDraw} replacement cards`
    );

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

    // Check color compatibility - multicolor bugs can target any module, any module can be targeted by multicolor bugs
    const isBugMulticolor =
      bugCard.color === 'multicolor' ||
      bugCard.color === ModuleColor.MULTICOLOR;
    const isModuleMulticolor = targetModule.color === ModuleColor.MULTICOLOR;
    const colorsMatch = bugCard.color === targetModule.color;

    if (!isBugMulticolor && !isModuleMulticolor && !colorsMatch) {
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
    if (
      targetModule.state === ModuleState.STABILIZED ||
      targetModule.isStabilized
    ) {
      throw new Error('Cannot target stabilized module');
    }

    // Patches can be applied to ANY module (own or others'), unlike the comment above

    // Check color compatibility - multicolor patches can target any module, any module can be targeted by multicolor patches
    const isPatchMulticolor =
      patchCard.color === 'multicolor' ||
      patchCard.color === ModuleColor.MULTICOLOR;
    const isModuleMulticolor = targetModule.color === ModuleColor.MULTICOLOR;
    const colorsMatch = patchCard.color === targetModule.color;

    if (!isPatchMulticolor && !isModuleMulticolor && !colorsMatch) {
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
    gameState: GameState,
    player: Player,
    operationCard: Card,
    actionData: PlayCardActionData
  ): void {
    const operationEffect = (operationCard as any).effect;

    console.log(`🎮 Playing operation: ${operationEffect}`);

    switch (operationEffect) {
      case 'architect_change':
        this.executeArchitectChange(gameState, player, actionData);
        break;

      case 'recruit_ace':
        this.executeRecruitAce(gameState, player, actionData);
        break;

      case 'internal_phishing':
        this.executeInternalPhishing(gameState, player, actionData);
        break;

      case 'end_year_party':
        this.executeEndYearParty(gameState, player);
        break;

      case 'project_swap':
        this.executeProjectSwap(gameState, player, actionData);
        break;

      default:
        console.log(`⚠️ Unknown operation effect: ${operationEffect}`);
        break;
    }
  }

  // Operation implementations
  private executeArchitectChange(
    gameState: GameState,
    player: Player,
    actionData: PlayCardActionData
  ): void {
    // Architect Change: Exchange modules between two players
    // actionData should have swapPlayerIds[0] and swapPlayerIds[1] for the two players
    // and swapModuleIds[0] and swapModuleIds[1] for the modules to swap

    if (!actionData.swapPlayerIds || actionData.swapPlayerIds.length !== 2) {
      throw new Error('Architect Change requires exactly 2 players');
    }

    if (!actionData.swapModuleIds || actionData.swapModuleIds.length !== 2) {
      throw new Error('Architect Change requires exactly 2 modules');
    }

    const player1 = gameState.players.find(
      p => p.id === actionData.swapPlayerIds![0]
    );
    const player2 = gameState.players.find(
      p => p.id === actionData.swapPlayerIds![1]
    );

    if (!player1 || !player2) {
      throw new Error('Players not found for Architect Change');
    }

    const module1Index = player1.modules.findIndex(
      m => m.id === actionData.swapModuleIds![0]
    );
    const module2Index = player2.modules.findIndex(
      m => m.id === actionData.swapModuleIds![1]
    );

    if (module1Index === -1 || module2Index === -1) {
      throw new Error('Modules not found for Architect Change');
    }

    const module1 = player1.modules[module1Index];
    const module2 = player2.modules[module2Index];

    // Check that after swap, no player has duplicate colors
    const tempPlayer1Modules = [...player1.modules];
    const tempPlayer2Modules = [...player2.modules];
    tempPlayer1Modules[module1Index] = module2;
    tempPlayer2Modules[module2Index] = module1;

    // Validate no duplicates (except multicolor)
    if (
      this.hasDuplicateModuleColors(tempPlayer1Modules) ||
      this.hasDuplicateModuleColors(tempPlayer2Modules)
    ) {
      throw new Error('Cannot swap: would create duplicate module colors');
    }

    // Perform the swap
    player1.modules[module1Index] = module2;
    player2.modules[module2Index] = module1;

    console.log(
      `🔄 Architect Change: Swapped ${module1.name.es} (${player1.nickname}) with ${module2.name.es} (${player2.nickname})`
    );
  }

  private executeRecruitAce(
    gameState: GameState,
    player: Player,
    actionData: PlayCardActionData
  ): void {
    // Recruit Ace: Steal a non-stabilized module from another player

    if (!actionData.targetPlayerId || !actionData.targetModuleId) {
      throw new Error('Recruit Ace requires target player and module');
    }

    const targetPlayer = gameState.players.find(
      p => p.id === actionData.targetPlayerId
    );
    if (!targetPlayer || targetPlayer.id === player.id) {
      throw new Error('Invalid target player for Recruit Ace');
    }

    const moduleIndex = targetPlayer.modules.findIndex(
      m => m.id === actionData.targetModuleId
    );
    if (moduleIndex === -1) {
      throw new Error('Target module not found');
    }

    const targetModule = targetPlayer.modules[moduleIndex];

    // Cannot steal stabilized modules
    if (
      targetModule.state === ModuleState.STABILIZED ||
      targetModule.isStabilized
    ) {
      throw new Error('Cannot steal stabilized modules');
    }

    // Check that current player doesn't already have this color (unless multicolor)
    if (
      targetModule.color !== ModuleColor.MULTICOLOR &&
      player.modules.some(m => m.color === targetModule.color)
    ) {
      throw new Error('Already have this module color');
    }

    // Steal the module
    const stolenModule = targetPlayer.modules.splice(moduleIndex, 1)[0];
    player.modules.push(stolenModule);

    console.log(
      `💎 Recruit Ace: ${player.nickname} stole ${stolenModule.name.es} from ${targetPlayer.nickname}`
    );
  }

  private executeInternalPhishing(
    gameState: GameState,
    player: Player,
    actionData: PlayCardActionData
  ): void {
    // Internal Phishing: Move all your bugs to other players' free modules

    const playerBuggedModules = player.modules.filter(
      m => m.state === ModuleState.BUGGED
    );

    if (playerBuggedModules.length === 0) {
      console.log(
        `📧 Internal Phishing: ${player.nickname} has no bugs to transfer`
      );
      return;
    }

    // actionData.bugTransfers should contain array of {playerId, moduleId} for where to move each bug
    const bugTransfers = actionData.bugTransfers || [];

    let bugsTransferred = 0;

    for (const buggedModule of playerBuggedModules) {
      for (const bug of [...buggedModule.bugs]) {
        // Copy array to avoid modification during iteration
        // Find a target for this bug
        const transfer = bugTransfers.find(t =>
          gameState.players
            .find(p => p.id === t.playerId)
            ?.modules.find(
              m =>
                m.id === t.moduleId &&
                m.state === ModuleState.FREE &&
                (bug.color === 'multicolor' ||
                  bug.color === ModuleColor.MULTICOLOR ||
                  m.color === ModuleColor.MULTICOLOR ||
                  bug.color === m.color)
            )
        );

        if (transfer) {
          const targetPlayer = gameState.players.find(
            p => p.id === transfer.playerId
          )!;
          const targetModule = targetPlayer.modules.find(
            m => m.id === transfer.moduleId
          )!;

          // Move the bug
          const bugIndex = buggedModule.bugs.indexOf(bug);
          if (bugIndex !== -1) {
            buggedModule.bugs.splice(bugIndex, 1);
            targetModule.bugs.push(bug);
            targetModule.state = ModuleState.BUGGED;
            bugsTransferred++;
          }
        }
      }

      // Update module state if no more bugs
      if (buggedModule.bugs.length === 0) {
        buggedModule.state = ModuleState.FREE;
      }
    }

    console.log(
      `📧 Internal Phishing: ${player.nickname} transferred ${bugsTransferred} bugs to other players`
    );
  }

  private executeEndYearParty(gameState: GameState, player: Player): void {
    // End Year Party: All other players discard their hand and lose next turn

    for (const p of gameState.players) {
      if (p.id !== player.id) {
        // Count cards before discarding
        const cardsDiscarded = p.hand.length;

        // Discard all cards
        gameState.discardPile.push(...p.hand);
        p.hand = [];

        // Mark as skipping next turn
        p.skippedTurns = (p.skippedTurns || 0) + 1;

        console.log(
          `🎉 End Year Party: ${p.nickname} discarded ${cardsDiscarded} cards and will skip next turn`
        );
      }
    }

    console.log(
      `🎉 End Year Party: ${player.nickname} caused chaos for all other players!`
    );
  }

  private executeProjectSwap(
    gameState: GameState,
    player: Player,
    actionData: PlayCardActionData
  ): void {
    // Project Swap: Exchange entire project areas with another player

    if (!actionData.targetPlayerId) {
      throw new Error('Project Swap requires target player');
    }

    const targetPlayer = gameState.players.find(
      p => p.id === actionData.targetPlayerId
    );
    if (!targetPlayer || targetPlayer.id === player.id) {
      throw new Error('Invalid target player for Project Swap');
    }

    // Swap all modules (including stabilized ones)
    const playerModules = [...player.modules];
    const targetModules = [...targetPlayer.modules];

    player.modules = targetModules;
    targetPlayer.modules = playerModules;

    console.log(
      `🔄 Project Swap: ${player.nickname} and ${targetPlayer.nickname} completely swapped their project areas`
    );
  }

  private hasDuplicateModuleColors(modules: any[]): boolean {
    const colors = modules
      .filter(m => m.color !== ModuleColor.MULTICOLOR)
      .map(m => m.color);
    return colors.length !== new Set(colors).size;
  }

  private nextTurn(gameState: GameState): void {
    gameState.currentPlayerIndex =
      (gameState.currentPlayerIndex + 1) % gameState.players.length;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player should skip turn (from End Year Party)
    if (currentPlayer && currentPlayer.skippedTurns > 0) {
      currentPlayer.skippedTurns--;
      console.log(
        `⏭️ ${currentPlayer.nickname} skips turn (${currentPlayer.skippedTurns} skips remaining)`
      );
      this.nextTurn(gameState); // Recursively call to skip this turn
      return;
    }

    // Draw cards for the new current player to have 3 cards
    if (currentPlayer && currentPlayer.hand.length < 3) {
      const cardsToDraw = 3 - currentPlayer.hand.length;
      for (let i = 0; i < cardsToDraw && gameState.deck.length > 0; i++) {
        const drawnCard = gameState.deck.pop()!;
        currentPlayer.hand.push(drawnCard);
      }
    }

    // Skip AI turns for now (basic implementation) - unless it's manual AI control
    if (currentPlayer?.isAI) {
      // Simple AI: skip turn for now (this would be handled by AI service in full implementation)
      this.nextTurn(gameState);
      return;
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
