import {
  Card,
  CardTargetRequirements,
  CardType,
  GameState,
  ModuleCard,
  ModuleState,
  OperationEffect,
  TargetOption,
  TargetType,
} from '../types/game';

// Define targeting requirements for each card type
export const CARD_TARGET_REQUIREMENTS: Record<string, CardTargetRequirements> =
  {
    // Module cards don't need targets
    [CardType.MODULE]: {
      cardType: CardType.MODULE,
      requiredTargets: [TargetType.NONE],
      maxTargets: 0,
      minTargets: 0,
      description: {
        es: 'Juega este módulo en tu área',
        en: 'Play this module in your area',
      },
    },

    // Bug cards target enemy modules
    [CardType.BUG]: {
      cardType: CardType.BUG,
      requiredTargets: [TargetType.ENEMY_MODULE],
      maxTargets: 1,
      minTargets: 1,
      description: {
        es: 'Selecciona un módulo enemigo para infectar',
        en: 'Select an enemy module to infect',
      },
    },

    // Patch cards target own modules
    [CardType.PATCH]: {
      cardType: CardType.PATCH,
      requiredTargets: [TargetType.OWN_MODULE],
      maxTargets: 1,
      minTargets: 1,
      description: {
        es: 'Selecciona uno de tus módulos para proteger',
        en: 'Select one of your modules to protect',
      },
    },

    // Operation cards have different targeting based on effect
    [`${CardType.OPERATION}_${OperationEffect.ARCHITECT_CHANGE}`]: {
      cardType: CardType.OPERATION,
      cardEffect: OperationEffect.ARCHITECT_CHANGE,
      requiredTargets: [TargetType.ANY_MODULE, TargetType.ANY_MODULE],
      maxTargets: 2,
      minTargets: 2,
      description: {
        es: 'Selecciona dos módulos de cualquier jugador para intercambiar',
        en: 'Select two modules from any players to exchange',
      },
    },

    [`${CardType.OPERATION}_${OperationEffect.RECRUIT_ACE}`]: {
      cardType: CardType.OPERATION,
      cardEffect: OperationEffect.RECRUIT_ACE,
      requiredTargets: [TargetType.ENEMY_MODULE],
      maxTargets: 1,
      minTargets: 1,
      description: {
        es: 'Selecciona un módulo enemigo para robar (no estabilizado)',
        en: 'Select an enemy module to steal (not stabilized)',
      },
    },

    [`${CardType.OPERATION}_${OperationEffect.INTERNAL_PHISHING}`]: {
      cardType: CardType.OPERATION,
      cardEffect: OperationEffect.INTERNAL_PHISHING,
      requiredTargets: [TargetType.ENEMY_MODULE],
      maxTargets: 10, // Allow multiple targets (all your bugs can be transferred)
      minTargets: 0, // Might not have valid targets
      description: {
        es: 'Transfiere todos tus bugs a módulos libres de otros jugadores',
        en: 'Transfer all your bugs to free modules of other players',
      },
    },

    [`${CardType.OPERATION}_${OperationEffect.END_YEAR_PARTY}`]: {
      cardType: CardType.OPERATION,
      cardEffect: OperationEffect.END_YEAR_PARTY,
      requiredTargets: [TargetType.NONE],
      maxTargets: 0,
      minTargets: 0,
      description: {
        es: 'Todos los jugadores descartan su mano y roban 3 cartas',
        en: 'All players discard their hand and draw 3 cards',
      },
    },

    [`${CardType.OPERATION}_${OperationEffect.PROJECT_SWAP}`]: {
      cardType: CardType.OPERATION,
      cardEffect: OperationEffect.PROJECT_SWAP,
      requiredTargets: [TargetType.ENEMY_PLAYER],
      maxTargets: 1,
      minTargets: 1,
      description: {
        es: 'Selecciona un jugador enemigo para intercambiar todos los módulos',
        en: 'Select an enemy player to swap all modules with',
      },
    },
  };

// Get targeting requirements for a card
export function getCardTargetRequirements(card: Card): CardTargetRequirements {
  let key: string = card.type;

  if (card.type === CardType.OPERATION && card.effect) {
    key = `${card.type}_${card.effect}` as keyof typeof CARD_TARGET_REQUIREMENTS;
  }

  return CARD_TARGET_REQUIREMENTS[key as keyof typeof CARD_TARGET_REQUIREMENTS] || CARD_TARGET_REQUIREMENTS[card.type];
}

// Check if a card requires targeting
export function cardRequiresTarget(card: Card): boolean {
  const requirements = getCardTargetRequirements(card);
  return requirements.minTargets > 0;
}

