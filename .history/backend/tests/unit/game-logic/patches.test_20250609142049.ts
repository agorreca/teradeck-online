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

describe('GameManager - Patch Logic', () => {
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

  describe('Patch Application', () => {
    test('should apply patch to free module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a backend module to host
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

      hostPlayer.modules.push(backendModule);

      // Add patch to host hand
      const patch = {
        id: 'patch-backend-1',
        name: { es: 'Patch Backend', en: 'Backend Patch' },
        description: { es: 'Database fix', en: 'Database fix' },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: hostId,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedHost = result.players.find((p: any) => p.id === hostId)!;
      const targetModule = updatedHost.modules.find((m: any) => m.id === backendModule.id)!;

      expect(targetModule.state).toBe(ModuleState.PATCHED);
      expect(targetModule.patches).toHaveLength(1);
    });

    test('should remove bug when applying patch to bugged module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a bugged module to host
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

      hostPlayer.modules.push(buggedModule);

      // Add patch to host hand
      const patch = {
        id: 'patch-backend-1',
        name: { es: 'Patch Backend', en: 'Backend Patch' },
        description: { es: 'Database fix', en: 'Database fix' },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: hostId,
          targetModuleId: buggedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedHost = result.players.find((p: any) => p.id === hostId)!;
      const targetModule = updatedHost.modules.find((m: any) => m.id === buggedModule.id)!;

      expect(targetModule.state).toBe(ModuleState.FREE);
      expect(targetModule.bugs).toHaveLength(0);
      expect(targetModule.patches).toHaveLength(0);
    });

    test('should stabilize module when applying second patch', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a patched module to host
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

      hostPlayer.modules.push(patchedModule);

      // Add second patch to host hand
      const secondPatch = {
        id: 'patch-backend-2',
        name: { es: 'Patch Backend 2', en: 'Backend Patch 2' },
        description: { es: 'Another fix', en: 'Another fix' },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(secondPatch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: secondPatch,
          targetPlayerId: hostId,
          targetModuleId: patchedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedHost = result.players.find((p: any) => p.id === hostId)!;
      const targetModule = updatedHost.modules.find((m: any) => m.id === patchedModule.id)!;

      expect(targetModule.state).toBe(ModuleState.STABILIZED);
      expect(targetModule.isStabilized).toBe(true);
      expect(targetModule.patches).toHaveLength(2);
    });
  });

  describe('Patch Color Validation', () => {
    test('should reject patch with incompatible color', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a backend module to host
      const backendModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(backendModule);

      // Try to apply frontend patch to backend module
      const frontendPatch = {
        id: 'patch-frontend-1',
        name: { es: 'Patch Frontend', en: 'Frontend Patch' },
        description: { es: 'UI fix', en: 'UI fix' },
        type: CardType.PATCH,
        color: ModuleColor.FRONTEND,
      };

      hostPlayer.hand.push(frontendPatch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: frontendPatch,
          targetPlayerId: hostId,
          targetModuleId: backendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Patch color does not match module color'
      );
    });

    test('should allow multicolor patch on any module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a frontend module to host
      const frontendModule = {
        id: 'module-frontend-1',
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(frontendModule);

      // Apply multicolor patch to frontend module
      const multicolorPatch = {
        id: 'patch-multi-1',
        name: { es: 'Patch Multicolor', en: 'Multicolor Patch' },
        description: { es: 'Universal fix', en: 'Universal fix' },
        type: CardType.PATCH,
        color: ModuleColor.MULTICOLOR,
      };

      hostPlayer.hand.push(multicolorPatch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: multicolorPatch,
          targetPlayerId: hostId,
          targetModuleId: frontendModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });

    test('should allow any color patch on multicolor module', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a multicolor module to host
      const multicolorModule = {
        id: 'module-multi-1',
        type: CardType.MODULE,
        color: ModuleColor.MULTICOLOR,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(multicolorModule);

      // Apply mobile patch to multicolor module
      const mobilePatch = {
        id: 'patch-mobile-1',
        name: { es: 'Patch Mobile', en: 'Mobile Patch' },
        description: { es: 'App fix', en: 'App fix' },
        type: CardType.PATCH,
        color: ModuleColor.MOBILE,
      };

      hostPlayer.hand.push(mobilePatch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: mobilePatch,
          targetPlayerId: hostId,
          targetModuleId: multicolorModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).not.toThrow();
    });
  });

  describe('Patch Targeting Restrictions', () => {
    test('should reject targeting own stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a stabilized module to host
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

      hostPlayer.modules.push(stabilizedModule);

      // Try to apply patch to stabilized module
      const patch = {
        id: 'patch-backend-3',
        name: { es: 'Patch Backend', en: 'Backend Patch' },
        description: { es: 'Database fix', en: 'Database fix' },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: hostId,
          targetModuleId: stabilizedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Cannot target stabilized module'
      );
    });

    test('should apply patch only to own modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a module to player2
      const player2Module = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(player2Module);

      // Try to apply patch to other player's module
      const patch = {
        id: 'patch-backend-1',
        name: { es: 'Patch Backend', en: 'Backend Patch' },
        description: { es: 'Database fix', en: 'Database fix' },
        type: CardType.PATCH,
        color: ModuleColor.BACKEND,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: player2Id,
          targetModuleId: player2Module.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, action)).toThrow(
        'Can only apply patches to own modules'
      );
    });
  });

  describe('Patch Self-Targeting', () => {
    test('should allow patching own free modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set host turn
      const hostPlayerIndex = gameState.players.findIndex((p: any) => p.id === hostId);
      gameState.currentPlayerIndex = hostPlayerIndex;

      // Add a data science module to host
      const dataScienceModule = {
        id: 'module-data-1',
        name: { es: 'Módulo Data Science', en: 'Data Science Module' },
        description: { es: 'Analytics', en: 'Analytics' },
        type: CardType.MODULE,
        color: ModuleColor.DATA_SCIENCE,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(dataScienceModule);

      // Add patch to host hand
      const patch = {
        id: 'patch-data-1',
        name: { es: 'Patch Data Science', en: 'Data Science Patch' },
        description: { es: 'Analytics fix', en: 'Analytics fix' },
        type: CardType.PATCH,
        color: ModuleColor.DATA_SCIENCE,
      };

      hostPlayer.hand.push(patch);

      const action = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: patch,
          targetPlayerId: hostId,
          targetModuleId: dataScienceModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, action);
      const updatedHost = result.players.find((p: any) => p.id === hostId)!;
      const targetModule = updatedHost.modules.find((m: any) => m.id === dataScienceModule.id)!;

      expect(targetModule.state).toBe(ModuleState.PATCHED);
      expect(targetModule.patches).toHaveLength(1);
    });
  });
}); 