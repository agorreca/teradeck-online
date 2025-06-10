import {
  Card,
  GameState,
  SelectedTarget,
  TargetingState,
  TargetOption,
  TargetType,
} from '@shared/types/game';
import {
  cardRequiresTarget,
  getCardTargetRequirements,
  getValidTargets,
  validateTargets,
} from '@shared/utils/targeting';
import { useCallback, useMemo, useState } from 'react';

export interface UseTargetingReturn {
  targetingState: TargetingState;
  selectedTargets: SelectedTarget[];
  startTargeting: (card: Card, gameState: GameState, playerId: string) => void;
  selectTarget: (target: TargetOption) => void;
  unselectTarget: (target: TargetOption) => void;
  confirmTargeting: () => boolean;
  cancelTargeting: () => void;
  isTargetSelected: (target: TargetOption) => boolean;
  canConfirm: boolean;
  targetingInstructions: string;
}

export function useTargeting(): UseTargetingReturn {
  const [targetingState, setTargetingState] = useState<TargetingState>({
    isActive: false,
    validTargets: [],
    targetType: TargetType.NONE,
    requiresTarget: false,
  });

  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([]);

  const startTargeting = useCallback(
    (card: Card, gameState: GameState, playerId: string) => {
      const requiresTarget = cardRequiresTarget(card);

      if (!requiresTarget) {
        // Card doesn't need targeting, can be played immediately
        setTargetingState({
          isActive: false,
          validTargets: [],
          targetType: TargetType.NONE,
          requiresTarget: false,
        });
        return;
      }

      const validTargets = getValidTargets(card, gameState, playerId);
      const requirements = getCardTargetRequirements(card);

      setTargetingState({
        isActive: true,
        cardBeingPlayed: card,
        validTargets,
        targetType: requirements.requiredTargets[0] || TargetType.NONE,
        requiresTarget: true,
      });

      setSelectedTargets([]);
    },
    []
  );

  const selectTarget = useCallback(
    (target: TargetOption) => {
      if (!target.isValid || !targetingState.cardBeingPlayed) return;

      const requirements = getCardTargetRequirements(
        targetingState.cardBeingPlayed
      );

      setSelectedTargets(prev => {
        // Check if target is already selected
        const isAlreadySelected = prev.some(
          t => t.playerId === target.playerId && t.moduleId === target.moduleId
        );

        if (isAlreadySelected) {
          return prev; // Don't add duplicates
        }

        // Check if we've reached max targets
        if (prev.length >= requirements.maxTargets) {
          // Replace the first target if single target selection
          if (requirements.maxTargets === 1) {
            return [
              {
                type: target.type,
                playerId: target.playerId,
                moduleId: target.moduleId,
              },
            ];
          }
          return prev; // Don't exceed max targets
        }

        // Add new target
        return [
          ...prev,
          {
            type: target.type,
            playerId: target.playerId,
            moduleId: target.moduleId,
          },
        ];
      });
    },
    [targetingState.cardBeingPlayed]
  );

  const unselectTarget = useCallback((target: TargetOption) => {
    setSelectedTargets(prev =>
      prev.filter(
        t => !(t.playerId === target.playerId && t.moduleId === target.moduleId)
      )
    );
  }, []);

  const isTargetSelected = useCallback(
    (target: TargetOption) => {
      return selectedTargets.some(
        t => t.playerId === target.playerId && t.moduleId === target.moduleId
      );
    },
    [selectedTargets]
  );

  const confirmTargeting = useCallback(() => {
    if (!targetingState.cardBeingPlayed) return false;

    // Convert selectedTargets to TargetOption format for validation
    const targetOptions: TargetOption[] = selectedTargets.map(selected => {
      const validTarget = targetingState.validTargets.find(
        vt =>
          vt.playerId === selected.playerId && vt.moduleId === selected.moduleId
      );
      return (
        validTarget || {
          type: selected.type,
          playerId: selected.playerId,
          moduleId: selected.moduleId,
          isValid: false,
        }
      );
    });

    const validation = validateTargets(
      targetingState.cardBeingPlayed,
      targetOptions,
      // Note: We need gameState and playerId here, but they're not available in this scope
      // This will be handled by the component using this hook
      {} as GameState,
      ''
    );

    if (validation.isValid) {
      setTargetingState(prev => ({ ...prev, isActive: false }));
      setSelectedTargets([]);
      return true;
    }

    return false;
  }, [
    targetingState.cardBeingPlayed,
    selectedTargets,
    targetingState.validTargets,
  ]);

  const cancelTargeting = useCallback(() => {
    setTargetingState({
      isActive: false,
      validTargets: [],
      targetType: TargetType.NONE,
      requiresTarget: false,
    });
    setSelectedTargets([]);
  }, []);

  const canConfirm = useMemo(() => {
    if (!targetingState.cardBeingPlayed) return false;

    const requirements = getCardTargetRequirements(
      targetingState.cardBeingPlayed
    );
    return (
      selectedTargets.length >= requirements.minTargets &&
      selectedTargets.length <= requirements.maxTargets
    );
  }, [targetingState.cardBeingPlayed, selectedTargets]);

  const targetingInstructions = useMemo(() => {
    if (!targetingState.cardBeingPlayed) return '';

    const requirements = getCardTargetRequirements(
      targetingState.cardBeingPlayed
    );
    // This will be handled by the component using translations
    return requirements.description.es || requirements.description.en || '';
  }, [targetingState.cardBeingPlayed]);

  return {
    targetingState,
    selectedTargets,
    startTargeting,
    selectTarget,
    unselectTarget,
    confirmTargeting,
    cancelTargeting,
    isTargetSelected,
    canConfirm,
    targetingInstructions,
  };
}
