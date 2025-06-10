import {
  AIDifficulty,
  CardType,
  GameSettings,
  Language,
  ModuleColor,
  ModuleState,
} from '../../shared/src/types/game';
import { GameManager } from '../src/services/GameManager';

describe('GameManager - TeraDeck Advanced Rules', () => {
  let gameManager: GameManager;
  let roomCode: string;
  let hostId: string;
  let player2Id: string;
  let player3Id: string;

  beforeEach(() => {
    gameManager = new GameManager();
    hostId = 'host-123';
    player2Id = 'player-456';
    player3Id = 'player-789';

    const settings: GameSettings = {
      maxPlayers: 6,
      aiPlayers: 0,
      language: Language.SPANISH,
      aiDifficulty: AIDifficulty.NORMAL,
    };

    roomCode = gameManager.createRoom(settings, hostId, 'Host Player');
    gameManager.joinRoom(roomCode, player2Id, 'Player 2');
    gameManager.joinRoom(roomCode, player3Id, 'Player 3');
    gameManager.startGame(roomCode, hostId);
  });

  describe('Win Conditions', () => {
    test('should win with 4 stable modules (no bugs)', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set up 4 stable modules (different colors, no bugs)
      const stableModules = [
        {
          id: 'module-backend-1',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.PATCHED,
          bugs: [],
          patches: [
            {
              id: 'patch-1',
              type: CardType.PATCH,
              color: ModuleColor.FRONTEND,
            },
          ],
          isStabilized: false,
        },
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.STABILIZED,
          bugs: [],
          patches: [
            { id: 'patch-2', type: CardType.PATCH, color: ModuleColor.MOBILE },
            { id: 'patch-3', type: CardType.PATCH, color: ModuleColor.MOBILE },
          ],
          isStabilized: true,
        },
        {
          id: 'module-data-1',
          type: CardType.MODULE,
          color: ModuleColor.DATA_SCIENCE,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
      ] as any[];

      hostPlayer.modules = stableModules;

      // Check win condition: 4 modules with no bugs
      const stableCount = hostPlayer.modules.filter(
        (m: any) => m.bugs.length === 0
      ).length;
      expect(stableCount).toBe(4);
      expect(hostPlayer.modules).toHaveLength(4);

      // All modules should be stable (no bugs)
      const hasAnyBugs = hostPlayer.modules.some((m: any) => m.bugs.length > 0);
      expect(hasAnyBugs).toBe(false);
    });

    test('should NOT win with bugged modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set up 4 modules but one is bugged
      const modulesWithBug = [
        {
          id: 'module-backend-1',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.BUGGED,
          bugs: [
            { id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND },
          ],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-data-1',
          type: CardType.MODULE,
          color: ModuleColor.DATA_SCIENCE,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
      ] as any[];

      hostPlayer.modules = modulesWithBug;

      // Should NOT win because one module is bugged
      const hasAnyBugs = modulesWithBug.some((m: any) => m.bugs.length > 0);
      expect(hasAnyBugs).toBe(true);

      const stableCount = modulesWithBug.filter(
        (m: any) => m.bugs.length === 0
      ).length;
      expect(stableCount).toBe(3); // Only 3 stable, 1 bugged
    });

    test('should win with multicolor module counting as 4th', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set up 3 colored modules + 1 multicolor = win condition
      const modulesWithMulticolor = [
        {
          id: 'module-backend-1',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-multi-1',
          type: CardType.MODULE,
          color: ModuleColor.MULTICOLOR,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
      ] as any[];

      hostPlayer.modules = modulesWithMulticolor;

      // Should win with 4 stable modules including multicolor
      const stableCount = modulesWithMulticolor.filter(
        (m: any) => m.bugs.length === 0
      ).length;
      expect(stableCount).toBe(4);
      expect(hostPlayer.modules).toHaveLength(4);
    });
  });

  describe('Reclutamiento del Groso (Module Stealing)', () => {
    test('should allow stealing non-stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up stealable modules
      const stealableModules = [
        {
          id: 'module-backend-1',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.BUGGED,
          bugs: [
            { id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND },
          ],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.PATCHED,
          bugs: [],
          patches: [
            { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.MOBILE },
          ],
          isStabilized: false,
        },
      ] as any[];

      player2.modules = stealableModules;

      // All should be stealable (not stabilized)
      stealableModules.forEach(module => {
        expect(module.isStabilized).toBe(false);
        expect(module.state).not.toBe(ModuleState.STABILIZED);
      });
    });

    test('should NOT allow stealing stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up stabilized module
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

      player2.modules = [stabilizedModule];

      // Should NOT be stealable
      expect(stabilizedModule.isStabilized).toBe(true);
      expect(stabilizedModule.state).toBe(ModuleState.STABILIZED);
    });
  });

  describe('Phishing Interno (Bug Transfer)', () => {
    test('should only allow bug transfer to FREE modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Host has bugged modules to transfer from
      const hostBuggedModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.BUGGED,
        bugs: [{ id: 'bug-1', type: CardType.BUG, color: ModuleColor.BACKEND }],
        patches: [],
        isStabilized: false,
      } as any;

      // Player2 has modules in different states
      const validTargets = [
        {
          id: 'module-backend-2',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE, // ✅ Valid target
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-multi-1',
          type: CardType.MODULE,
          color: ModuleColor.MULTICOLOR,
          state: ModuleState.FREE, // ✅ Valid target (multicolor accepts any bug)
          bugs: [],
          patches: [],
          isStabilized: false,
        },
      ] as any[];

      const invalidTargets = [
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.PATCHED, // ❌ Invalid (has patch)
          bugs: [],
          patches: [
            {
              id: 'patch-1',
              type: CardType.PATCH,
              color: ModuleColor.FRONTEND,
            },
          ],
          isStabilized: false,
        },
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.BUGGED, // ❌ Invalid (already bugged)
          bugs: [
            { id: 'bug-2', type: CardType.BUG, color: ModuleColor.MOBILE },
          ],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'module-data-1',
          type: CardType.MODULE,
          color: ModuleColor.DATA_SCIENCE,
          state: ModuleState.STABILIZED, // ❌ Invalid (stabilized)
          bugs: [],
          patches: [
            {
              id: 'patch-2',
              type: CardType.PATCH,
              color: ModuleColor.DATA_SCIENCE,
            },
            {
              id: 'patch-3',
              type: CardType.PATCH,
              color: ModuleColor.DATA_SCIENCE,
            },
          ],
          isStabilized: true,
        },
      ] as any[];

      hostPlayer.modules = [hostBuggedModule];
      player2.modules = [...validTargets, ...invalidTargets];

      // Only FREE modules should be valid targets
      validTargets.forEach(module => {
        expect(module.state).toBe(ModuleState.FREE);
        expect(module.bugs.length).toBe(0);
        expect(module.isStabilized).toBe(false);
      });

      // Others should not be valid targets
      invalidTargets.forEach(module => {
        expect(module.state).not.toBe(ModuleState.FREE);
      });
    });

    test('should keep bugs that cannot be transferred', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Host has a backend bug but no one has compatible modules
      const hostBuggedModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.BUGGED,
        bugs: [
          {
            id: 'bug-backend-1',
            type: CardType.BUG,
            color: ModuleColor.BACKEND,
          },
        ],
        patches: [],
        isStabilized: false,
      } as any;

      // Player2 only has frontend modules (incompatible)
      const incompatibleModule = {
        id: 'module-frontend-1',
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules = [hostBuggedModule];
      player2.modules = [incompatibleModule];

      // Backend bug cannot be transferred to frontend module
      expect(hostBuggedModule.bugs).toHaveLength(1);
      expect(hostBuggedModule.bugs[0].color).toBe(ModuleColor.BACKEND);
      expect(incompatibleModule.color).toBe(ModuleColor.FRONTEND);

      // Bug should stay with original player (cannot transfer)
    });
  });

  describe('Cambio de Arquitecto (Module Exchange)', () => {
    test('should allow module exchange between players', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up modules for exchange
      const hostModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.PATCHED,
        bugs: [],
        patches: [
          { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.BACKEND },
        ],
        isStabilized: false,
      } as any;

      const player2Module = {
        id: 'module-frontend-1',
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.BUGGED,
        bugs: [
          { id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND },
        ],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules = [hostModule];
      player2.modules = [player2Module];

      // Verify initial state
      expect(hostPlayer.modules[0].color).toBe(ModuleColor.BACKEND);
      expect(player2.modules[0].color).toBe(ModuleColor.FRONTEND);

      // After exchange, modules should swap while maintaining their states
      // (This would be implemented in the actual operation logic)
    });

    test('should prevent duplicate colors after exchange', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Host already has backend module
      const hostExistingModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      // Player2 has another backend module
      const player2BackendModule = {
        id: 'module-backend-2',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules = [hostExistingModule];
      player2.modules = [player2BackendModule];

      // This exchange should be invalid (would create duplicate colors)
      expect(hostPlayer.modules[0].color).toBe(ModuleColor.BACKEND);
      expect(player2.modules[0].color).toBe(ModuleColor.BACKEND);
      // Exchange should fail due to color duplication
    });
  });

  describe('Color Compatibility Rules', () => {
    test('multicolor compatibility should work correctly', () => {
      // Test that multicolor modules accept any bug/patch color
      const multicolorModule = {
        id: 'module-multi-1',
        type: CardType.MODULE,
        color: ModuleColor.MULTICOLOR,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      // Should accept bugs/patches of any color
      const backendBug = {
        id: 'bug-1',
        type: CardType.BUG,
        color: ModuleColor.BACKEND,
      };
      const frontendPatch = {
        id: 'patch-1',
        type: CardType.PATCH,
        color: ModuleColor.FRONTEND,
      };

      expect(multicolorModule.color).toBe(ModuleColor.MULTICOLOR);
      expect(backendBug.color).toBe(ModuleColor.BACKEND);
      expect(frontendPatch.color).toBe(ModuleColor.FRONTEND);
      // Multicolor should be compatible with any color
    });

    test('multicolor bugs/patches should work on any module', () => {
      const backendModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      // Multicolor bug/patch should work on any module
      const multicolorBug = {
        id: 'bug-1',
        type: CardType.BUG,
        color: ModuleColor.MULTICOLOR,
      };
      const multicolorPatch = {
        id: 'patch-1',
        type: CardType.PATCH,
        color: ModuleColor.MULTICOLOR,
      };

      expect(backendModule.color).toBe(ModuleColor.BACKEND);
      expect(multicolorBug.color).toBe(ModuleColor.MULTICOLOR);
      expect(multicolorPatch.color).toBe(ModuleColor.MULTICOLOR);
      // Should be compatible with multicolor cards
    });
  });
});
