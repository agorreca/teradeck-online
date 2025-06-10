import {
  BugCard,
  GameState,
  ModuleCard,
  ModuleState,
  OperationCard,
  OperationEffect,
  PatchCard,
  PlayCardActionData,
  Player,
  PlayValidation,
} from '../types/game';

// ===============================
// 🏗️ MODULE EFFECTS
// ===============================

export function placeModule(
  gameState: GameState,
  playerId: string,
  moduleCard: ModuleCard
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return { isValid: false, errorKey: 'errors.playerNotFound' };

  // Check for duplicate module types
  const hasSameType = player.modules.some(
    m => m.color === moduleCard.color && m.color !== 'multicolor'
  );

  if (hasSameType) {
    return { isValid: false, errorKey: 'errors.cannotPlaceDuplicate' };
  }

  // Place the module
  const newModule: ModuleCard = {
    ...moduleCard,
    state: ModuleState.FREE,
    bugs: [],
    patches: [],
    isStabilized: false,
  };

  player.modules.push(newModule);

  // Remove card from hand
  player.hand = player.hand.filter(c => c.id !== moduleCard.id);

  return { isValid: true };
}

// ===============================
// 🐛 BUG EFFECTS
// ===============================

export function applyBug(
  gameState: GameState,
  playerId: string,
  bugCard: BugCard,
  actionData: PlayCardActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  const targetPlayer = gameState.players.find(
    p => p.id === actionData.targetPlayerId
  );
  const targetModule = targetPlayer?.modules.find(
    m => m.id === actionData.targetModuleId
  );

  if (!player || !targetPlayer || !targetModule) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Can't bug stabilized modules
  if (targetModule.isStabilized) {
    return { isValid: false, errorKey: 'errors.moduleAlreadyStable' };
  }

  // Color matching: multicolor bugs can affect any module,
  // multicolor modules can be affected by any bug
  if (
    bugCard.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    bugCard.color !== targetModule.color
  ) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Apply bug effect based on current state
  if (targetModule.bugs.length === 0 && targetModule.patches.length === 0) {
    // Bug a free module
    targetModule.bugs.push(bugCard);
    targetModule.state = ModuleState.BUGGED;
  } else if (targetModule.patches.length > 0) {
    // Remove a patch (bug destroys patch)
    const removedPatch = targetModule.patches.pop();
    if (removedPatch) {
      gameState.discardPile.push(removedPatch);
    }
    gameState.discardPile.push(bugCard);

    // Update state
    if (targetModule.patches.length === 0) {
      targetModule.state =
        targetModule.bugs.length > 0 ? ModuleState.BUGGED : ModuleState.FREE;
    }
  } else if (targetModule.bugs.length > 0) {
    // Collapse module (second bug destroys it)
    const moduleIndex = targetPlayer.modules.findIndex(
      m => m.id === targetModule.id
    );
    if (moduleIndex >= 0) {
      // Send module and all bugs to discard pile
      gameState.discardPile.push(targetModule);
      gameState.discardPile.push(...targetModule.bugs);
      gameState.discardPile.push(bugCard);

      // Remove module from player
      targetPlayer.modules.splice(moduleIndex, 1);
    }
  }

  // Remove bug card from player's hand
  player.hand = player.hand.filter(c => c.id !== bugCard.id);

  return { isValid: true };
}

// ===============================
// 🔧 PATCH EFFECTS
// ===============================

export function applyPatch(
  gameState: GameState,
  playerId: string,
  patchCard: PatchCard,
  actionData: PlayCardActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  const targetPlayer = gameState.players.find(
    p => p.id === actionData.targetPlayerId
  );
  const targetModule = targetPlayer?.modules.find(
    m => m.id === actionData.targetModuleId
  );

  if (!player || !targetPlayer || !targetModule) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Color matching: multicolor patches can affect any module,
  // multicolor modules can be affected by any patch
  if (
    patchCard.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    patchCard.color !== targetModule.color
  ) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Apply patch effect based on current state
  if (targetModule.bugs.length > 0) {
    // Fix: Remove one bug
    const removedBug = targetModule.bugs.pop();
    if (removedBug) {
      gameState.discardPile.push(removedBug);
    }
    gameState.discardPile.push(patchCard);

    // Update state
    if (targetModule.bugs.length === 0) {
      targetModule.state =
        targetModule.patches.length > 0
          ? ModuleState.PATCHED
          : ModuleState.FREE;
    }
  } else {
    // Protect: Add patch to module
    targetModule.patches.push(patchCard);

    if (targetModule.patches.length === 1) {
      targetModule.state = ModuleState.PATCHED;
    } else if (targetModule.patches.length >= 2) {
      // Stabilize: Module becomes permanently protected
      targetModule.isStabilized = true;
      targetModule.state = ModuleState.STABILIZED;
    }
  }

  // Remove patch card from player's hand
  player.hand = player.hand.filter(c => c.id !== patchCard.id);

  return { isValid: true };
}

