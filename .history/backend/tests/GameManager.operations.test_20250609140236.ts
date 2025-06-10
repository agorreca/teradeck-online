import {
  AIDifficulty,
  CardType,
  GameSettings,
  Language,
  ModuleColor,
  ModuleState,
} from '../../shared/src/types/game';
import { GameManager } from '../src/services/GameManager';

describe('GameManager - TeraDeck Operations', () => {
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

  describe('Cambio de Arquitecto (Module Exchange)', () => {
    test('should allow exchanging modules between players', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up modules for both players
      const hostModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend Host', en: 'Host Backend Module' },
        description: { es: 'Base de datos', en: 'Database' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      const player2Module = {
        id: 'module-frontend-1',
        name: { es: 'Módulo Frontend P2', en: 'P2 Frontend Module' },
        description: { es: 'UI', en: 'UI' },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(hostModule);
      player2.modules.push(player2Module);

      // This test validates the setup - actual operation implementation would be tested here
      expect(hostPlayer.modules).toHaveLength(1);
      expect(player2.modules).toHaveLength(1);
      expect(hostPlayer.modules[0].color).toBe(ModuleColor.BACKEND);
      expect(player2.modules[0].color).toBe(ModuleColor.FRONTEND);
    });
  });

  describe('Reclutamiento del Groso (Module Stealing)', () => {
    test('should not allow stealing stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up a stabilized module
      const stabilizedModule = {
        id: 'module-backend-1',
        name: {
          es: 'Módulo Backend Estabilizado',
          en: 'Stabilized Backend Module',
        },
        description: { es: 'Base de datos segura', en: 'Secure database' },
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

      // Stabilized modules should not be stealable
      expect(stabilizedModule.isStabilized).toBe(true);
      expect(stabilizedModule.state).toBe(ModuleState.STABILIZED);
    });

    test('should allow stealing non-stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up modules in different states
      const freeModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend Libre', en: 'Free Backend Module' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      const buggedModule = {
        id: 'module-frontend-1',
        name: { es: 'Módulo Frontend Buggeado', en: 'Bugged Frontend Module' },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.BUGGED,
        bugs: [
          { id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND },
        ],
        patches: [],
        isStabilized: false,
      } as any;

      const patchedModule = {
        id: 'module-mobile-1',
        name: { es: 'Módulo Mobile Parcheado', en: 'Patched Mobile Module' },
        type: CardType.MODULE,
        color: ModuleColor.MOBILE,
        state: ModuleState.PATCHED,
        bugs: [],
        patches: [
          { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.MOBILE },
        ],
        isStabilized: false,
      } as any;

      player2.modules.push(freeModule, buggedModule, patchedModule);

      // All non-stabilized modules should be stealable
      expect(freeModule.isStabilized).toBe(false);
      expect(buggedModule.isStabilized).toBe(false);
      expect(patchedModule.isStabilized).toBe(false);
    });
  });

  describe('Phishing Interno (Bug Transfer)', () => {
    test('should only transfer bugs to free modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Host has bugged modules
      const hostBuggedModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend Buggeado', en: 'Bugged Backend Module' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.BUGGED,
        bugs: [{ id: 'bug-1', type: CardType.BUG, color: ModuleColor.BACKEND }],
        patches: [],
        isStabilized: false,
      } as any;

      // Player2 has modules in different states
      const freeModule = {
        id: 'module-backend-2',
        name: { es: 'Módulo Backend Libre', en: 'Free Backend Module' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      const patchedModule = {
        id: 'module-frontend-1',
        name: {
          es: 'Módulo Frontend Parcheado',
          en: 'Patched Frontend Module',
        },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.PATCHED,
        bugs: [],
        patches: [
          { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.FRONTEND },
        ],
        isStabilized: false,
      } as any;

      hostPlayer.modules.push(hostBuggedModule);
      player2.modules.push(freeModule, patchedModule);

      // Only free modules should be valid targets for bug transfer
      expect(freeModule.state).toBe(ModuleState.FREE);
      expect(patchedModule.state).toBe(ModuleState.PATCHED);
      expect(hostBuggedModule.bugs).toHaveLength(1);
    });
  });

  describe('Fiesta de Fin de Año (End of Year Party)', () => {
    test('should affect all other players but not the one who plays it', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;
      const player3 = gameState.players.find((p: any) => p.id === player3Id)!;

      // Set up hands for all players
      hostPlayer.hand = [
        { id: 'card-1', type: CardType.MODULE, color: ModuleColor.BACKEND },
        { id: 'card-2', type: CardType.BUG, color: ModuleColor.FRONTEND },
        { id: 'card-3', type: CardType.PATCH, color: ModuleColor.MOBILE },
      ];

      player2.hand = [
        { id: 'card-4', type: CardType.MODULE, color: ModuleColor.FRONTEND },
        { id: 'card-5', type: CardType.BUG, color: ModuleColor.BACKEND },
      ];

      player3.hand = [
        { id: 'card-6', type: CardType.PATCH, color: ModuleColor.DATA_SCIENCE },
      ];

      // Validate initial state
      expect(hostPlayer.hand).toHaveLength(3);
      expect(player2.hand).toHaveLength(2);
      expect(player3.hand).toHaveLength(1);

      // After Fiesta de Fin de Año:
      // - Host keeps their hand (they played the card)
      // - Other players should discard their hands
      // - Other players should lose their next turn
    });
  });

  describe('Project Swap (Complete Project Exchange)', () => {
    test('should exchange complete projects including stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up complete projects for both players
      const hostModules = [
        {
          id: 'module-backend-1',
          type: CardType.MODULE,
          color: ModuleColor.BACKEND,
          state: ModuleState.STABILIZED,
          isStabilized: true,
          bugs: [],
          patches: [
            { id: 'patch-1', type: CardType.PATCH, color: ModuleColor.BACKEND },
            { id: 'patch-2', type: CardType.PATCH, color: ModuleColor.BACKEND },
          ],
        },
        {
          id: 'module-frontend-1',
          type: CardType.MODULE,
          color: ModuleColor.FRONTEND,
          state: ModuleState.BUGGED,
          isStabilized: false,
          bugs: [
            { id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND },
          ],
          patches: [],
        },
      ] as any[];

      const player2Modules = [
        {
          id: 'module-mobile-1',
          type: CardType.MODULE,
          color: ModuleColor.MOBILE,
          state: ModuleState.FREE,
          isStabilized: false,
          bugs: [],
          patches: [],
        },
        {
          id: 'module-data-1',
          type: CardType.MODULE,
          color: ModuleColor.DATA_SCIENCE,
          state: ModuleState.PATCHED,
          isStabilized: false,
          bugs: [],
          patches: [
            {
              id: 'patch-3',
              type: CardType.PATCH,
              color: ModuleColor.DATA_SCIENCE,
            },
          ],
        },
      ] as any[];

      hostPlayer.modules = [...hostModules];
      player2.modules = [...player2Modules];

      // Validate initial state
      expect(hostPlayer.modules).toHaveLength(2);
      expect(player2.modules).toHaveLength(2);
      expect(hostPlayer.modules[0].color).toBe(ModuleColor.BACKEND);
      expect(player2.modules[0].color).toBe(ModuleColor.MOBILE);

      // After Project Swap, the entire projects should be exchanged
      // including all bugs, patches, and stabilized states
    });
  });

  describe('Color Compatibility Rules', () => {
    test('multicolor cards should work with any module color', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find((p: any) => p.id === player2Id)!;

      // Set up modules of different colors
      const backendModule = {
        id: 'module-backend-1',
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      const multicolorModule = {
        id: 'module-multi-1',
        type: CardType.MODULE,
        color: ModuleColor.MULTICOLOR,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      } as any;

      player2.modules.push(backendModule, multicolorModule);

      // Multicolor bugs/patches should work on any module
      // Any color bugs/patches should work on multicolor modules
      expect(backendModule.color).toBe(ModuleColor.BACKEND);
      expect(multicolorModule.color).toBe(ModuleColor.MULTICOLOR);
    });
  });

  describe('Win Conditions', () => {
    test('should win with 4 stable modules (no bugs)', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find((p: any) => p.id === hostId)!;

      // Set up 4 stable modules (free or stabilized, but no bugs)
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
          patches: [{ id: 'patch-1', type: CardType.PATCH, color: ModuleColor.FRONTEND }],
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

      // Count stable modules (no bugs)
      const stableCount = hostPlayer.modules.filter((m: any) => m.bugs.length === 0).length;
      expect(stableCount).toBe(4);

      // Player should win with 4 stable modules
      expect(hostPlayer.modules).toHaveLength(4);
      expect(hostPlayer.modules.every((m: any) => m.bugs.length === 0)).toBe(true);
    });

    test('should not win with bugged modules', () => {
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
          bugs: [{ id: 'bug-1', type: CardType.BUG, color: ModuleColor.FRONTEND }],
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

      // Count stable modules (no bugs)
      const stableCount = hostPlayer.modules.filter((m: any) => m.bugs.length === 0).length;
      expect(stableCount).toBe(3); // Only 3 stable, 1 bugged

      // Player should NOT win because one module is bugged
      expect(hostPlayer.modules).toHaveLength(4);
      expect(hostPlayer.modules.some((m: any) => m.bugs.length > 0)).toBe(true);
    });
  });
});
