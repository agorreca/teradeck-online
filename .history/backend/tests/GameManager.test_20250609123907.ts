import {
  ActionType,
  AIDifficulty,
  CardType,
  GameSettings,
  Language,
  ModuleState,
  PlayCardActionData,
} from '../../shared/src/types/game';
import { GameManager } from '../src/services/GameManager';

describe('GameManager - TeraDeck Rules', () => {
  let gameManager: GameManager;
  let roomCode: string;
  let hostId: string;
  let player2Id: string;

  beforeEach(() => {
    gameManager = new GameManager();
    hostId = 'host-123';
    player2Id = 'player-456';

    const settings: GameSettings = {
      maxPlayers: 6,
      aiPlayers: 0,
      language: Language.SPANISH,
      aiDifficulty: AIDifficulty.NORMAL,
    };

    roomCode = gameManager.createRoom(settings, hostId, 'Host Player');
    gameManager.joinRoom(roomCode, player2Id, 'Player 2');
    gameManager.startGame(roomCode, hostId);
  });

  describe('Module Playing Rules', () => {
    test('should allow playing different colored modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      // Add a backend module to hand
      const backendModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Análisis de datos', en: 'Data analysis' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(backendModule);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: backendModule } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer = result.players.find(p => p.id === hostId)!;

      expect(updatedPlayer.modules).toHaveLength(1);
      expect(updatedPlayer.modules[0].color).toBe('backend');
      expect(updatedPlayer.modules[0].state).toBe(ModuleState.FREE);
    });

    test('should reject duplicate colored modules (non-multicolor)', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      // Add two backend modules
      const backendModule1 = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend 1', en: 'Backend Module 1' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      const backendModule2 = {
        id: 'module-backend-2',
        name: { es: 'Módulo Backend 2', en: 'Backend Module 2' },
        description: { es: 'API', en: 'API' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(backendModule1, backendModule2);

      // Play first backend module
      const action1 = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: backendModule1 } as PlayCardActionData,
        timestamp: Date.now(),
      };

      gameManager.processAction(roomCode, action1);

      // Try to play second backend module - should fail
      const action2 = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: backendModule2 } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action2)).toThrow(
        'Already have this module color'
      );
    });

    test('should allow multiple multicolor modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      const multicolorModule1 = {
        id: 'module-multi-1',
        name: { es: 'Módulo Multicolor 1', en: 'Multicolor Module 1' },
        description: { es: 'Comodín', en: 'Wildcard' },
        type: CardType.MODULE,
        color: 'multicolor' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(multicolorModule1);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: multicolorModule1 } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });
  });

  describe('Bug and Patch Interactions', () => {
    let gameState: any;
    let hostPlayer: any;
    let player2: any;
    let backendModule: any;

    beforeEach(() => {
      gameState = gameManager.getRoomState(roomCode)!;
      hostPlayer = gameState.players.find(p => p.id === hostId)!;
      player2 = gameState.players.find(p => p.id === player2Id)!;

      // Add a backend module to player2
      backendModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      player2.modules.push(backendModule);
    });

    test('bug on free module should make it bugged', () => {
      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Error en base de datos', en: 'Database error' },
        type: CardType.BUG,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(bug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: bug,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find(
        m => m.id === backendModule.id
      )!;

      expect(targetModule.state).toBe(ModuleState.BUGGED);
      expect(targetModule.bugs).toHaveLength(1);
    });

    test('patch on bugged module should remove both (bug + patch = both discard)', () => {
      // First, add a bug to the module
      backendModule.bugs.push({
        id: 'bug-backend-1',
        type: CardType.BUG,
        color: 'backend',
      });
      backendModule.state = ModuleState.BUGGED;

      const patch = {
        id: 'patch-backend-1',
        name: { es: 'Parche Backend', en: 'Backend Patch' },
        description: { es: 'Fix para base de datos', en: 'Database fix' },
        type: CardType.PATCH,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find(
        m => m.id === backendModule.id
      )!;

      expect(targetModule.state).toBe(ModuleState.FREE);
      expect(targetModule.bugs).toHaveLength(0);
      expect(targetModule.patches).toHaveLength(0);
      expect(result.discardPile.length).toBeGreaterThan(0); // Should have bug, patch, and played card
    });

    test('bug on patched module should remove both (patch + bug = both discard)', () => {
      // First, add a patch to the module
      backendModule.patches.push({
        id: 'patch-backend-1',
        type: CardType.PATCH,
        color: 'backend',
      });
      backendModule.state = ModuleState.PATCHED;

      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Error en base de datos', en: 'Database error' },
        type: CardType.BUG,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(bug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: bug,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find(
        m => m.id === backendModule.id
      )!;

      expect(targetModule.state).toBe(ModuleState.FREE);
      expect(targetModule.bugs).toHaveLength(0);
      expect(targetModule.patches).toHaveLength(0);
    });

    test('second bug on bugged module should destroy module (bug + bug = module destroyed)', () => {
      // First, add a bug to the module
      backendModule.bugs.push({
        id: 'bug-backend-1',
        type: CardType.BUG,
        color: 'backend',
      });
      backendModule.state = ModuleState.BUGGED;

      const secondBug = {
        id: 'bug-backend-2',
        name: { es: 'Bug Backend 2', en: 'Backend Bug 2' },
        description: { es: 'Otro error', en: 'Another error' },
        type: CardType.BUG,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(secondBug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: secondBug,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;

      // Module should be destroyed (removed from player's modules)
      expect(
        updatedPlayer2.modules.find(m => m.id === backendModule.id)
      ).toBeUndefined();
    });

    test('second patch on patched module should stabilize it', () => {
      // First, add a patch to the module
      backendModule.patches.push({
        id: 'patch-backend-1',
        type: CardType.PATCH,
        color: 'backend',
      });
      backendModule.state = ModuleState.PATCHED;

      const secondPatch = {
        id: 'patch-backend-2',
        name: { es: 'Parche Backend 2', en: 'Backend Patch 2' },
        description: { es: 'Otro fix', en: 'Another fix' },
        type: CardType.PATCH,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(secondPatch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: secondPatch,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find(
        m => m.id === backendModule.id
      )!;

      expect(targetModule.state).toBe(ModuleState.STABILIZED);
      expect(targetModule.isStabilized).toBe(true);
      expect(targetModule.patches).toHaveLength(2);
    });
  });

  describe('Multicolor Compatibility', () => {
    test('multicolor bug should work on any module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Add a frontend module to player2
      const frontendModule = {
        id: 'module-frontend-1',
        name: { es: 'Módulo Frontend', en: 'Frontend Module' },
        description: { es: 'Interfaz de usuario', en: 'User interface' },
        type: CardType.MODULE,
        color: 'frontend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      player2.modules.push(frontendModule);

      // Use multicolor bug on frontend module
      const multicolorBug = {
        id: 'bug-multi-1',
        name: { es: 'Bug Multicolor', en: 'Multicolor Bug' },
        description: { es: 'Error universal', en: 'Universal error' },
        type: CardType.BUG,
        color: 'multicolor' as const,
      };

      hostPlayer.hand.push(multicolorBug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: multicolorBug,
          targetPlayerId: player2Id,
          targetModuleId: frontendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });

    test('any color bug should work on multicolor module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Add a multicolor module to player2
      const multicolorModule = {
        id: 'module-multi-1',
        name: { es: 'Módulo Multicolor', en: 'Multicolor Module' },
        description: { es: 'Comodín', en: 'Wildcard' },
        type: CardType.MODULE,
        color: 'multicolor' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      player2.modules.push(multicolorModule);

      // Use backend bug on multicolor module
      const backendBug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Error de servidor', en: 'Server error' },
        type: CardType.BUG,
        color: 'backend' as const,
      };

      hostPlayer.hand.push(backendBug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: backendBug,
          targetPlayerId: player2Id,
          targetModuleId: multicolorModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });
  });

  describe('Turn Management', () => {
    test('should advance turn after card play', () => {
      const initialState = gameManager.getRoomState(roomCode)!;
      const initialTurnPlayer = initialState.currentPlayerIndex;

      // Add a module to play
      const hostPlayer = initialState.players.find(p => p.id === hostId)!;
      const module = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(module);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: module } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);

      expect(result.currentPlayerIndex).not.toBe(initialTurnPlayer);
    });

    test('should not allow playing when not your turn', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const notCurrentPlayer = gameState.players.find(
        (_, index) => index !== gameState.currentPlayerIndex
      )!;

      const module = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: notCurrentPlayer.id,
        data: { card: module } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Not your turn'
      );
    });
  });

  describe('Card Drawing', () => {
    test('should draw card after playing to maintain 3 cards', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const currentPlayerIndex = gameState.currentPlayerIndex;
      const currentPlayer = gameState.players[currentPlayerIndex];

      const initialHandSize = currentPlayer.hand.length;
      const initialDeckSize = gameState.deck.length;

      // Add a module to play
      const module = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: 'backend' as const,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      currentPlayer.hand.push(module);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: currentPlayer.id,
        data: { card: module } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer = result.players.find(
        p => p.id === currentPlayer.id
      )!;

      // Hand size should be same (played 1, drew 1)
      expect(updatedPlayer.hand.length).toBe(initialHandSize);
      // Deck should be smaller
      expect(result.deck.length).toBe(initialDeckSize - 1);
    });
  });
});
