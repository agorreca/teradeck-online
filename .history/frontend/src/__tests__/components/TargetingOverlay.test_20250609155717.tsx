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
  getCardTargetRequirements: jest.fn(() => ({
    maxTargets: 1,
    minTargets: 1,
  })),
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
      type: 'ENEMY_PLAYER',
      playerId: 'player2',
      playerName: 'EnemyPlayer',
      isValid: true,
    },
    {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      playerName: 'EnemyPlayer',
      moduleName: 'Frontend App',
      isValid: true,
    },
    {
      type: 'ENEMY_MODULE',
      playerId: 'player3',
      moduleId: 'module2',
      playerName: 'Player3',
      moduleName: 'Backend API',
      isValid: false,
      reason: 'Módulo estabilizado',
    },
  ],
  targetType: 'ENEMY_MODULE',
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
  });

  it('should not render when targeting is not active', () => {
    const props = {
      ...defaultProps,
      targetingState: { ...defaultProps.targetingState, isActive: false },
    };

    render(<TargetingOverlay {...props} />);

    expect(screen.queryByText('Seleccionar objetivo')).not.toBeInTheDocument();
  });

  it('should render when targeting is active', () => {
    render(<TargetingOverlay {...defaultProps} />);

    expect(screen.getByText('Seleccionar objetivo')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar objetivo')).toBeInTheDocument();
  });

  it('should show backdrop that can be clicked to cancel', () => {
    render(<TargetingOverlay {...defaultProps} />);

    const backdrop = document.querySelector('.targeting-backdrop');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    }
  });

  it('should show close button that cancels targeting', () => {
    render(<TargetingOverlay {...defaultProps} />);

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should render player targets section', () => {
    const targetingState = createMockTargetingState({
      validTargets: [
        {
          type: 'ENEMY_PLAYER',
          playerId: 'player2',
          playerName: 'EnemyPlayer',
          isValid: true,
        },
      ],
    });

    render(<TargetingOverlay {...defaultProps} targetingState={targetingState} />);

    expect(screen.getByText('Jugadores')).toBeInTheDocument();
    expect(screen.getByText('Jugador')).toBeInTheDocument();
    
    // Use more specific query to avoid duplicate text issues
    const playerButtons = screen.getAllByRole('button');
    const playerButton = playerButtons.find(button => 
      button.querySelector('.player-name')?.textContent === 'EnemyPlayer'
    );
    expect(playerButton).toBeInTheDocument();
  });

  it('should handle player target selection', () => {
    const targetingState = createMockTargetingState({
      validTargets: [
        {
          type: 'ENEMY_PLAYER',
          playerId: 'player2',
          playerName: 'EnemyPlayer',
          isValid: true,
        },
      ],
    });

    render(<TargetingOverlay {...defaultProps} targetingState={targetingState} />);

    const playerButtons = screen.getAllByRole('button');
    const playerButton = playerButtons.find(button => 
      button.querySelector('.player-name')?.textContent === 'EnemyPlayer'
    );
    
    if (playerButton) {
      fireEvent.click(playerButton);
      expect(mockOnTargetSelect).toHaveBeenCalledWith({
        type: 'ENEMY_PLAYER',
        playerId: 'player2',
        playerName: 'EnemyPlayer',
        isValid: true,
      });
    }
  });

  it('should render module targets grouped by player', () => {
    render(<TargetingOverlay {...defaultProps} />);

    expect(screen.getByText('Módulos')).toBeInTheDocument();
    expect(screen.getByText('Player3')).toBeInTheDocument();
    expect(screen.getByText('Frontend App')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    
    // Check for module headers specifically
    const moduleHeaders = screen.getAllByRole('heading', { level: 4 });
    const enemyPlayerHeader = moduleHeaders.find(header => 
      header.textContent === 'EnemyPlayer'
    );
    expect(enemyPlayerHeader).toBeInTheDocument();
  });

  it('should handle module target selection', () => {
    render(<TargetingOverlay {...defaultProps} />);

    const moduleButtons = screen.getAllByRole('button');
    const moduleButton = moduleButtons.find(button => 
      button.querySelector('.module-name')?.textContent === 'Frontend App'
    );
    
    if (moduleButton) {
      fireEvent.click(moduleButton);
      expect(mockOnTargetSelect).toHaveBeenCalledWith({
        type: 'ENEMY_MODULE',
        playerId: 'player2',
        moduleId: 'module1',
        playerName: 'EnemyPlayer',
        moduleName: 'Frontend App',
        isValid: true,
      });
    }
  });

  it('should show selection indicator for selected targets', () => {
    const props = {
      ...defaultProps,
      selectedTargets: ['module1'],
    };

    render(<TargetingOverlay {...props} />);

    // Check for checkmark indicating selection
    const checkmarks = screen.queryAllByText('✓');
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it('should disable invalid module targets', () => {
    render(<TargetingOverlay {...defaultProps} />);

    const moduleButtons = screen.getAllByRole('button');
    const invalidModuleButton = moduleButtons.find(button => 
      button.querySelector('.module-name')?.textContent === 'Backend API'
    );
    
    expect(invalidModuleButton).toBeDisabled();
    expect(invalidModuleButton).toHaveAttribute('title', 'Módulo estabilizado');
  });

  it('should show no valid targets message when none available', () => {
    const targetingState = createMockTargetingState({
      validTargets: [],
    });

    render(<TargetingOverlay {...defaultProps} targetingState={targetingState} />);

    expect(screen.getByText('No hay objetivos válidos')).toBeInTheDocument();
  });

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

  it('should show bug card instructions', () => {
    const targetingState = createMockTargetingState({
      cardBeingPlayed: {
        id: 'card1',
        type: 'bug',
        name: { es: 'Bug', en: 'Bug' },
      },
    });

    render(<TargetingOverlay {...defaultProps} targetingState={targetingState} />);

    expect(screen.getByText('Selecciona un módulo enemigo para infectar')).toBeInTheDocument();
  });

  it('should not allow selection of invalid targets', () => {
    render(<TargetingOverlay {...defaultProps} />);

    const moduleButtons = screen.getAllByRole('button');
    const invalidModuleButton = moduleButtons.find(button => 
      button.querySelector('.module-name')?.textContent === 'Backend API'
    );
    
    if (invalidModuleButton) {
      fireEvent.click(invalidModuleButton);
      // Since button is disabled, the onClick shouldn't fire
      expect(mockOnTargetSelect).not.toHaveBeenCalled();
    }
  });
});