// ===============================
// ⚙️ OPERATION EFFECTS
// ===============================

export function applyOperation(
  gameState: GameState,
  playerId: string,
  operationCard: OperationCard,
  actionData: PlayCardActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return { isValid: false, errorKey: 'errors.playerNotFound' };

  let result: PlayValidation = { isValid: false };

  switch (operationCard.effect) {
    case OperationEffect.ARCHITECT_CHANGE:
      result = applyArchitectChange(gameState, playerId, actionData);
      break;
    case OperationEffect.RECRUIT_ACE:
      result = applyRecruitAce(gameState, playerId, actionData);
      break;
    case OperationEffect.INTERNAL_PHISHING:
      result = applyInternalPhishing(gameState, playerId, actionData);
      break;
    case OperationEffect.END_YEAR_PARTY:
      result = applyEndYearParty(gameState, playerId);
      break;
    case OperationEffect.PROJECT_SWAP:
      result = applyProjectSwap(gameState, playerId, actionData);
      break;
    default:
      return { isValid: false, errorKey: 'errors.invalidOperation' };
  }

  if (result.isValid) {
    // Remove operation card from hand and put in discard pile
    player.hand = player.hand.filter(c => c.id !== operationCard.id);
    gameState.discardPile.push(operationCard);
  }

  return result;
}

// Cambio de Arquitecto: Two players exchange modules (can be between any two players)
function applyArchitectChange(
  gameState: GameState,
  playerId: string,
  actionData: PlayCardActionData
): PlayValidation {
  if (
    !actionData.swapPlayerIds ||
    !actionData.swapModuleIds ||
    actionData.swapPlayerIds.length !== 2 ||
    actionData.swapModuleIds.length !== 2
  ) {
    return { isValid: false, errorKey: 'errors.invalidSwapData' };
  }

  const player1 = gameState.players.find(
    p => p.id === actionData.swapPlayerIds![0]
  );
  const player2 = gameState.players.find(
    p => p.id === actionData.swapPlayerIds![1]
  );

  if (!player1 || !player2) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const module1 = player1.modules.find(
    m => m.id === actionData.swapModuleIds![0]
  );
  const module2 = player2.modules.find(
    m => m.id === actionData.swapModuleIds![1]
  );

  if (!module1 || !module2) {
    return { isValid: false, errorKey: 'errors.moduleNotFound' };
  }

  // Check that swap won't create duplicates
  const wouldCreateDuplicate1 = player1.modules.some(
    m =>
      m.id !== module1.id &&
      m.color === module2.color &&
      m.color !== 'multicolor'
  );
  const wouldCreateDuplicate2 = player2.modules.some(
    m =>
      m.id !== module2.id &&
      m.color === module1.color &&
      m.color !== 'multicolor'
  );

  if (wouldCreateDuplicate1 || wouldCreateDuplicate2) {
    return { isValid: false, errorKey: 'errors.swapWouldCreateDuplicate' };
  }

  // Perform the swap
  const module1Index = player1.modules.findIndex(m => m.id === module1.id);
  const module2Index = player2.modules.findIndex(m => m.id === module2.id);

  player1.modules[module1Index] = module2;
  player2.modules[module2Index] = module1;

  return { isValid: true };
}

// Reclutamiento del Groso: Steal a module from another player
function applyRecruitAce(
  gameState: GameState,
  playerId: string,
  actionData: PlayCardActionData
): PlayValidation {
  if (!actionData.targetPlayerId || !actionData.targetModuleId) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const player = gameState.players.find(p => p.id === playerId);
  const targetPlayer = gameState.players.find(
    p => p.id === actionData.targetPlayerId
  );

  if (!player || !targetPlayer) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const targetModule = targetPlayer.modules.find(
    m => m.id === actionData.targetModuleId
  );
  if (!targetModule) {
    return { isValid: false, errorKey: 'errors.moduleNotFound' };
  }

  // Can't steal stabilized modules
  if (targetModule.isStabilized) {
    return { isValid: false, errorKey: 'errors.moduleAlreadyStable' };
  }

  // Check that stealing won't create duplicates
  const wouldCreateDuplicate = player.modules.some(
    m => m.color === targetModule.color && m.color !== 'multicolor'
  );

  if (wouldCreateDuplicate) {
    return { isValid: false, errorKey: 'errors.cannotPlaceDuplicate' };
  }

  // Perform the steal
  const moduleIndex = targetPlayer.modules.findIndex(
    m => m.id === targetModule.id
  );
  targetPlayer.modules.splice(moduleIndex, 1);
  player.modules.push(targetModule);

  return { isValid: true };
}

