"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARD_TARGET_REQUIREMENTS = void 0;
exports.getCardTargetRequirements = getCardTargetRequirements;
exports.cardRequiresTarget = cardRequiresTarget;
exports.getValidTargets = getValidTargets;
exports.validateTargets = validateTargets;
const game_1 = require("../types/game");
exports.CARD_TARGET_REQUIREMENTS = {
    [game_1.CardType.MODULE]: {
        cardType: game_1.CardType.MODULE,
        requiredTargets: [game_1.TargetType.NONE],
        maxTargets: 0,
        minTargets: 0,
        description: {
            es: 'Juega este módulo en tu área',
            en: 'Play this module in your area',
        },
    },
    [game_1.CardType.BUG]: {
        cardType: game_1.CardType.BUG,
        requiredTargets: [game_1.TargetType.ENEMY_MODULE],
        maxTargets: 1,
        minTargets: 1,
        description: {
            es: 'Selecciona un módulo enemigo para infectar',
            en: 'Select an enemy module to infect',
        },
    },
    [game_1.CardType.PATCH]: {
        cardType: game_1.CardType.PATCH,
        requiredTargets: [game_1.TargetType.OWN_MODULE],
        maxTargets: 1,
        minTargets: 1,
        description: {
            es: 'Selecciona uno de tus módulos para proteger',
            en: 'Select one of your modules to protect',
        },
    },
    [`${game_1.CardType.OPERATION}_${game_1.OperationEffect.ARCHITECT_CHANGE}`]: {
        cardType: game_1.CardType.OPERATION,
        cardEffect: game_1.OperationEffect.ARCHITECT_CHANGE,
        requiredTargets: [game_1.TargetType.ANY_MODULE, game_1.TargetType.ANY_MODULE],
        maxTargets: 2,
        minTargets: 2,
        description: {
            es: 'Selecciona dos módulos de cualquier jugador para intercambiar',
            en: 'Select two modules from any players to exchange',
        },
    },
    [`${game_1.CardType.OPERATION}_${game_1.OperationEffect.RECRUIT_ACE}`]: {
        cardType: game_1.CardType.OPERATION,
        cardEffect: game_1.OperationEffect.RECRUIT_ACE,
        requiredTargets: [game_1.TargetType.ENEMY_MODULE],
        maxTargets: 1,
        minTargets: 1,
        description: {
            es: 'Selecciona un módulo enemigo para robar (no estabilizado)',
            en: 'Select an enemy module to steal (not stabilized)',
        },
    },
    [`${game_1.CardType.OPERATION}_${game_1.OperationEffect.INTERNAL_PHISHING}`]: {
        cardType: game_1.CardType.OPERATION,
        cardEffect: game_1.OperationEffect.INTERNAL_PHISHING,
        requiredTargets: [game_1.TargetType.ENEMY_MODULE],
        maxTargets: 10,
        minTargets: 0,
        description: {
            es: 'Transfiere todos tus bugs a módulos libres de otros jugadores',
            en: 'Transfer all your bugs to free modules of other players',
        },
    },
    [`${game_1.CardType.OPERATION}_${game_1.OperationEffect.END_YEAR_PARTY}`]: {
        cardType: game_1.CardType.OPERATION,
        cardEffect: game_1.OperationEffect.END_YEAR_PARTY,
        requiredTargets: [game_1.TargetType.NONE],
        maxTargets: 0,
        minTargets: 0,
        description: {
            es: 'Todos los jugadores descartan su mano y roban 3 cartas',
            en: 'All players discard their hand and draw 3 cards',
        },
    },
    [`${game_1.CardType.OPERATION}_${game_1.OperationEffect.PROJECT_SWAP}`]: {
        cardType: game_1.CardType.OPERATION,
        cardEffect: game_1.OperationEffect.PROJECT_SWAP,
        requiredTargets: [game_1.TargetType.ENEMY_PLAYER],
        maxTargets: 1,
        minTargets: 1,
        description: {
            es: 'Selecciona un jugador enemigo para intercambiar todos los módulos',
            en: 'Select an enemy player to swap all modules with',
        },
    },
};
function getCardTargetRequirements(card) {
    let key = card.type;
    if (card.type === game_1.CardType.OPERATION && card.effect) {
        key =
            `${card.type}_${card.effect}`;
    }
    return (exports.CARD_TARGET_REQUIREMENTS[key] ||
        exports.CARD_TARGET_REQUIREMENTS[card.type]);
}
function cardRequiresTarget(card) {
    const requirements = getCardTargetRequirements(card);
    return requirements.minTargets > 0;
}
function getValidTargets(card, gameState, currentPlayerId) {
    const requirements = getCardTargetRequirements(card);
    const targets = [];
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer)
        return targets;
    for (const targetType of requirements.requiredTargets) {
        switch (targetType) {
            case game_1.TargetType.NONE:
                break;
            case game_1.TargetType.ENEMY_PLAYER:
                gameState.players
                    .filter(p => p.id !== currentPlayerId && p.isConnected)
                    .forEach(player => {
                    targets.push({
                        type: game_1.TargetType.ENEMY_PLAYER,
                        playerId: player.id,
                        playerName: player.nickname,
                        isValid: true,
                    });
                });
                break;
            case game_1.TargetType.ENEMY_MODULE:
                gameState.players
                    .filter(p => p.id !== currentPlayerId)
                    .forEach(player => {
                    player.modules.forEach(module => {
                        const canTarget = canTargetModuleWithBug(card, module);
                        targets.push({
                            type: game_1.TargetType.ENEMY_MODULE,
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
            case game_1.TargetType.OWN_MODULE:
                currentPlayer.modules.forEach(module => {
                    const canTarget = canTargetModuleWithPatch(card, module);
                    targets.push({
                        type: game_1.TargetType.OWN_MODULE,
                        playerId: currentPlayerId,
                        moduleId: module.id,
                        playerName: currentPlayer.nickname,
                        moduleName: module.name[gameState.language],
                        isValid: canTarget.isValid,
                        reason: canTarget.reason,
                    });
                });
                break;
            case game_1.TargetType.BUGGED_MODULE:
                currentPlayer.modules
                    .filter(module => module.state === game_1.ModuleState.BUGGED)
                    .forEach(module => {
                    targets.push({
                        type: game_1.TargetType.BUGGED_MODULE,
                        playerId: currentPlayerId,
                        moduleId: module.id,
                        playerName: currentPlayer.nickname,
                        moduleName: module.name[gameState.language],
                        isValid: true,
                    });
                });
                break;
            case game_1.TargetType.FREE_MODULE:
                currentPlayer.modules
                    .filter(module => module.state === game_1.ModuleState.FREE)
                    .forEach(module => {
                    targets.push({
                        type: game_1.TargetType.FREE_MODULE,
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
function canTargetModuleWithBug(bugCard, targetModule) {
    if (targetModule.state === game_1.ModuleState.STABILIZED) {
        return {
            isValid: false,
            reason: 'Module is stabilized and cannot be targeted',
        };
    }
    if (bugCard.color !== 'multicolor' &&
        targetModule.color !== 'multicolor' &&
        bugCard.color !== targetModule.color) {
        return { isValid: false, reason: 'Bug color does not match module color' };
    }
    if (targetModule.bugs.length > 0 && bugCard.color !== 'multicolor') {
        return { isValid: false, reason: 'Module already has a bug' };
    }
    return { isValid: true };
}
function canTargetModuleWithPatch(patchCard, targetModule) {
    if (patchCard.color !== 'multicolor' &&
        targetModule.color !== 'multicolor' &&
        patchCard.color !== targetModule.color) {
        return {
            isValid: false,
            reason: 'Patch color does not match module color',
        };
    }
    if (targetModule.state === game_1.ModuleState.STABILIZED) {
        return { isValid: false, reason: 'Module is already stabilized' };
    }
    return { isValid: true };
}
function validateTargets(card, targets, gameState, currentPlayerId) {
    const requirements = getCardTargetRequirements(card);
    if (targets.length < requirements.minTargets) {
        return { isValid: false, errorKey: 'targeting.not_enough_targets' };
    }
    if (targets.length > requirements.maxTargets) {
        return { isValid: false, errorKey: 'targeting.too_many_targets' };
    }
    const validTargets = getValidTargets(card, gameState, currentPlayerId);
    for (const target of targets) {
        const isValidTarget = validTargets.some(vt => vt.type === target.type &&
            vt.playerId === target.playerId &&
            vt.moduleId === target.moduleId &&
            vt.isValid);
        if (!isValidTarget) {
            return { isValid: false, errorKey: 'targeting.invalid_target' };
        }
    }
    return { isValid: true };
}
//# sourceMappingURL=targeting.js.map