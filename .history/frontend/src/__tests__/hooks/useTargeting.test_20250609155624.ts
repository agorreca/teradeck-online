import { act, renderHook } from '@testing-library/react';
import { CardType, TargetType } from '../../../../shared/src/types/game';
import { useTargeting } from '../../hooks/useTargeting';

// Mock dependencies
jest.mock('../../../../shared/src/utils/targeting', () => ({
  cardRequiresTarget: jest.fn(),
  getCardTargetRequirements: jest.fn(),
  getValidTargets: jest.fn(),
  validateTargets: jest.fn(),
}));

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
  const mockTargetingUtils = require('../../../../shared/src/utils/targeting');

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockTargetingUtils.cardRequiresTarget.mockReturnValue(true);
    mockTargetingUtils.getCardTargetRequirements.mockReturnValue({
      minTargets: 1,
      maxTargets: 1,
      requiredTargets: [TargetType.ENEMY_MODULE],
      description: { es: 'Selecciona un objetivo', en: 'Select a target' },
    });
    mockTargetingUtils.getValidTargets.mockReturnValue([createMockTarget()]);
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
    expect(typeof result.current.unselectTarget).toBe('function');
    expect(typeof result.current.confirmTargeting).toBe('function');
    expect(typeof result.current.cancelTargeting).toBe('function');
    expect(typeof result.current.isTargetSelected).toBe('function');
  });

  it('should start targeting for cards that require targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(result.current.targetingState.isActive).toBe(true);
    expect(result.current.targetingState.cardBeingPlayed).toEqual(card);
    expect(result.current.targetingState.requiresTarget).toBe(true);
    expect(result.current.selectedTargets).toEqual([]);
  });

  it('should not start targeting for cards that do not require targets', () => {
    mockTargetingUtils.cardRequiresTarget.mockReturnValue(false);

    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.targetingState.requiresTarget).toBe(false);
  });

  it('should call utility functions with correct parameters', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(mockTargetingUtils.cardRequiresTarget).toHaveBeenCalledWith(card);
    expect(mockTargetingUtils.getValidTargets).toHaveBeenCalledWith(
      card,
      gameState,
      'player1'
    );
    expect(mockTargetingUtils.getCardTargetRequirements).toHaveBeenCalledWith(
      card
    );
  });

  it('should reset selected targets when starting new targeting', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    // Start targeting and select a target
    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    act(() => {
      result.current.selectTarget(createMockTarget());
    });

    expect(result.current.selectedTargets).toHaveLength(1);

    // Start new targeting
    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(result.current.selectedTargets).toEqual([]);
  });

  it('should select valid targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

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
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const invalidTarget = createMockTarget(TargetType.ENEMY_MODULE, false);

    act(() => {
      result.current.selectTarget(invalidTarget);
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should not select duplicate targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

    act(() => {
      result.current.selectTarget(target);
      result.current.selectTarget(target); // Try to select same target again
    });

    expect(result.current.selectedTargets).toHaveLength(1);
  });

  it('should replace target when max targets is 1', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target1 = createMockTarget();
    const target2 = { ...createMockTarget(), moduleId: 'module2' };

    act(() => {
      result.current.selectTarget(target1);
      result.current.selectTarget(target2);
    });

    expect(result.current.selectedTargets).toHaveLength(1);
    expect(result.current.selectedTargets[0].moduleId).toBe('module2');
  });

  it('should not exceed max targets when max targets > 1', () => {
    mockTargetingUtils.getCardTargetRequirements.mockReturnValue({
      minTargets: 1,
      maxTargets: 2,
      requiredTargets: [TargetType.ENEMY_MODULE],
    });

    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target1 = createMockTarget();
    const target2 = { ...createMockTarget(), moduleId: 'module2' };
    const target3 = { ...createMockTarget(), moduleId: 'module3' };

    act(() => {
      result.current.selectTarget(target1);
      result.current.selectTarget(target2);
      result.current.selectTarget(target3); // Should not be added
    });

    expect(result.current.selectedTargets).toHaveLength(2);
  });

  it('should not select targets when no card is being played', () => {
    const { result } = renderHook(() => useTargeting());
    const target = createMockTarget();

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should remove selected targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(1);

    act(() => {
      result.current.unselectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should not affect unselected targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target1 = createMockTarget();
    const target2 = { ...createMockTarget(), moduleId: 'module2' };

    act(() => {
      result.current.unselectTarget(target1); // Try to unselect non-selected target
    });

    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should return true for selected targets', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.isTargetSelected(target)).toBe(true);
  });

  it('should return false for unselected targets', () => {
    const { result } = renderHook(() => useTargeting());
    const target = createMockTarget();

    expect(result.current.isTargetSelected(target)).toBe(false);
  });

  it('should confirm targeting when validation passes', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

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
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

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

  it('should return false when no card is being played', () => {
    const { result } = renderHook(() => useTargeting());

    let confirmResult;
    act(() => {
      confirmResult = result.current.confirmTargeting();
    });

    expect(confirmResult).toBe(false);
  });

  it('should reset targeting state', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    const target = createMockTarget();

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
    expect(result.current.targetingState).toEqual({
      isActive: false,
      validTargets: [],
      targetType: TargetType.NONE,
      requiresTarget: false,
    });
  });

  it('should return instructions from card requirements', () => {
    mockTargetingUtils.getCardTargetRequirements.mockReturnValue({
      minTargets: 1,
      maxTargets: 1,
      description: {
        es: 'Instrucciones en español',
        en: 'Instructions in English',
      },
    });

    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();

    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(result.current.targetingInstructions).toBe(
      'Instrucciones en español'
    );
  });

  it('should return empty string when no card is being played', () => {
    const { result } = renderHook(() => useTargeting());

    expect(result.current.targetingInstructions).toBe('');
  });

  it('should handle complete targeting flow', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();
    const target = createMockTarget();

    // Start targeting
    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
    });

    expect(result.current.targetingState.isActive).toBe(true);
    expect(result.current.canConfirm).toBe(false);

    // Select target
    act(() => {
      result.current.selectTarget(target);
    });

    expect(result.current.selectedTargets).toHaveLength(1);
    expect(result.current.canConfirm).toBe(true);
    expect(result.current.isTargetSelected(target)).toBe(true);

    // Confirm targeting
    let confirmResult;
    act(() => {
      confirmResult = result.current.confirmTargeting();
    });

    expect(confirmResult).toBe(true);
    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should handle targeting cancellation flow', () => {
    const { result } = renderHook(() => useTargeting());
    const card = createMockCard();
    const gameState = createMockGameState();
    const target = createMockTarget();

    // Start targeting and select target
    act(() => {
      result.current.startTargeting(card, gameState, 'player1');
      result.current.selectTarget(target);
    });

    expect(result.current.targetingState.isActive).toBe(true);
    expect(result.current.selectedTargets).toHaveLength(1);

    // Cancel targeting
    act(() => {
      result.current.cancelTargeting();
    });

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toHaveLength(0);
  });

  it('should cancel targeting and reset state', () => {
    const { result } = renderHook(() => useTargeting());

    act(() => {
      result.current.cancelTargeting();
    });

    expect(result.current.targetingState.isActive).toBe(false);
    expect(result.current.selectedTargets).toEqual([]);
  });
});
