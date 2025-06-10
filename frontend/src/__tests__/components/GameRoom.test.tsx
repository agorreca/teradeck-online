import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import GameRoom from '../../components/game/GameRoom';
import gameSlice from '../../store/gameSlice';

// Mock useGameSocket hook
const mockStartGame = jest.fn();
const mockLeaveRoom = jest.fn();
const mockGetRoomState = jest.fn();
const mockSocket = {
  connected: true,
  id: 'test-socket-id',
};

jest.mock('../../hooks/useGameSocket', () => ({
  useGameSocket: () => ({
    startGame: mockStartGame,
    leaveRoom: mockLeaveRoom,
    getRoomState: mockGetRoomState,
    socket: mockSocket,
    loading: false,
    error: null,
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ roomCode: 'TEST123' }),
}));

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, any> = {
        'ui.gameRoom.title': 'Sala de Juego',
        'ui.gameRoom.roomCode': 'Código de sala',
        'ui.gameRoom.players': 'Jugadores',
        'ui.gameRoom.aiOpponents': 'Oponentes IA',
        'ui.gameRoom.waiting':
          'Esperando al anfitrión para comenzar el juego...',
        'ui.gameRoom.startGame': 'Iniciar Juego',
        'ui.gameRoom.leaveRoom': 'Salir de la Sala',
        'ui.gameRoom.host': 'Anfitrión',
        'ui.gameRoom.you': 'Tú',
        'ui.gameRoom.aiPlayer': 'IA {{number}}',
      };
      return translations[key] || key;
    },
  }),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameSlice.reducer,
    },
    preloadedState: {
      game: {
        currentRoom: null,
        currentPlayer: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

const mockRoom = {
  code: 'TEST123',
  players: [
    { id: 'player1', nickname: 'Host', isHost: true },
    { id: 'test-socket-id', nickname: 'TestPlayer', isHost: false },
  ],
  maxPlayers: 4,
  aiOpponents: 2,
  status: 'waiting' as const,
};

const mockCurrentPlayer = {
  id: 'test-socket-id',
  nickname: 'TestPlayer',
  isHost: false,
};

describe('GameRoom Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render room information', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.getByText('Sala de Juego')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    it('should render player list', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.getByText('Host')).toBeInTheDocument();
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      expect(screen.getByText('Anfitrión')).toBeInTheDocument();
      expect(screen.getByText('Tú')).toBeInTheDocument();
    });

    it('should render AI opponents', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.getByText('IA 1')).toBeInTheDocument();
      expect(screen.getByText('IA 2')).toBeInTheDocument();
    });

    it('should show waiting message for non-host players', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      expect(
        screen.getByText('Esperando al anfitrión para comenzar el juego...')
      ).toBeInTheDocument();
    });

    it('should show start game button for host', () => {
      const hostPlayer = { ...mockCurrentPlayer, id: 'player1', isHost: true };

      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: hostPlayer,
      });

      expect(screen.getByText('Iniciar Juego')).toBeInTheDocument();
      expect(
        screen.queryByText('Esperando al anfitrión para comenzar el juego...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Game Actions', () => {
    it('should call startGame when host clicks start button', async () => {
      const hostPlayer = { ...mockCurrentPlayer, id: 'player1', isHost: true };

      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: hostPlayer,
      });

      fireEvent.click(screen.getByText('Iniciar Juego'));

      await waitFor(() => {
        expect(mockStartGame).toHaveBeenCalledWith('TEST123');
      });
    });

    it('should call leaveRoom when leave button is clicked', async () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      fireEvent.click(screen.getByText('Salir de la Sala'));

      await waitFor(() => {
        expect(mockLeaveRoom).toHaveBeenCalledWith('TEST123');
      });
    });

    it('should navigate to lobby when leaving room', async () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      fireEvent.click(screen.getByText('Salir de la Sala'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Room State Management', () => {
    it('should call getRoomState on component mount', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: null,
        currentPlayer: null,
      });

      expect(mockGetRoomState).toHaveBeenCalledWith('TEST123');
    });

    it('should handle empty room state', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: null,
        currentPlayer: null,
      });

      expect(screen.getByText('Cargando sala...')).toBeInTheDocument();
    });
  });

  describe('Player Status Display', () => {
    it('should correctly identify host player', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      const hostElement = screen.getByText('Host').closest('.player-item');
      expect(hostElement).toHaveClass('host');
    });

    it('should correctly identify current player', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
      });

      const currentPlayerElement = screen
        .getByText('TestPlayer')
        .closest('.player-item');
      expect(currentPlayerElement).toHaveClass('current-player');
    });
  });

  describe('Game Status', () => {
    it('should handle playing game status', () => {
      const playingRoom = { ...mockRoom, status: 'playing' as const };

      renderWithProviders(<GameRoom />, {
        currentRoom: playingRoom,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.queryByText('Iniciar Juego')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Esperando al anfitrión para comenzar el juego...')
      ).not.toBeInTheDocument();
    });

    it('should show game controls during playing status', () => {
      const playingRoom = { ...mockRoom, status: 'playing' as const };

      renderWithProviders(<GameRoom />, {
        currentRoom: playingRoom,
        currentPlayer: mockCurrentPlayer,
      });

      // Game should be running, so game controls should be visible
      expect(screen.getByText('Juego en progreso')).toBeInTheDocument();
    });
  });

  describe('AI Opponents Display', () => {
    it('should render correct number of AI opponents', () => {
      const roomWithMoreAI = { ...mockRoom, aiOpponents: 3 };

      renderWithProviders(<GameRoom />, {
        currentRoom: roomWithMoreAI,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.getByText('IA 1')).toBeInTheDocument();
      expect(screen.getByText('IA 2')).toBeInTheDocument();
      expect(screen.getByText('IA 3')).toBeInTheDocument();
    });

    it('should handle room with no AI opponents', () => {
      const roomWithoutAI = { ...mockRoom, aiOpponents: 0 };

      renderWithProviders(<GameRoom />, {
        currentRoom: roomWithoutAI,
        currentPlayer: mockCurrentPlayer,
      });

      expect(screen.queryByText(/IA \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: mockCurrentPlayer,
        error: 'Failed to start game',
      });

      expect(screen.getByText('Failed to start game')).toBeInTheDocument();
    });

    it('should handle room not found', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: null,
        currentPlayer: null,
        error: 'Room not found',
      });

      expect(screen.getByText('Room not found')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state', () => {
      renderWithProviders(<GameRoom />, {
        currentRoom: null,
        currentPlayer: null,
        loading: true,
      });

      expect(screen.getByText('Cargando sala...')).toBeInTheDocument();
    });

    it('should disable buttons during loading', () => {
      const hostPlayer = { ...mockCurrentPlayer, id: 'player1', isHost: true };

      renderWithProviders(<GameRoom />, {
        currentRoom: mockRoom,
        currentPlayer: hostPlayer,
        loading: true,
      });

      const startButton = screen.getByText('Iniciar Juego');
      const leaveButton = screen.getByText('Salir de la Sala');

      expect(startButton).toBeDisabled();
      expect(leaveButton).toBeDisabled();
    });
  });
});
