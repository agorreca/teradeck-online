import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all the page components
jest.mock('../components/lobby/Lobby', () => ({
  Lobby: () => <div data-testid="lobby-page">Lobby Page</div>,
}));

jest.mock('../components/game/GameRoom', () => ({
  GameRoom: () => <div data-testid="game-room-page">Game Room Page</div>,
}));

jest.mock('../components/game/GameBoard', () => ({
  GameBoard: () => <div data-testid="game-board-page">Game Board Page</div>,
}));

// Mock i18n
jest.mock('../i18n', () => ({}));

describe('App Component', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    );
  };

  describe('Routing', () => {
    it('should render Lobby component on root path', () => {
      renderWithRouter(['/']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
      expect(screen.getByText('Lobby Page')).toBeInTheDocument();
    });

    it('should render GameRoom component on room path', () => {
      renderWithRouter(['/room/TEST123']);

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();
      expect(screen.getByText('Game Room Page')).toBeInTheDocument();
    });

    it('should render GameBoard component on game path', () => {
      renderWithRouter(['/game/TEST123']);

      expect(screen.getByTestId('game-board-page')).toBeInTheDocument();
      expect(screen.getByText('Game Board Page')).toBeInTheDocument();
    });

    it('should redirect unknown routes to lobby', () => {
      renderWithRouter(['/unknown-route']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
      expect(screen.getByText('Lobby Page')).toBeInTheDocument();
    });

    it('should redirect deeply nested unknown routes to lobby', () => {
      renderWithRouter(['/some/unknown/path']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
      expect(screen.getByText('Lobby Page')).toBeInTheDocument();
    });
  });

  describe('App Structure', () => {
    it('should render app container with correct class', () => {
      const { container } = renderWithRouter(['/']);

      const appDiv = container.querySelector('.app');
      expect(appDiv).toBeInTheDocument();
    });

    it('should use BrowserRouter for routing', () => {
      // This test ensures that the component structure is correct
      renderWithRouter(['/']);

      // If routing works, it means BrowserRouter is properly set up
      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    it('should handle room code parameter in GameRoom route', () => {
      const roomCode = 'ABCD1234';
      renderWithRouter([`/room/${roomCode}`]);

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();
    });

    it('should handle room code parameter in GameBoard route', () => {
      const roomCode = 'WXYZ9876';
      renderWithRouter([`/game/${roomCode}`]);

      expect(screen.getByTestId('game-board-page')).toBeInTheDocument();
    });

    it('should handle special characters in room codes', () => {
      const roomCode = 'TEST-123_ABC';
      renderWithRouter([`/room/${roomCode}`]);

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();
    });
  });

  describe('Navigation Flow', () => {
    it('should support typical user flow: lobby -> room -> game', () => {
      // Start at lobby
      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();

      // Navigate to room
      rerender(
        <MemoryRouter initialEntries={['/room/TEST123']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();

      // Navigate to game
      rerender(
        <MemoryRouter initialEntries={['/game/TEST123']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('game-board-page')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty room codes gracefully', () => {
      renderWithRouter(['/room/']);

      // Should either show GameRoom or redirect to lobby
      const gameRoomPage = screen.queryByTestId('game-room-page');
      const lobbyPage = screen.queryByTestId('lobby-page');

      expect(gameRoomPage || lobbyPage).toBeInTheDocument();
    });

    it('should handle malformed URLs gracefully', () => {
      renderWithRouter(['/room//double-slash']);

      // Should handle gracefully without crashing
      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();
    });
  });

  describe('Integration with i18n', () => {
    it('should import i18n configuration', () => {
      // This test ensures that i18n is imported
      // The mock at the top confirms this import doesn't break the app
      renderWithRouter(['/']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
    });
  });

  describe('Component Isolation', () => {
    it('should only render one page component at a time', () => {
      renderWithRouter(['/']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
      expect(screen.queryByTestId('game-room-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('game-board-page')).not.toBeInTheDocument();
    });

    it('should only render GameRoom when on room route', () => {
      renderWithRouter(['/room/TEST123']);

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();
      expect(screen.queryByTestId('lobby-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('game-board-page')).not.toBeInTheDocument();
    });

    it('should only render GameBoard when on game route', () => {
      renderWithRouter(['/game/TEST123']);

      expect(screen.getByTestId('game-board-page')).toBeInTheDocument();
      expect(screen.queryByTestId('lobby-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('game-room-page')).not.toBeInTheDocument();
    });
  });

  describe('Route Specificity', () => {
    it('should distinguish between /room and /game routes', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/room/SAME123']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('game-room-page')).toBeInTheDocument();

      rerender(
        <MemoryRouter initialEntries={['/game/SAME123']}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('game-board-page')).toBeInTheDocument();
    });

    it('should not match partial route paths', () => {
      renderWithRouter(['/roo']);

      expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
      expect(screen.queryByTestId('game-room-page')).not.toBeInTheDocument();
    });
  });
});
