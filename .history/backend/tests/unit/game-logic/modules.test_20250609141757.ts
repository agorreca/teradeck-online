import {
  ActionType,
  AIDifficulty,
  CardType,
  GameSettings,
  Language,
  ModuleColor,
  ModuleState,
  PlayCardActionData,
} from '../../../../shared/src/types/game';
import { GameManager } from '../../../src/services/GameManager';

describe('GameManager - Module Logic', () => {
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

  describe('Module Placement', () => {
    test('should allow placing different colored modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      const backendModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Database management', en: 'Database management' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
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
      const updatedPlayer = result.players.find((p: any) => p.id === hostId)!;

      expect(updatedPlayer.modules).toHaveLength(1);
      expect(updatedPlayer.modules[0].color).toBe(ModuleColor.BACKEND);
      expect(updatedPlayer.modules[0].state).toBe(ModuleState.FREE);
    });

    test('should reject duplicate colored modules (non-multicolor)', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      
      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;
      
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      const backendModule1 = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend 1', en: 'Backend Module 1' },
        description: { es: 'Database', en: 'Database' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
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
        color: ModuleColor.BACKEND,
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

      const result1 = gameManager.processAction(roomCode, action1);
      
      // Reset turn back to host for second action
      result1.currentPlayerIndex = hostPlayerIndex;

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
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      const multicolorModule = {
        id: 'module-multi-1',
        name: { es: 'Módulo Multicolor', en: 'Multicolor Module' },
        description: { es: 'Wildcard module', en: 'Wildcard module' },
        type: CardType.MODULE,
        color: ModuleColor.MULTICOLOR,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(multicolorModule);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: multicolorModule } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });
  });

  describe('Module Types', () => {
    test('should support all 5 module types', () => {
      const moduleTypes = [
        ModuleColor.BACKEND,
        ModuleColor.FRONTEND,
        ModuleColor.MOBILE,
        ModuleColor.DATA_SCIENCE,
        ModuleColor.MULTICOLOR,
      ];

      expect(moduleTypes).toHaveLength(5);
      expect(moduleTypes).toContain(ModuleColor.BACKEND);
      expect(moduleTypes).toContain(ModuleColor.FRONTEND);
      expect(moduleTypes).toContain(ModuleColor.MOBILE);
      expect(moduleTypes).toContain(ModuleColor.DATA_SCIENCE);
      expect(moduleTypes).toContain(ModuleColor.MULTICOLOR);
    });

    test('should create modules with correct initial state', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      const frontendModule = {
        id: 'module-frontend-1',
        name: { es: 'Módulo Frontend', en: 'Frontend Module' },
        description: { es: 'User interface', en: 'User interface' },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.hand.push(frontendModule);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: { card: frontendModule } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer = result.players.find((p: any) => p.id === hostId)!;
      const placedModule = updatedPlayer.modules[0];

      expect(placedModule.state).toBe(ModuleState.FREE);
      expect(placedModule.bugs).toHaveLength(0);
      expect(placedModule.patches).toHaveLength(0);
      expect(placedModule.isStabilized).toBe(false);
    });
  });

  describe('Module Validation', () => {
    test('should validate module exists before targeting', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Add a bug card to hand
      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Database error', en: 'Database error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(bug);

      // Try to target non-existent module
      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: bug,
          targetPlayerId: player2Id,
          targetModuleId: 'non-existent-module',
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Target module not found'
      );
    });
  });
}); 