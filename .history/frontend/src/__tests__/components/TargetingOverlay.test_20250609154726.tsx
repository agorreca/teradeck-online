import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { TargetType } from '../../../../shared/src/types/game';
import { TargetingOverlay } from '../../components/game/TargetingOverlay';

// Mock dependencies
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'targeting.players': 'Jugadores',
        'targeting.modules': 'Módulos',
        'targeting.player': 'Jugador',
        'targeting.module': 'Módulo',
        'targeting.selectTarget': 'Seleccionar objetivo',
        'targeting.selectTargets': 'Seleccionar objetivos',
        'targeting.noValidTargets': 'No hay objetivos válidos',
        'targeting.cancelTargeting': 'Cancelar',
        'targeting.confirmTarget': 'Confirmar objetivo',
        'targeting.targetInstructions.bug':
          'Selecciona un módulo enemigo para infectar',
        'targeting.targetInstructions.patch':
          'Selecciona un módulo propio para reparar',
        'targeting.targetInstructions.operation':
          'Selecciona objetivos para la operación',
        'targeting.targetRequired': `Se requieren ${options?.count || 1} objetivos`,
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../../../../shared/src/utils/targeting', () => ({
  getCardTargetRequirements: jest.fn(),
}));

const createMockTargetingState = (overrides = {}) => ({
  isActive: true,
  cardBeingPlayed: {
    id: 'card1',
    type: 'bug',
    name: { es: 'Bug de Prueba', en: 'Test Bug' },
    description: { es: 'Descripción', en: 'Description' },
  },
  validTargets: [
    {
      type: TargetType.ENEMY_PLAYER,
      playerId: 'player2',
      playerName: 'EnemyPlayer',
      isValid: true,
    },
    {
      type: TargetType.ENEMY_MODULE,
      playerId: 'player2',
      moduleId: 'module1',
      playerName: 'EnemyPlayer',
      moduleName: 'Frontend App',
      isValid: true,
    },
    {
      type: TargetType.ENEMY_MODULE,
      playerId: 'player3',
      moduleId: 'module2',
      playerName: 'Player3',
      moduleName: 'Backend API',
      isValid: false,
      reason: 'Módulo estabilizado',
    },
  ],
  targetType: TargetType.ENEMY_MODULE,
  requiresTarget: true,
  ...overrides,
});