// Get valid targets for a card
export function getValidTargets(
  card: Card,
  gameState: GameState,
  currentPlayerId: string
): TargetOption[] {
  const requirements = getCardTargetRequirements(card);
  const targets: TargetOption[] = [];
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

  if (!currentPlayer) return targets;

  for (const targetType of requirements.requiredTargets) {
    switch (targetType) {
      case TargetType.NONE:
        // No targets needed
        break;

      case TargetType.ENEMY_PLAYER:
        gameState.players
          .filter(p => p.id !== currentPlayerId && p.isConnected)
          .forEach(player => {
            targets.push({
              type: TargetType.ENEMY_PLAYER,
              playerId: player.id,
              playerName: player.nickname,
              isValid: true,
            });
          });
        break;

      case TargetType.ENEMY_MODULE:
        gameState.players
          .filter(p => p.id !== currentPlayerId)
          .forEach(player => {
            player.modules.forEach(module => {
              const canTarget = canTargetModuleWithBug(card, module);
              targets.push({
                type: TargetType.ENEMY_MODULE,
                playerId: player.id,
                moduleId: module.id,
                playerName: player.nickname,
                moduleName: module.name[gameState.language],
                isValid: canTarget.isValid,
                reason: canTarget.reason,
              });
            });
          });
        break;

      case TargetType.OWN_MODULE:
        currentPlayer.modules.forEach(module => {
          const canTarget = canTargetModuleWithPatch(card, module);
          targets.push({
            type: TargetType.OWN_MODULE,
            playerId: currentPlayerId,
            moduleId: module.id,
            playerName: currentPlayer.nickname,
            moduleName: module.name[gameState.language],
            isValid: canTarget.isValid,
            reason: canTarget.reason,
          });
        });
        break;

      case TargetType.BUGGED_MODULE:
        currentPlayer.modules
          .filter(module => module.state === ModuleState.BUGGED)
          .forEach(module => {
            targets.push({
              type: TargetType.BUGGED_MODULE,
              playerId: currentPlayerId,
              moduleId: module.id,
              playerName: currentPlayer.nickname,
              moduleName: module.name[gameState.language],
              isValid: true,
            });
          });
        break;

      case TargetType.FREE_MODULE:
        currentPlayer.modules
          .filter(module => module.state === ModuleState.FREE)
          .forEach(module => {
            targets.push({
              type: TargetType.FREE_MODULE,
              playerId: currentPlayerId,
              moduleId: module.id,
              playerName: currentPlayer.nickname,
              moduleName: module.name[gameState.language],
              isValid: true,
            });
          });
        break;
    }
  }

  return targets;
}

// Check if a bug can target a specific module
function canTargetModuleWithBug(
  bugCard: Card,
  targetModule: ModuleCard
): { isValid: boolean; reason?: string } {
  // Can't target stabilized modules
  if (targetModule.state === ModuleState.STABILIZED) {
    return {
      isValid: false,
      reason: 'Module is stabilized and cannot be targeted',
    };
  }

  // Check color compatibility: multicolor bugs work on any module,
  // any bug works on multicolor modules
  if (
    bugCard.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    bugCard.color !== targetModule.color
  ) {
    return { isValid: false, reason: 'Bug color does not match module color' };
  }

  // Can't target modules that already have bugs (unless multicolor bug)
  if (targetModule.bugs.length > 0 && bugCard.color !== 'multicolor') {
    return { isValid: false, reason: 'Module already has a bug' };
  }

  return { isValid: true };
}

// Check if a patch can target a specific module
function canTargetModuleWithPatch(
  patchCard: Card,
  targetModule: ModuleCard
): { isValid: boolean; reason?: string } {
  // Check color compatibility: multicolor patches work on any module,
  // any patch works on multicolor modules
  if (
    patchCard.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    patchCard.color !== targetModule.color
  ) {
    return {
      isValid: false,
      reason: 'Patch color does not match module color',
    };
  }

  // Can target any module that isn't already stabilized
  if (targetModule.state === ModuleState.STABILIZED) {
    return { isValid: false, reason: 'Module is already stabilized' };
  }

  return { isValid: true };
}

// Validate if selected targets are valid for a card
export function validateTargets(
  card: Card,
  targets: TargetOption[],
  gameState: GameState,
  currentPlayerId: string
): { isValid: boolean; errorKey?: string } {
  const requirements = getCardTargetRequirements(card);

  // Check target count
  if (targets.length < requirements.minTargets) {
    return { isValid: false, errorKey: 'targeting.not_enough_targets' };
  }

  if (targets.length > requirements.maxTargets) {
    return { isValid: false, errorKey: 'targeting.too_many_targets' };
  }

  // Check if all targets are valid
  const validTargets = getValidTargets(card, gameState, currentPlayerId);
  for (const target of targets) {
    const isValidTarget = validTargets.some(
      vt =>
        vt.type === target.type &&
        vt.playerId === target.playerId &&
        vt.moduleId === target.moduleId &&
        vt.isValid
    );

    if (!isValidTarget) {
      return { isValid: false, errorKey: 'targeting.invalid_target' };
    }
  }

  return { isValid: true };
}
