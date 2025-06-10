import {
  Card,
  CardType,
  GameState,
  Player,
} from '../../../shared/src/types/game';
import {
  cardRequiresTarget,
  getValidTargets,
} from '../../../shared/src/utils/targeting';

export interface CardPlayability {
  canPlay: boolean;
  requiresTarget: boolean;
  hasValidTargets: boolean;
  reason?: string;
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
      reason: 'No es tu turno',
      reasonKey: 'errors.notYourTurn',
    };
  }

  if (currentPlayer.skippedTurns > 0) {
    return {
      canPlay: false,
      requiresTarget: false,
      hasValidTargets: false,
      reason: 'Tienes turnos saltados',
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
        reason: 'Ya tienes un módulo de este tipo',
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
      let reason = 'No hay objetivos válidos';
      let reasonKey = 'errors.noValidTargets';

      // Provide more specific reasons based on card type
      if (card.type === CardType.BUG) {
        reason = 'No hay módulos enemigos disponibles para infectar';
        reasonKey = 'errors.noBugTargets';
      } else if (card.type === CardType.PATCH) {
        reason = 'No tienes módulos que puedan ser parcheados';
        reasonKey = 'errors.noPatchTargets';
      } else if (card.type === CardType.OPERATION) {
        reason = 'No se pueden ejecutar las condiciones de esta operación';
        reasonKey = 'errors.noOperationTargets';
      }

      return {
        canPlay: false,
        requiresTarget: true,
        hasValidTargets: false,
        reason,
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