const createMockGameState = () => ({
  players: [
    {
      id: 'player1',
      nickname: 'CurrentPlayer',
      modules: [],
    },
    {
      id: 'player2',
      nickname: 'EnemyPlayer',
      modules: [
        {
          id: 'module1',
          name: { es: 'Frontend App', en: 'Frontend App' },
        },
      ],
    },
    {
      id: 'player3',
      nickname: 'Player3',
      modules: [
        {
          id: 'module2',
          name: { es: 'Backend API', en: 'Backend API' },
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

describe('TargetingOverlay Component', () => {
  const mockOnTargetSelect = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    targetingState: createMockTargetingState(),
    gameState: createMockGameState(),
    currentPlayerId: 'player1',
    selectedTargets: [],
    onTargetSelect: mockOnTargetSelect,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    canConfirm: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const {
      getCardTargetRequirements,
    } = require('../../../../shared/src/utils/targeting');
    getCardTargetRequirements.mockReturnValue({
      maxTargets: 1,
      minTargets: 1,
      requiredTargets: [TargetType.ENEMY_MODULE],
    });
  });

  describe('Visibility and Rendering', () => {
    it('should not render when targeting is not active', () => {
      const props = {
        ...defaultProps,
        targetingState: { ...defaultProps.targetingState, isActive: false },
      };

      render(<TargetingOverlay {...props} />);

      expect(
        screen.queryByText('Seleccionar objetivo')
      ).not.toBeInTheDocument();
    });

    it('should not render when no card is being played', () => {
      const props = {
        ...defaultProps,
        targetingState: {
          ...defaultProps.targetingState,
          cardBeingPlayed: null,
        },
      };

      render(<TargetingOverlay {...props} />);

      expect(
        screen.queryByText('Seleccionar objetivo')
      ).not.toBeInTheDocument();
    });

    it('should render targeting modal when active', () => {
      render(<TargetingOverlay {...defaultProps} />);

      expect(screen.getByText('Seleccionar objetivo')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Confirmar objetivo')).toBeInTheDocument();
    });

    it('should show backdrop that can be clicked to cancel', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const backdrop = document.querySelector('.targeting-backdrop');
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should show close button that cancels targeting', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Target Requirements Display', () => {
    it('should show singular title for single target', () => {
      render(<TargetingOverlay {...defaultProps} />);

      expect(screen.getByText('Seleccionar objetivo')).toBeInTheDocument();
    });

    it('should show plural title for multiple targets', () => {
      const {
        getCardTargetRequirements,
      } = require('../../../../shared/src/utils/targeting');
      getCardTargetRequirements.mockReturnValue({
        maxTargets: 2,
        minTargets: 2,
      });

      render(<TargetingOverlay {...defaultProps} />);

      expect(screen.getByText('Seleccionar objetivos')).toBeInTheDocument();
    });

    it('should show target requirements when minimum targets required', () => {
      const {
        getCardTargetRequirements,
      } = require('../../../../shared/src/utils/targeting');
      getCardTargetRequirements.mockReturnValue({
        maxTargets: 2,
        minTargets: 2,
      });

      render(<TargetingOverlay {...defaultProps} />);

      expect(screen.getByText('Se requieren 2 objetivos')).toBeInTheDocument();
    });
  });

  describe('Player Targets', () => {
    it('should render player targets section', () => {
      const targetingState = createMockTargetingState({
        validTargets: [
          {
            type: TargetType.ENEMY_PLAYER,
            playerId: 'player2',
            playerName: 'EnemyPlayer',
            isValid: true,
          },
        ],
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(screen.getByText('Jugadores')).toBeInTheDocument();
      expect(screen.getByText('EnemyPlayer')).toBeInTheDocument();
      expect(screen.getByText('Jugador')).toBeInTheDocument();
    });

    it('should handle player target selection', () => {
      const targetingState = createMockTargetingState({
        validTargets: [
          {
            type: TargetType.ENEMY_PLAYER,
            playerId: 'player2',
            playerName: 'EnemyPlayer',
            isValid: true,
          },
        ],
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      const playerButton = screen.getByText('EnemyPlayer').closest('button');
      fireEvent.click(playerButton!);

      expect(mockOnTargetSelect).toHaveBeenCalledWith({
        type: TargetType.ENEMY_PLAYER,
        playerId: 'player2',
        playerName: 'EnemyPlayer',
        isValid: true,
      });
    });

    it('should show selection indicator for selected player', () => {
      const targetingState = createMockTargetingState({
        validTargets: [
          {
            type: TargetType.ENEMY_PLAYER,
            playerId: 'player2',
            playerName: 'EnemyPlayer',
            isValid: true,
          },
        ],
      });

      const props = {
        ...defaultProps,
        targetingState,
        selectedTargets: ['player2'],
      };

      render(<TargetingOverlay {...props} />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should disable invalid player targets', () => {
      const targetingState = createMockTargetingState({
        validTargets: [
          {
            type: TargetType.ENEMY_PLAYER,
            playerId: 'player2',
            playerName: 'EnemyPlayer',
            isValid: false,
            reason: 'Jugador desconectado',
          },
        ],
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      const playerButton = screen.getByText('EnemyPlayer').closest('button');
      expect(playerButton).toBeDisabled();
      expect(playerButton).toHaveAttribute('title', 'Jugador desconectado');
    });
  });

  describe('Module Targets', () => {
    it('should render module targets grouped by player', () => {
      render(<TargetingOverlay {...defaultProps} />);

      expect(screen.getByText('Módulos')).toBeInTheDocument();
      expect(screen.getByText('EnemyPlayer')).toBeInTheDocument();
      expect(screen.getByText('Player3')).toBeInTheDocument();
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });

    it('should handle module target selection', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const moduleButton = screen.getByText('Frontend App').closest('button');
      fireEvent.click(moduleButton!);

      expect(mockOnTargetSelect).toHaveBeenCalledWith({
        type: TargetType.ENEMY_MODULE,
        playerId: 'player2',
        moduleId: 'module1',
        playerName: 'EnemyPlayer',
        moduleName: 'Frontend App',
        isValid: true,
      });
    });

    it('should show selection indicator for selected module', () => {
      const props = {
        ...defaultProps,
        selectedTargets: ['module1'],
      };

      render(<TargetingOverlay {...props} />);

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(1);
    });

    it('should disable invalid module targets', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const invalidModuleButton = screen
        .getByText('Backend API')
        .closest('button');
      expect(invalidModuleButton).toBeDisabled();
      expect(invalidModuleButton).toHaveAttribute(
        'title',
        'Módulo estabilizado'
      );
    });

    it('should not render modules section when no module targets', () => {
      const targetingState = createMockTargetingState({
        validTargets: [
          {
            type: TargetType.ENEMY_PLAYER,
            playerId: 'player2',
            playerName: 'EnemyPlayer',
            isValid: true,
          },
        ],
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(screen.queryByText('Módulos')).not.toBeInTheDocument();
    });
  });

  describe('No Valid Targets', () => {
    it('should show no valid targets message when none available', () => {
      const targetingState = createMockTargetingState({
        validTargets: [],
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(screen.getByText('No hay objetivos válidos')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should handle cancel button click', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle confirm button click when can confirm', () => {
      const props = {
        ...defaultProps,
        canConfirm: true,
      };

      render(<TargetingOverlay {...props} />);

      const confirmButton = screen.getByText('Confirmar objetivo');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should disable confirm button when cannot confirm', () => {
      const props = {
        ...defaultProps,
        canConfirm: false,
      };

      render(<TargetingOverlay {...props} />);

      const confirmButton = screen.getByText('Confirmar objetivo');
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Instructions Display', () => {
    it('should show bug card instructions', () => {
      const targetingState = createMockTargetingState({
        cardBeingPlayed: {
          id: 'card1',
          type: 'bug',
          name: { es: 'Bug', en: 'Bug' },
        },
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(
        screen.getByText('Selecciona un módulo enemigo para infectar')
      ).toBeInTheDocument();
    });

    it('should show patch card instructions', () => {
      const targetingState = createMockTargetingState({
        cardBeingPlayed: {
          id: 'card1',
          type: 'patch',
          name: { es: 'Parche', en: 'Patch' },
        },
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(
        screen.getByText('Selecciona un módulo propio para reparar')
      ).toBeInTheDocument();
    });

    it('should show operation card instructions', () => {
      const targetingState = createMockTargetingState({
        cardBeingPlayed: {
          id: 'card1',
          type: 'operation',
          effect: 'RECRUIT_ACE',
          name: { es: 'Operación', en: 'Operation' },
        },
      });

      render(
        <TargetingOverlay {...defaultProps} targetingState={targetingState} />
      );

      expect(
        screen.getByText('Selecciona objetivos para la operación')
      ).toBeInTheDocument();
    });
  });

  describe('Target Selection Logic', () => {
    it('should not allow selection of invalid targets', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const invalidModuleButton = screen
        .getByText('Backend API')
        .closest('button');
      fireEvent.click(invalidModuleButton!);

      expect(mockOnTargetSelect).not.toHaveBeenCalled();
    });

    it('should show different CSS classes for selected targets', () => {
      const props = {
        ...defaultProps,
        selectedTargets: ['module1'],
      };

      render(<TargetingOverlay {...props} />);

      const selectedModule = screen.getByText('Frontend App').closest('button');
      expect(selectedModule).toHaveClass('selected');
    });

    it('should show different CSS classes for invalid targets', () => {
      render(<TargetingOverlay {...defaultProps} />);

      const invalidModule = screen.getByText('Backend API').closest('button');
      expect(invalidModule).toHaveClass('invalid');
    });
  });
});
