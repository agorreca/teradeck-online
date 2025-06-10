import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  Card,
  CardType,
  GameState,
  ModuleCard,
  Player,
} from '../../../../shared/src/types/game';
import { GameBoard } from '../../components/game/GameBoard';

// Mock dependencies
const mockSocket = {
  connected: true,
  id: 'test-player-id',
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

const mockTargeting = {
  targetingState: null,
  selectedTargets: [],
  canConfirm: false,
  startTargeting: jest.fn(),
  confirmTargeting: jest.fn(),
  cancelTargeting: jest.fn(),
  selectTarget: jest.fn(),
};

jest.mock('../../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: mockSocket,
  }),
}));

jest.mock('../../hooks/useTargeting', () => ({
  useTargeting: () => mockTargeting,
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ui.game.yourTurn': 'Tu turno',
        'ui.game.waitingTurn': 'Esperando turno',
        'ui.game.handCards': 'Cartas en mano',
        'ui.cards.module': 'Módulo',
        'ui.cards.bug': 'Bug',
        'ui.cards.patch': 'Parche',
        'ui.cards.operation': 'Operación',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ roomCode: 'TEST123' }),
}));

jest.mock('../../../../shared/src/utils/targeting', () => ({
  cardRequiresTarget: jest.fn(),
}));

// Mock components
jest.mock('../../components/game/TargetingOverlay', () => ({
  TargetingOverlay: ({ onConfirm, onCancel }: any) => (
    <div data-testid="targeting-overlay">
      <button onClick={onConfirm} data-testid="confirm-targeting">
        Confirmar
      </button>
      <button onClick={onCancel} data-testid="cancel-targeting">
        Cancelar
      </button>
    </div>
  ),
}));

const createMockGameState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultPlayer: Player = {
    id: 'test-player-id',
    nickname: 'TestPlayer',
    hand: [
      {
        id: 'card1',
        name: { es: 'Carta de Prueba', en: 'Test Card' },
        description: { es: 'Descripción de prueba', en: 'Test description' },
        type: CardType.OPERATION,
        color: undefined,
      },
      {
        id: 'card2',
        name: { es: 'Módulo Frontend', en: 'Frontend Module' },
        description: { es: 'Módulo de frontend', en: 'Frontend module' },
        type: CardType.MODULE,
        color: 'frontend',
      },
    ],
    modules: [
      {
        id: 'module1',
        name: { es: 'Backend API', en: 'Backend API' },
        description: { es: 'API del backend', en: 'Backend API' },
        type: CardType.MODULE,
        color: 'backend',
        state: 'active',
        bugs: [],
        patches: [],
      } as ModuleCard,
    ],
    isHost: true,
  };

  const otherPlayer: Player = {
    id: 'other-player-id',
    nickname: 'OtherPlayer',
    hand: [{ id: 'other-card', type: CardType.OPERATION } as Card],
    modules: [],
    isHost: false,
  };

  return {
    players: [defaultPlayer, otherPlayer],
    currentPlayerIndex: 0,
    turn: 1,
    deck: [
      { id: 'deck-card1', type: CardType.BUG } as Card,
      { id: 'deck-card2', type: CardType.PATCH } as Card,
    ],
    discardPile: [
      {
        id: 'discard1',
        name: { es: 'Carta Descartada', en: 'Discarded Card' },
        type: CardType.OPERATION,
      } as Card,
    ],
    language: 'es',
    ...overrides,
  };
};

const renderGameBoard = (gameState?: GameState) => {
  // Mock socket event handlers
  const mockHandlers: Record<string, Function> = {};
  mockSocket.on.mockImplementation((event: string, handler: Function) => {
    mockHandlers[event] = handler;
  });

  const result = render(
    <BrowserRouter>
      <GameBoard />
    </BrowserRouter>
  );

  // Simulate receiving game state if provided
  if (gameState) {
    const handleRoomState = mockHandlers['room-state'];
    if (handleRoomState) {
      handleRoomState(gameState);
    }
  }

  return result;
};

