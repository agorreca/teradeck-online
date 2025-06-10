import { CardType, TargetType } from '@shared/types/game';
import { act, renderHook } from '@testing-library/react';
import { useTargeting } from '../../hooks/useTargeting';

// Mock dependencies with proper default returns
const mockTargetingUtils = {
  cardRequiresTarget: jest.fn(),
  getCardTargetRequirements: jest.fn(),
  getValidTargets: jest.fn(),
  validateTargets: jest.fn(),
};

jest.mock('../../../../shared/src/utils/targeting', () => mockTargetingUtils);

const createMockCard = (type = CardType.BUG, requiresTarget = true) => ({
  id: 'card1',
  name: { es: 'Carta Test', en: 'Test Card' },
  description: { es: 'Descripción', en: 'Description' },
  type,
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
  ],
  language: 'es',
  currentPlayerIndex: 0,
  turn: 1,
  deck: [],
  discardPile: [],
});

const createMockTarget = (type = TargetType.ENEMY_MODULE, isValid = true) => ({
  type,
  playerId: 'player2',
  moduleId: 'module1',
  playerName: 'EnemyPlayer',
  moduleName: 'Frontend App',
  isValid,
});

describe('useTargeting Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mocks
    mockTargetingUtils.cardRequiresTarget.mockReturnValue(true);
    mockTargetingUtils.getCardTargetRequirements.mockReturnValue({
      minTargets: 1,
      maxTargets: 1,
      requiredTargets: ['ENEMY_MODULE'],
      description: { es: 'Selecciona un objetivo', en: 'Select a target' },
    });
    mockTargetingUtils.getValidTargets.mockReturnValue([]);
    mockTargetingUtils.validateTargets.mockReturnValue({ isValid: true });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTargeting());

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toEqual([]);
    expect(result.current.canConfirm).toBe(false);
  });

  it('should provide all expected interface methods', () => {
    const { result } = renderHook(() => useTargeting());

    expect(typeof result.current.startTargeting).toBe('function');
    expect(typeof result.current.selectTarget).toBe('function');
    expect(typeof result.current.confirmTargeting).toBe('function');
    expect(typeof result.current.cancelTargeting).toBe('function');
  });

  it('should start targeting for cards that require targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    expect(result.current.targetingState.isActive).toBe(true);
    expect(mockTargetingUtils.cardRequiresTarget).toHaveBeenCalledWith(card);
    expect(mockTargetingUtils.getValidTargets).toHaveBeenCalledWith(
      card,
      gameState,
      'player1'
    );
  });

  it('should not start targeting for cards that do not require targets', () => {
    mockTargetingUtils.cardRequiresTarget.mockReturnValue(false);

    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'module' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.targetingState.requiresTarget).toBe(false);
  });

  it('should select valid targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    // Start targeting first
    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(1);
    expect(result.current.selectedTargets[0]).toEqual({
      type: target.type,
      playerId: target.playerId,
      moduleId: target.moduleId,
    });
  });

  it('should not select invalid targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const invalidTarget = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: false,
    };

    act(() => {
      result.current.selectTarget(invalidTarget);
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should handle max targets correctly', () => {
    mockTargetingUtils.getCardTargetRequirements.mockReturnValue({
      minTargets: 1,
      maxTargets: 2,
      requiredTargets: ['ENEMY_MODULE'],
      description: {
        es: 'Selecciona hasta 2 objetivos',
        en: 'Select up to 2 targets',
      },
    });

    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'operation' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target1 = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    const target2 = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module2',
      isValid: true,
    };

    const target3 = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module3',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target1);
      result.current.selectTarget(target2);
      result.current.selectTarget(target3); // Should not be added
    });

    expect(result.current.selectedTargets).toHaveLength(2);
  });

  it('should confirm targeting when validation passes', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    let confirmResult;
    act(() => {
      confirmResult = result.current.confirmTargeting();
    });

    expect(confirmResult).toBe(true);
    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should not confirm targeting when validation fails', () => {
    mockTargetingUtils.validateTargets.mockReturnValue({ isValid: false });

    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    let confirmResult;
    act(() => {
      confirmResult = result.current.confirmTargeting();
    });

    expect(confirmResult).toBe(false);
    expect(result.current.targetingState.isActive).toBe(true);
  });

  it('should return false when confirming with no card', () => {
    const { result } = renderHook(() => useTargeting());

    let confirmResult;
    act(() => {
      confirmResult = result.current.confirmTargeting();
    });

    expect(confirmResult).toBe(false);
  });

  it('should cancel targeting and reset state', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.targetingState.isActive).toBe(true);
    expect(result.current.selectedTargets).toHaveLength(1);

    act(() => {
      result.current.cancelTargeting();
    });

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should correctly calculate canConfirm', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    expect(result.current.canConfirm).toBe(false);

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.canConfirm).toBe(true);
  });

  it('should return targeting instructions', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    expect(result.current.targetingInstructions).toBe('Selecciona un objetivo');
  });

  it('should handle isTargetSelected correctly', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    expect(result.current.isTargetSelected(target)).toBe(false);

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.isTargetSelected(target)).toBe(true);
  });

  it('should unselect targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = { id: 'card1', type: 'bug' };
    const gameState = { players: [] };

    act(() => {
      result.current.startTargeting(card, gameState as any, 'player1');
    });

    const target = {
      type: 'ENEMY_MODULE',
      playerId: 'player2',
      moduleId: 'module1',
      isValid: true,
    };

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(1);

    act(() => {
      result.current.unselectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });
});
