import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OperationModal } from '../../components/game/OperationModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'operations.selectModuleToSteal': 'Selecciona módulo para robar',
        'operations.noValidModulesToSteal': 'No hay módulos válidos para robar',
        'operations.selectFirstModule': 'Selecciona primer módulo',
        'operations.firstModuleSelected': 'Primer módulo seleccionado:',
        'operations.confirm': 'Confirmar',
        'operations.cancel': 'Cancelar',
        'cards.colors.backend': 'Backend',
        'cards.states.active': 'Activo',
      };
      return translations[key] || key;
    },
  }),
}));

const createMockGameState = () => ({
  players: [
    {
      id: 'player1',
      nickname: 'CurrentPlayer',
      modules: [
        {
          id: 'module1',
          name: { es: 'Backend API', en: 'Backend API' },
          color: 'backend',
          state: 'active',
          isStabilized: false,
        },
      ],
    },
    {
      id: 'player2',
      nickname: 'OtherPlayer',
      modules: [
        {
          id: 'module2',
          name: { es: 'Frontend App', en: 'Frontend App' },
          color: 'frontend',
          state: 'active',
          isStabilized: false,
        },
      ],
    },
  ],
  language: 'es',
  currentPlayerIndex: 0,
  turn: 1,
  deck: [],
  discardPile: [],
});

const createMockOperationCard = (effect: string) => ({
  id: 'op-card-1',
  name: { es: 'Operación Test', en: 'Test Operation' },
  description: { es: 'Descripción', en: 'Description' },
  type: 'operation',
  effect,
});

describe('OperationModal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const gameState = createMockGameState();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when closed', () => {
      render(
        <OperationModal
          isOpen={false}
          operationCard={null}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText('Selecciona módulo para robar')).not.toBeInTheDocument();
    });

    it('should not render when no operation card', () => {
      render(
        <OperationModal
          isOpen={true}
          operationCard={null}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText('Selecciona módulo para robar')).not.toBeInTheDocument();
    });
  });

  describe('Recruit Ace Operation', () => {
    it('should render recruit ace interface', () => {
      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Selecciona módulo para robar')).toBeInTheDocument();
      expect(screen.getByText('OtherPlayer')).toBeInTheDocument();
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
    });

    it('should handle module selection for recruit ace', () => {
      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const moduleButton = screen.getByText('Frontend App');
      fireEvent.click(moduleButton);

      // The button should be selected (visual feedback)
      expect(moduleButton.closest('button')).toHaveClass('ring-2', 'ring-blue-500');
    });

    it('should show no valid modules message when none available', () => {
      const gameStateNoValidModules = {
        ...gameState,
        players: [
          {
            id: 'player1',
            nickname: 'CurrentPlayer',
            modules: [
              {
                id: 'module1',
                name: { es: 'Backend API', en: 'Backend API' },
                color: 'backend',
                state: 'active',
                isStabilized: false,
              },
            ],
          },
          {
            id: 'player2',
            nickname: 'OtherPlayer',
            modules: [
              {
                id: 'module2',
                name: { es: 'Backend API 2', en: 'Backend API 2' },
                color: 'backend', // Same color as current player
                state: 'active',
                isStabilized: false,
              },
            ],
          },
        ],
      };

      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameStateNoValidModules}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('No hay módulos válidos para robar')).toBeInTheDocument();
    });
  });

  describe('Architect Change Operation', () => {
    it('should render architect change step 1', () => {
      const operationCard = createMockOperationCard('ARCHITECT_CHANGE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Selecciona primer módulo')).toBeInTheDocument();
      expect(screen.getByText('Tú')).toBeInTheDocument(); // Current player
      expect(screen.getByText('OtherPlayer')).toBeInTheDocument();
    });

    it('should progress to step 2 when first module selected', () => {
      const operationCard = createMockOperationCard('ARCHITECT_CHANGE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const firstModule = screen.getByText('Backend API');
      fireEvent.click(firstModule);

      expect(screen.getByText('Primer módulo seleccionado:')).toBeInTheDocument();
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });
  });

  describe('Unimplemented Operations', () => {
    it('should show not implemented message for unknown operations', () => {
      const operationCard = createMockOperationCard('UNKNOWN_OPERATION');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Operación no implementada')).toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should call onCancel when cancel button clicked', () => {
      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm with targets when confirm clicked', () => {
      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Select a module first
      const moduleButton = screen.getByText('Frontend App');
      fireEvent.click(moduleButton);

      // Then confirm
      const confirmButton = screen.getByText('Confirmar');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith({
        targetPlayerId: 'player2',
        targetModuleId: 'module2',
      });
    });
  });

  describe('State Management', () => {
    it('should reset selection when modal reopens', () => {
      const operationCard = createMockOperationCard('RECRUIT_ACE');
      
      const { rerender } = render(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Select a module
      const moduleButton = screen.getByText('Frontend App');
      fireEvent.click(moduleButton);

      // Close modal
      rerender(
        <OperationModal
          isOpen={false}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Reopen modal
      rerender(
        <OperationModal
          isOpen={true}
          operationCard={operationCard as any}
          gameState={gameState}
          currentPlayerId="player1"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Selection should be reset
      const moduleButtonAgain = screen.getByText('Frontend App');
      expect(moduleButtonAgain.closest('button')).not.toHaveClass('ring-2', 'ring-blue-500');
    });
  });
}); 