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

describe('GameManager - Bug Logic', () => {
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

  describe('Bug Placement', () => {
    test('should apply bug to free module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a backend module to player2
      const backendModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Database', en: 'Database' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(backendModule);

      // Add bug to host hand
      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Database error', en: 'Database error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
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
      const updatedPlayer2 = result.players.find((p: any) => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find((m: any) => m.id === backendModule.id)!;

      expect(targetModule.state).toBe(ModuleState.BUGGED);
      expect(targetModule.bugs).toHaveLength(1);
    });

    test('should destroy module when applying second bug', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a bugged module to player2
      const buggedModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Database', en: 'Database' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.BUGGED,
        bugs: [{ id: 'bug-1', type: CardType.BUG, color: ModuleColor.BACKEND }],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(buggedModule);

      // Add second bug to host hand
      const secondBug = {
        id: 'bug-backend-2',
        name: { es: 'Bug Backend 2', en: 'Backend Bug 2' },
        description: { es: 'Another error', en: 'Another error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(secondBug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: secondBug,
          targetPlayerId: player2Id,
          targetModuleId: buggedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find((p: any) => p.id === player2Id)!;

      // Module should be destroyed (removed from player's modules)
      expect(updatedPlayer2.modules.find((m: any) => m.id === buggedModule.id)).toBeUndefined();
    });

    test('should remove patch when applying bug to patched module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a patched module to player2
      const patchedModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend', en: 'Backend Module' },
        description: { es: 'Database', en: 'Database' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.PATCHED,
        bugs: [],
        patches: [{ id: 'patch-1', type: CardType.PATCH, color: ModuleColor.BACKEND }],
        isStabilized: false,
      } as any;

      player2.modules.push(patchedModule);

      // Add bug to host hand
      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Database error', en: 'Database error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(bug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: bug,
          targetPlayerId: player2Id,
          targetModuleId: patchedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedPlayer2 = result.players.find((p: any) => p.id === player2Id)!;
      const targetModule = updatedPlayer2.modules.find((m: any) => m.id === patchedModule.id)!;

      expect(targetModule.state).toBe(ModuleState.FREE);
      expect(targetModule.bugs).toHaveLength(0);
      expect(targetModule.patches).toHaveLength(0);
    });
  });

  describe('Bug Color Validation', () => {
    test('should reject bug with incompatible color', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a backend module to player2
      const backendModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(backendModule);

      // Try to apply frontend bug to backend module
      const frontendBug = {
        id: 'bug-frontend-1',
        name: { es: 'Bug Frontend', en: 'Frontend Bug' },
        description: { es: 'UI error', en: 'UI error' },
        type: CardType.BUG,
        color: ModuleColor.FRONTEND,
      };

      hostPlayer.hand.push(frontendBug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: frontendBug,
          targetPlayerId: player2Id,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Bug color does not match module color'
      );
    });

    test('should allow multicolor bug on any module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a frontend module to player2
      const frontendModule = {
        id: 'module-frontend-1',
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(frontendModule);

      // Apply multicolor bug to frontend module
      const multicolorBug = {
        id: 'bug-multi-1',
        name: { es: 'Bug Multicolor', en: 'Multicolor Bug' },
        description: { es: 'Universal error', en: 'Universal error' },
        type: CardType.BUG,
        color: ModuleColor.MULTICOLOR,
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

    test('should allow any color bug on multicolor module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a multicolor module to player2
      const multicolorModule = {
        id: 'module-multi-1',
        type: CardType.MODULE,
        color: ModuleColor.MULTICOLOR,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(multicolorModule);

      // Apply backend bug to multicolor module
      const backendBug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Server error', en: 'Server error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
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

  describe('Bug Targeting Restrictions', () => {
    test('should reject targeting stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a stabilized module to player2
      const stabilizedModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.STABILIZED,
        bugs: [],
        patches: [
          { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.BACKEND },
          { id: 'patch-2', type: CardType.PATCH, color: ModuleColor.BACKEND },
        ],
        isStabilized: true,
      } as any;

      player2.modules.push(stabilizedModule);

      // Try to apply bug to stabilized module
      const bug = {
        id: 'bug-backend-1',
        name: { es: 'Bug Backend', en: 'Backend Bug' },
        description: { es: 'Database error', en: 'Database error' },
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(bug);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: bug,
          targetPlayerId: player2Id,
          targetModuleId: stabilizedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Cannot target stabilized module'
      );
    });
  });
}); 