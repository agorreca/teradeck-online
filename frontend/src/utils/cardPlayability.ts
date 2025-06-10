import { Card, CardType, GameState, Player } from '@shared/types/game';
import { cardRequiresTarget, getValidTargets } from '@shared/utils/targeting';

export interface CardPlayability {
  canPlay: boolean;
  requiresTarget: boolean;
  hasValidTargets: boolean;
  reasonKey?: string;
}

export function getCardPlayability(
  card: Card,
  gameState: GameState,
  currentPlayer: Player,
  isPlayerTurn: boolean
): CardPlayability {
  // Base conditions
  if (!isPlayerTurn) {
    return {
      canPlay: false,
      requiresTarget: false,
      hasValidTargets: false,
      reasonKey: 'errors.notYourTurn',
    };
  }

  if (currentPlayer.skippedTurns > 0) {
    return {
      canPlay: false,
      requiresTarget: false,
      hasValidTargets: false,
      reasonKey: 'errors.playerSkippedTurn',
    };
  }

  const requiresTarget = cardRequiresTarget(card);

  // Modules don't require targeting - they go directly to player's area
  if (card.type === CardType.MODULE) {
    // Check if player already has this module type
    const hasConflict = currentPlayer.modules.some(
      m => m.color === card.color && card.color !== 'multicolor'
    );

    if (hasConflict) {
      return {
        canPlay: false,
        requiresTarget: false,
        hasValidTargets: false,
        reasonKey: 'errors.cannotPlaceDuplicate',
      };
    }

    return {
      canPlay: true,
      requiresTarget: false,
      hasValidTargets: false,
    };
  }

  // For cards that require targeting
  if (requiresTarget) {
    const validTargets = getValidTargets(card, gameState, currentPlayer.id);
    const hasValidTargets = validTargets.some(target => target.isValid);

    if (!hasValidTargets) {
      let reasonKey = 'errors.noValidTargets';

      // Provide more specific reasons based on card type
      if (card.type === CardType.BUG) {
        reasonKey = 'errors.noBugTargets';
      } else if (card.type === CardType.PATCH) {
        reasonKey = 'errors.noPatchTargets';
      } else if (card.type === CardType.OPERATION) {
        reasonKey = 'errors.noOperationTargets';
      }

      return {
        canPlay: false,
        requiresTarget: true,
        hasValidTargets: false,
        reasonKey,
      };
    }

    return {
      canPlay: true,
      requiresTarget: true,
      hasValidTargets: true,
    };
  }

  // Default: can play
  return {
    canPlay: true,
    requiresTarget: false,
    hasValidTargets: false,
  };
}