// Phishing Interno: Move bugs from your modules to opponent free modules
function applyInternalPhishing(
  gameState: GameState,
  playerId: string,
  actionData: PlayCardActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return { isValid: false, errorKey: 'errors.playerNotFound' };

  // Find all bugs on player's modules
  const bugsToMove: BugCard[] = [];

  player.modules.forEach(module => {
    if (module.bugs.length > 0) {
      bugsToMove.push(...module.bugs);
      module.bugs = []; // Remove bugs from this module

      // Update module state
      if (module.patches.length > 0) {
        module.state = ModuleState.PATCHED;
      } else {
        module.state = ModuleState.FREE;
      }
    }
  });

  if (bugsToMove.length === 0) {
    return { isValid: false, errorKey: 'errors.noBugsToMove' };
  }

  // If specific bug transfers are defined, use them
  if (actionData.bugTransfers && actionData.bugTransfers.length > 0) {
    actionData.bugTransfers.forEach((transfer, index) => {
      if (index < bugsToMove.length) {
        const bug = bugsToMove[index];
        const targetPlayer = gameState.players.find(
          p => p.id === transfer.playerId
        );
        const targetModule = targetPlayer?.modules.find(
          m => m.id === transfer.moduleId
        );

        if (
          targetPlayer &&
          targetModule &&
          targetModule.state === ModuleState.FREE &&
          !targetModule.isStabilized
        ) {
          // Check color compatibility
          if (
            bug.color === 'multicolor' ||
            targetModule.color === 'multicolor' ||
            bug.color === targetModule.color
          ) {
            targetModule.bugs.push(bug);
            targetModule.state = ModuleState.BUGGED;
            return; // Bug successfully transferred
          }
        }
        // If transfer fails, bug goes to discard
        gameState.discardPile.push(bug);
      }
    });

    // Any remaining bugs go to discard
    if (bugsToMove.length > actionData.bugTransfers.length) {
      gameState.discardPile.push(
        ...bugsToMove.slice(actionData.bugTransfers.length)
      );
    }
  } else {
    // Fallback: automatically distribute bugs to available free modules
    const freeModules: { player: Player; module: ModuleCard }[] = [];
    gameState.players.forEach(p => {
      if (p.id !== playerId) {
        p.modules.forEach(m => {
          if (m.state === ModuleState.FREE && !m.isStabilized) {
            freeModules.push({ player: p, module: m });
          }
        });
      }
    });

    if (freeModules.length === 0) {
      // No valid targets, bugs go to discard pile
      gameState.discardPile.push(...bugsToMove);
    } else {
      // Distribute bugs to free modules
      bugsToMove.forEach((bug, index) => {
        const targetIndex = index % freeModules.length;
        const target = freeModules[targetIndex];

        // Check color compatibility: multicolor bugs work on any module,
        // any bug works on multicolor modules
        if (
          bug.color === 'multicolor' ||
          target.module.color === 'multicolor' ||
          bug.color === target.module.color
        ) {
          target.module.bugs.push(bug);
          target.module.state = ModuleState.BUGGED;
        } else {
          // Bug can't be applied, goes to discard
          gameState.discardPile.push(bug);
        }
      });
    }
  }

  return { isValid: true };
}

// Fiesta de Fin de Año: All players except the one who played this discard and skip next turn
function applyEndYearParty(
  gameState: GameState,
  playerId: string
): PlayValidation {
  gameState.players.forEach(player => {
    if (player.id !== playerId) {
      // Discard all cards
      gameState.discardPile.push(...player.hand);
      player.hand = [];

      // Skip next turn
      player.skippedTurns = Math.max(player.skippedTurns, 1);
    }
  });

  return { isValid: true };
}

// Project Swap: Exchange all modules with another player
function applyProjectSwap(
  gameState: GameState,
  playerId: string,
  actionData: PlayCardActionData
): PlayValidation {
  if (!actionData.swapTargetPlayerId) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const player1 = gameState.players.find(p => p.id === playerId);
  const player2 = gameState.players.find(
    p => p.id === actionData.swapTargetPlayerId
  );

  if (!player1 || !player2) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Swap all modules (including stabilized ones)
  const tempModules = player1.modules;
  player1.modules = player2.modules;
  player2.modules = tempModules;

  return { isValid: true };
}
