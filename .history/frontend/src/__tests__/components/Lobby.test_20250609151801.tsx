import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Lobby from '../../components/lobby/Lobby';
import gameSlice from '../../store/gameSlice';

// Mock useGameSocket hook
const mockCreateRoom = jest.fn();
const mockJoinRoom = jest.fn();
const mockSocket = {
  connected: true,
  id: 'test-socket-id'
};

jest.mock('../../hooks/useGameSocket', () => ({
  useGameSocket: () => ({
    createRoom: mockCreateRoom,
    joinRoom: mockJoinRoom,
    socket: mockSocket,
    loading: false,
    error: null
  })
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, any> = {
        'ui.lobby.title': 'TeraDeck Online',
        'ui.lobby.subtitle': 'Juego de cartas multijugador',
        'ui.lobby.instructions': [
          'Crea una sala para comenzar',
          'Invita a otros jugadores',
          'Personaliza la cantidad de oponentes IA'
        ],
        'ui.lobby.createRoom': 'Crear Sala',
        'ui.lobby.joinRoom': 'Unirse a Sala',
        'ui.lobby.nickname': 'Tu nombre',
        'ui.lobby.roomCode': 'Código de sala',
        'ui.lobby.aiOpponents': 'Número de oponentes',
        'ui.lobby.create': 'Crear',
        'ui.lobby.join': 'Unirse'
      };
      return translations[key] || key;
    }
  })
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameSlice.reducer
    },
    preloadedState: {
      game: {
        currentRoom: null,
        currentPlayer: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Lobby Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render lobby title and subtitle', () => {
      renderWithProviders(<Lobby />);
      
      expect(screen.getByText('TeraDeck Online')).toBeInTheDocument();
      expect(screen.getByText('Juego de cartas multijugador')).toBeInTheDocument();
    });

    it('should render instructions list', () => {
      renderWithProviders(<Lobby />);
      
      expect(screen.getByText('Crea una sala para comenzar')).toBeInTheDocument();
      expect(screen.getByText('Invita a otros jugadores')).toBeInTheDocument();
      expect(screen.getByText('Personaliza la cantidad de oponentes IA')).toBeInTheDocument();
    });

    it('should render create room and join room buttons', () => {
      renderWithProviders(<Lobby />);
      
      expect(screen.getByText('Crear Sala')).toBeInTheDocument();
      expect(screen.getByText('Unirse a Sala')).toBeInTheDocument();
    });
  });

  describe('Create Room Flow', () => {
    it('should show create room form when create button is clicked', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      
      expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
      expect(screen.getByText('Número de oponentes')).toBeInTheDocument();
      expect(screen.getByText('Crear')).toBeInTheDocument();
    });

    it('should handle nickname input', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      
      const nicknameInput = screen.getByPlaceholderText('Tu nombre') as HTMLInputElement;
      fireEvent.change(nicknameInput, { target: { value: 'TestPlayer' } });
      
      expect(nicknameInput.value).toBe('TestPlayer');
    });

    it('should handle AI opponents selection', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      
      const aiSelect = screen.getByDisplayValue('1');
      fireEvent.change(aiSelect, { target: { value: '3' } });
      
      expect((aiSelect as HTMLSelectElement).value).toBe('3');
    });

    it('should call createRoom when form is submitted', async () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      
      const nicknameInput = screen.getByPlaceholderText('Tu nombre');
      fireEvent.change(nicknameInput, { target: { value: 'TestPlayer' } });
      
      const aiSelect = screen.getByDisplayValue('1');
      fireEvent.change(aiSelect, { target: { value: '2' } });
      
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledWith({
          nickname: 'TestPlayer',
          maxPlayers: 4,
          aiOpponents: 2
        });
      });
    });

    it('should not submit form with empty nickname', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      fireEvent.click(screen.getByText('Crear'));
      
      expect(mockCreateRoom).not.toHaveBeenCalled();
    });
  });

  describe('Join Room Flow', () => {
    it('should show join room form when join button is clicked', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Unirse a Sala'));
      
      expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Código de sala')).toBeInTheDocument();
      expect(screen.getByText('Unirse')).toBeInTheDocument();
    });

    it('should handle room code input', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Unirse a Sala'));
      
      const roomCodeInput = screen.getByPlaceholderText('Código de sala') as HTMLInputElement;
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      
      expect(roomCodeInput.value).toBe('ABC123');
    });

    it('should call joinRoom when form is submitted', async () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Unirse a Sala'));
      
      const nicknameInput = screen.getByPlaceholderText('Tu nombre');
      fireEvent.change(nicknameInput, { target: { value: 'JoinPlayer' } });
      
      const roomCodeInput = screen.getByPlaceholderText('Código de sala');
      fireEvent.change(roomCodeInput, { target: { value: 'ROOM123' } });
      
      fireEvent.click(screen.getByText('Unirse'));
      
      await waitFor(() => {
        expect(mockJoinRoom).toHaveBeenCalledWith({
          nickname: 'JoinPlayer',
          roomCode: 'ROOM123'
        });
      });
    });

    it('should not submit form with missing fields', () => {
      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Unirse a Sala'));
      
      // Try to submit with empty nickname
      const roomCodeInput = screen.getByPlaceholderText('Código de sala');
      fireEvent.change(roomCodeInput, { target: { value: 'ROOM123' } });
      fireEvent.click(screen.getByText('Unirse'));
      
      expect(mockJoinRoom).not.toHaveBeenCalled();
      
      // Try to submit with empty room code
      const nicknameInput = screen.getByPlaceholderText('Tu nombre');
      fireEvent.change(nicknameInput, { target: { value: 'JoinPlayer' } });
      fireEvent.change(roomCodeInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('Unirse'));
      
      expect(mockJoinRoom).not.toHaveBeenCalled();
    });
  });

  describe('Form Switching', () => {
    it('should switch between create and join forms', () => {
      renderWithProviders(<Lobby />);
      
      // Start with create form
      fireEvent.click(screen.getByText('Crear Sala'));
      expect(screen.getByText('Crear')).toBeInTheDocument();
      
      // Switch to join form
      fireEvent.click(screen.getByText('Unirse a Sala'));
      expect(screen.getByText('Unirse')).toBeInTheDocument();
      expect(screen.queryByText('Crear')).not.toBeInTheDocument();
      
      // Switch back to create form
      fireEvent.click(screen.getByText('Crear Sala'));
      expect(screen.getByText('Crear')).toBeInTheDocument();
      expect(screen.queryByText('Unirse')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during room creation', () => {
      // Mock loading state
      jest.doMock('../../hooks/useGameSocket', () => ({
        useGameSocket: () => ({
          createRoom: mockCreateRoom,
          joinRoom: mockJoinRoom,
          socket: mockSocket,
          loading: true,
          error: null
        })
      }));

      renderWithProviders(<Lobby />);
      
      fireEvent.click(screen.getByText('Crear Sala'));
      
      const createButton = screen.getByText('Crear');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', () => {
      const errorMessage = 'Failed to create room';
      
      // Mock error state
      jest.doMock('../../hooks/useGameSocket', () => ({
        useGameSocket: () => ({
          createRoom: mockCreateRoom,
          joinRoom: mockJoinRoom,
          socket: mockSocket,
          loading: false,
          error: errorMessage
        })
      }));

      renderWithProviders(<Lobby />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
}); 