describe('GameBoard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading screen when no game state', () => {
    render(
      <BrowserRouter>
        <GameBoard />
      </BrowserRouter>
    );

    expect(screen.getByText('🎴 Cargando partida...')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
  });

  it('should register socket event listeners', () => {
    render(
      <BrowserRouter>
        <GameBoard />
      </BrowserRouter>
    );

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('game-updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('room-state', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  describe('Loading State', () => {
    it('should show loading screen when no game state', () => {
      renderGameBoard();

      expect(screen.getByText('🎴 Cargando partida...')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
      expect(
        screen.getByText('Conectado - Obteniendo datos del juego...')
      ).toBeInTheDocument();
    });

    it('should show connection status when socket disconnected', () => {
      mockSocket.connected = false;
      renderGameBoard();

      expect(screen.getByText('Estableciendo conexión...')).toBeInTheDocument();
    });
  });

  describe('Socket Connection', () => {
    it('should register socket event listeners', () => {
      renderGameBoard();

      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'game-updated',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'room-state',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should emit get-room-state when connected', () => {
      mockSocket.connected = true;
      renderGameBoard();

      expect(mockSocket.emit).toHaveBeenCalledWith('get-room-state', 'TEST123');
    });

    it('should clean up socket listeners on unmount', () => {
      const { unmount } = renderGameBoard();

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith(
        'game-updated',
        expect.any(Function)
      );
      expect(mockSocket.off).toHaveBeenCalledWith(
        'room-state',
        expect.any(Function)
      );
      expect(mockSocket.off).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
  });

  describe('Game State Display', () => {
    it('should render game header with room code', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('🎴 TeraDeck Online')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    it('should show current turn indicator for active player', () => {
      const gameState = createMockGameState({ currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      expect(screen.getByText('Tu turno')).toBeInTheDocument();
    });

    it('should show waiting indicator for non-active player', () => {
      const gameState = createMockGameState({ currentPlayerIndex: 1 });
      renderGameBoard(gameState);

      expect(screen.getByText('Esperando turno')).toBeInTheDocument();
    });

    it('should display turn number and current player', () => {
      const gameState = createMockGameState({ turn: 5, currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      expect(screen.getByText('Turno 5')).toBeInTheDocument();
      expect(
        screen.getByText('Jugador actual: TestPlayer')
      ).toBeInTheDocument();
    });
  });

  describe('Deck and Discard Pile', () => {
    it('should display deck with correct card count', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('Mazo')).toBeInTheDocument();
      expect(screen.getByText('2 cartas')).toBeInTheDocument();
    });

    it('should display discard pile with top card', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('Pila de Descarte')).toBeInTheDocument();
      expect(screen.getByText('Carta Descartada')).toBeInTheDocument();
      expect(screen.getByText('1 cartas')).toBeInTheDocument();
    });

    it('should show empty discard pile when no cards', () => {
      const gameState = createMockGameState({ discardPile: [] });
      renderGameBoard(gameState);

      expect(screen.getByText('Vacía')).toBeInTheDocument();
      expect(screen.getByText('0 cartas')).toBeInTheDocument();
    });
  });

  describe('Player Areas', () => {
    it('should display other players with card count', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('Otros Jugadores')).toBeInTheDocument();
      expect(screen.getByText('OtherPlayer')).toBeInTheDocument();
      expect(screen.getByText('1 cartas')).toBeInTheDocument();
    });

    it('should display current player modules', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('Tus Módulos (1/4)')).toBeInTheDocument();
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });

    it('should display current player hand cards', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByText('Cartas en mano (2)')).toBeInTheDocument();
      expect(screen.getByText('Carta de Prueba')).toBeInTheDocument();
      expect(screen.getByText('Módulo Frontend')).toBeInTheDocument();
    });
  });

  describe('Card Interaction', () => {
    it('should handle card play when it is player turn', () => {
      const {
        cardRequiresTarget,
      } = require('../../../../shared/src/utils/targeting');
      cardRequiresTarget.mockReturnValue(false);

      const gameState = createMockGameState({ currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      const card = screen.getByText('Carta de Prueba');
      fireEvent.click(card);

      expect(mockSocket.emit).toHaveBeenCalledWith('game-action', {
        type: 'PLAY_CARD',
        playerId: 'test-player-id',
        data: {
          card: expect.objectContaining({ id: 'card1' }),
          targetPlayerId: undefined,
          targetModuleId: undefined,
        },
        timestamp: expect.any(Number),
      });
    });

    it('should start targeting when card requires target', () => {
      const {
        cardRequiresTarget,
      } = require('../../../../shared/src/utils/targeting');
      cardRequiresTarget.mockReturnValue(true);

      const gameState = createMockGameState({ currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      const card = screen.getByText('Carta de Prueba');
      fireEvent.click(card);

      expect(mockTargeting.startTargeting).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'card1' }),
        gameState,
        'test-player-id'
      );
    });

    it('should not allow card play when not player turn', () => {
      const gameState = createMockGameState({ currentPlayerIndex: 1 });
      renderGameBoard(gameState);

      const card = screen.getByText('Carta de Prueba');
      fireEvent.click(card);

      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'game-action',
        expect.any(Object)
      );
    });
  });

  describe('Targeting System', () => {
    it('should render targeting overlay', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      expect(screen.getByTestId('targeting-overlay')).toBeInTheDocument();
    });

    it('should handle targeting confirmation', () => {
      const {
        cardRequiresTarget,
      } = require('../../../../shared/src/utils/targeting');
      cardRequiresTarget.mockReturnValue(true);
      mockTargeting.canConfirm = true;
      mockTargeting.confirmTargeting.mockReturnValue(true);
      mockTargeting.selectedTargets = [{ playerId: 'target-player' }];

      const gameState = createMockGameState({ currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      // Start targeting
      const card = screen.getByText('Carta de Prueba');
      fireEvent.click(card);

      // Confirm targeting
      const confirmButton = screen.getByTestId('confirm-targeting');
      fireEvent.click(confirmButton);

      expect(mockTargeting.confirmTargeting).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'game-action',
        expect.objectContaining({
          data: expect.objectContaining({
            targetPlayerId: 'target-player',
          }),
        })
      );
    });

    it('should handle targeting cancellation', () => {
      const {
        cardRequiresTarget,
      } = require('../../../../shared/src/utils/targeting');
      cardRequiresTarget.mockReturnValue(true);

      const gameState = createMockGameState({ currentPlayerIndex: 0 });
      renderGameBoard(gameState);

      // Start targeting
      const card = screen.getByText('Carta de Prueba');
      fireEvent.click(card);

      // Cancel targeting
      const cancelButton = screen.getByTestId('cancel-targeting');
      fireEvent.click(cancelButton);

      expect(mockTargeting.cancelTargeting).toHaveBeenCalled();
    });
  });

  describe('Module States', () => {
    it('should display module with bugs', () => {
      const moduleWithBugs: ModuleCard = {
        id: 'module-bugs',
        name: { es: 'Módulo con Bugs', en: 'Module with Bugs' },
        description: { es: 'Un módulo con bugs', en: 'A module with bugs' },
        type: CardType.MODULE,
        color: 'backend',
        state: 'active',
        bugs: [{ id: 'bug1' } as any, { id: 'bug2' } as any],
        patches: [],
      };

      const gameState = createMockGameState({
        players: [
          {
            ...createMockGameState().players[0],
            modules: [moduleWithBugs],
          },
          createMockGameState().players[1],
        ],
      });

      renderGameBoard(gameState);

      expect(screen.getByText('🐛 2 bugs')).toBeInTheDocument();
    });

    it('should display module with patches', () => {
      const moduleWithPatches: ModuleCard = {
        id: 'module-patches',
        name: { es: 'Módulo con Parches', en: 'Module with Patches' },
        description: {
          es: 'Un módulo con parches',
          en: 'A module with patches',
        },
        type: CardType.MODULE,
        color: 'frontend',
        state: 'active',
        bugs: [],
        patches: [{ id: 'patch1' } as any],
      };

      const gameState = createMockGameState({
        players: [
          {
            ...createMockGameState().players[0],
            modules: [moduleWithPatches],
          },
          createMockGameState().players[1],
        ],
      });

      renderGameBoard(gameState);

      expect(screen.getByText('🔧 1 parche')).toBeInTheDocument();
    });
  });

  describe('Game State Updates', () => {
    it('should update state when receiving game-updated event', () => {
      renderGameBoard();

      const newGameState = createMockGameState({ turn: 10 });
      const mockHandlers: Record<string, Function> = {};
      mockSocket.on.mockImplementation((event: string, handler: Function) => {
        mockHandlers[event] = handler;
      });

      // Simulate game-updated event
      const handleGameUpdated = mockHandlers['game-updated'];
      if (handleGameUpdated) {
        handleGameUpdated(newGameState);
      }

      expect(screen.getByText('Turno 10')).toBeInTheDocument();
    });

    it('should handle game errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      renderGameBoard();

      const mockHandlers: Record<string, Function> = {};
      mockSocket.on.mockImplementation((event: string, handler: Function) => {
        mockHandlers[event] = handler;
      });

      // Simulate error event
      const handleGameError = mockHandlers['error'];
      if (handleGameError) {
        handleGameError('Test error');
      }

      expect(consoleSpy).toHaveBeenCalledWith('Game error:', 'Test error');
      consoleSpy.mockRestore();
    });
  });

  describe('Helper Functions', () => {
    it('should apply correct CSS classes for module states', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      const moduleElement = screen
        .getByText('Backend API')
        .closest('.card-module');
      expect(moduleElement).toHaveClass('state-active');
    });

    it('should apply correct CSS classes for card types', () => {
      const gameState = createMockGameState();
      renderGameBoard(gameState);

      const operationCard = screen
        .getByText('Carta de Prueba')
        .closest('.card');
      expect(operationCard).toHaveClass('card-operation');
    });
  });
});
