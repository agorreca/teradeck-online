import {
  ActionType,
  AIDifficulty,
  CardType,
  GameSettings,
  Language,
  ModuleColor,
  ModuleState,
  OperationEffect,
  PlayCardActionData,
} from '../../shared/src/types/game';
import { GameManager } from '../src/services/GameManager';

describe('GameManager - Operation Cards', () => {
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

  describe('Architect Change Operation', () => {
    test('should exchange modules between two players', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Set up modules for both players
      const hostModule = {
        id: 'module-backend-1',
        name: { es: 'Módulo Backend Host', en: 'Host Backend Module' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      const player2Module = {
        id: 'module-frontend-1',
        name: { es: 'Módulo Frontend P2', en: 'P2 Frontend Module' },
        type: CardType.MODULE,
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.modules.push(hostModule as any);
      player2.modules.push(player2Module as any);

      // Create Architect Change operation card
      const architectChangeCard = {
        id: 'op-architect-1',
        name: { es: 'Cambio de Arquitecto', en: 'Architect Change' },
        type: CardType.OPERATION,
        effect: OperationEffect.ARCHITECT_CHANGE,
      };

      hostPlayer.hand.push(architectChangeCard as any);

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: architectChangeCard,
          swapPlayerIds: [hostId, player2Id],
          swapModuleIds: [hostModule.id, player2Module.id],
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, playAction);
      const updatedHost = result.players.find(p => p.id === hostId)!;
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;

      // Modules should be swapped
      expect(updatedHost.modules[0].id).toBe(player2Module.id);
      expect(updatedPlayer2.modules[0].id).toBe(hostModule.id);
    });

    test('should prevent swap that would create duplicate colors', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Both players have same color modules (Backend)
      const hostModule = {
        id: 'module-backend-1',
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      const player2Module = {
        id: 'module-backend-2',
        color: ModuleColor.BACKEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      // Give both players another module of the same color as the swap target
      const hostExtraModule = {
        id: 'module-frontend-host',
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      const player2ExtraModule = {
        id: 'module-frontend-p2',
        color: ModuleColor.FRONTEND,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      hostPlayer.modules.push(hostModule as any, hostExtraModule as any);
      player2.modules.push(player2Module as any, player2ExtraModule as any);

      const architectChangeCard = {
        id: 'op-architect-1',
        type: CardType.OPERATION,
        effect: OperationEffect.ARCHITECT_CHANGE,
      };

      hostPlayer.hand.push(architectChangeCard as any);

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: architectChangeCard,
          swapPlayerIds: [hostId, player2Id],
          swapModuleIds: [hostModule.id, player2Module.id],
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      // Should throw error because both would end up with duplicate Frontend modules
      expect(() => gameManager.processAction(roomCode, playAction)).toThrow(
        'Cannot swap: would create duplicate module colors'
      );
    });
  });

  describe('Recruit Ace Operation', () => {
    test('should steal non-stabilized module from opponent', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Give player2 a module to steal
      const targetModule = {
        id: 'module-mobile-1',
        name: { es: 'Módulo Mobile', en: 'Mobile Module' },
        type: CardType.MODULE,
        color: ModuleColor.MOBILE,
        state: ModuleState.FREE,
        bugs: [],
        patches: [],
        isStabilized: false,
      };

      player2.modules.push(targetModule as any);

      const recruitAceCard = {
        id: 'op-recruit-1',
        name: { es: 'Reclutamiento del Groso', en: 'Recruit Ace' },
        type: CardType.OPERATION,
        effect: OperationEffect.RECRUIT_ACE,
      };

      hostPlayer.hand.push(recruitAceCard as any);

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: recruitAceCard,
          targetPlayerId: player2Id,
          targetModuleId: targetModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, playAction);
      const updatedHost = result.players.find(p => p.id === hostId)!;
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;

      // Module should be stolen
      expect(updatedHost.modules).toHaveLength(1);
      expect(updatedHost.modules[0].id).toBe(targetModule.id);
      expect(updatedPlayer2.modules).toHaveLength(0);
    });

    test('should prevent stealing stabilized modules', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Give player2 a stabilized module
      const stabilizedModule = {
        id: 'module-stable-1',
        type: CardType.MODULE,
        color: ModuleColor.DATA_SCIENCE,
        state: ModuleState.STABILIZED,
        bugs: [],
        patches: [],
        isStabilized: true,
      };

      player2.modules.push(stabilizedModule as any);

      const recruitAceCard = {
        id: 'op-recruit-1',
        type: CardType.OPERATION,
        effect: OperationEffect.RECRUIT_ACE,
      };

      hostPlayer.hand.push(recruitAceCard as any);

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: recruitAceCard,
          targetPlayerId: player2Id,
          targetModuleId: stabilizedModule.id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, playAction)).toThrow(
        'Cannot steal stabilized modules'
      );
    });
  });

  describe('End Year Party Operation', () => {
    test('should make all other players discard and skip turns', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;
      const player3 = gameState.players.find(p => p.id === player3Id)!;

      const endYearPartyCard = {
        id: 'op-party-1',
        name: { es: 'Fiesta de Fin de Año', en: 'End Year Party' },
        type: CardType.OPERATION,
        effect: OperationEffect.END_YEAR_PARTY,
      };

      hostPlayer.hand.push(endYearPartyCard as any);

      // Record initial hand sizes
      const initialPlayer2HandSize = player2.hand.length;
      const initialPlayer3HandSize = player3.hand.length;
      const initialDiscardPileSize = gameState.discardPile.length;

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: endYearPartyCard,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, playAction);
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;
      const updatedPlayer3 = result.players.find(p => p.id === player3Id)!;

      // All other players should have discarded their hands
      expect(updatedPlayer2.hand).toHaveLength(0);
      expect(updatedPlayer3.hand).toHaveLength(0);

      // Cards should be in discard pile
      expect(result.discardPile.length).toBe(
        initialDiscardPileSize +
          initialPlayer2HandSize +
          initialPlayer3HandSize +
          1 // +1 for the operation card
      );

      // Players should have skip turns
      expect(updatedPlayer2.skippedTurns).toBe(1);
      expect(updatedPlayer3.skippedTurns).toBe(1);
    });
  });

  describe('Project Swap Operation', () => {
    test('should swap entire project areas between players', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Set up different modules for both players
      const hostModules = [
        {
          id: 'host-backend',
          color: ModuleColor.BACKEND,
          state: ModuleState.FREE,
          bugs: [],
          patches: [],
          isStabilized: false,
        },
        {
          id: 'host-frontend',
          color: ModuleColor.FRONTEND,
          state: ModuleState.PATCHED,
          bugs: [],
          patches: [{ id: 'patch-1' }],
          isStabilized: false,
        },
      ];

      const player2Modules = [
        {
          id: 'p2-mobile',
          color: ModuleColor.MOBILE,
          state: ModuleState.STABILIZED,
          bugs: [],
          patches: [{ id: 'patch-2' }, { id: 'patch-3' }],
          isStabilized: true,
        },
      ];

      hostPlayer.modules = hostModules as any;
      player2.modules = player2Modules as any;

      const projectSwapCard = {
        id: 'op-swap-1',
        name: { es: 'Project Swap', en: 'Project Swap' },
        type: CardType.OPERATION,
        effect: OperationEffect.PROJECT_SWAP,
      };

      hostPlayer.hand.push(projectSwapCard as any);

      const playAction = {
        type: ActionType.PLAY_CARD,
        playerId: hostId,
        data: {
          card: projectSwapCard,
          targetPlayerId: player2Id,
        } as PlayCardActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, playAction);
      const updatedHost = result.players.find(p => p.id === hostId)!;
      const updatedPlayer2 = result.players.find(p => p.id === player2Id)!;

      // Projects should be completely swapped
      expect(updatedHost.modules).toHaveLength(1);
      expect(updatedHost.modules[0].id).toBe('p2-mobile');

      expect(updatedPlayer2.modules).toHaveLength(2);
      expect(updatedPlayer2.modules.map(m => m.id)).toContain('host-backend');
      expect(updatedPlayer2.modules.map(m => m.id)).toContain('host-frontend');
    });
  });
});
