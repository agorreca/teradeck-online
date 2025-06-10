import {
  AIDifficulty,
  ActionType,
  CardType,
  DiscardCardsActionData,
  GameAction,
  GameState,
  ModuleColor,
  ModuleState,
  PlayCardActionData,
  Player,
} from '../../../shared/src/types/game';
import {
  cardRequiresTarget,
  getValidTargets,
} from '../../../shared/src/utils/targeting';

export interface AIDecision {
  action: GameAction;
  reasoning?: string; // For debugging/logging
}

export class AIService {
  /**
   * Makes a decision for an AI player based on their difficulty level
   */
  static makeDecision(
    gameState: GameState,
    aiPlayer: Player,
    difficulty: AIDifficulty
  ): AIDecision {
    switch (difficulty) {
      case AIDifficulty.EASY:
        return this.makeEasyDecision(gameState, aiPlayer);
      case AIDifficulty.NORMAL:
        return this.makeNormalDecision(gameState, aiPlayer);
      case AIDifficulty.HARD:
        return this.makeHardDecision(gameState, aiPlayer);
      default:
        return this.makeEasyDecision(gameState, aiPlayer);
    }
  }

  /**
   * Easy AI: Makes random valid moves
   */
  private static makeEasyDecision(
    gameState: GameState,
    aiPlayer: Player
  ): AIDecision {
    const validActions = this.getValidActions(gameState, aiPlayer);

    if (validActions.length === 0) {
      return this.createPassAction(aiPlayer);
    }

    // Random selection
    const randomAction =
      validActions[Math.floor(Math.random() * validActions.length)];

    return {
      action: randomAction,
      reasoning: `Easy AI: Random action selected (${randomAction.type})`,
    };
  }

  /**
   * Normal AI: Prioritizes modules and attacks the leader
   */
  private static makeNormalDecision(
    gameState: GameState,
    aiPlayer: Player
  ): AIDecision {
    const validActions = this.getValidActions(gameState, aiPlayer);

    if (validActions.length === 0) {
      return this.createPassAction(aiPlayer);
    }

    // Priority order: Modules > Patches > Bugs targeting leader > Operations > Discard
    const moduleActions = validActions.filter(a => this.isModuleAction(a));
    const patchActions = validActions.filter(a => this.isPatchAction(a));
    const bugActions = validActions.filter(a => this.isBugAction(a));
    const operationActions = validActions.filter(a =>
      this.isOperationAction(a)
    );
    const discardActions = validActions.filter(
      a => a.type === ActionType.DISCARD_CARDS
    );

    // 1. Play modules if available
    if (moduleActions.length > 0) {
      const selectedAction = this.selectBestModule(moduleActions, aiPlayer);
      return {
        action: selectedAction,
        reasoning: 'Normal AI: Playing module to advance towards victory',
      };
    }

    // 2. Patch own bugged modules
    const buggedModules = aiPlayer.modules.filter(
      m => m.state === ModuleState.BUGGED
    );
    if (patchActions.length > 0 && buggedModules.length > 0) {
      const patchAction = patchActions[0]; // Simple selection for now
      return {
        action: patchAction,
        reasoning: 'Normal AI: Patching own bugged module',
      };
    }

    // 3. Attack the current leader with bugs
    const leader = this.getGameLeader(gameState, aiPlayer);
    const bugActionsAgainstLeader = bugActions.filter(
      a => this.getActionTargetPlayerId(a) === leader?.id
    );

    if (bugActionsAgainstLeader.length > 0) {
      return {
        action: bugActionsAgainstLeader[0],
        reasoning: 'Normal AI: Attacking game leader with bug',
      };
    }

    // 4. Use beneficial operations
    if (operationActions.length > 0) {
      const beneficialOperation = this.selectBeneficialOperation(
        operationActions,
        gameState,
        aiPlayer
      );
      if (beneficialOperation) {
        return {
          action: beneficialOperation,
          reasoning: 'Normal AI: Using beneficial operation',
        };
      }
    }

    // 5. Attack any opponent with bugs
    if (bugActions.length > 0) {
      return {
        action: bugActions[0],
        reasoning: 'Normal AI: Attacking opponent with bug',
      };
    }

    // 6. Discard if hand is full
    if (aiPlayer.hand.length > 3 && discardActions.length > 0) {
      return {
        action: discardActions[0],
        reasoning: 'Normal AI: Discarding excess cards',
      };
    }

    // Fallback to random action
    return {
      action: validActions[Math.floor(Math.random() * validActions.length)],
      reasoning: 'Normal AI: Fallback to random action',
    };
  }

  /**
   * Hard AI: Advanced strategy with optimization and blocking
   */
  private static makeHardDecision(
    gameState: GameState,
    aiPlayer: Player
  ): AIDecision {
    const validActions = this.getValidActions(gameState, aiPlayer);

    if (validActions.length === 0) {
      return this.createPassAction(aiPlayer);
    }

    // Advanced strategy considerations
    const gamePhase = this.analyzeGamePhase(gameState, aiPlayer);
    const threats = this.analyzeThreatLevel(gameState, aiPlayer);
    const opportunities = this.analyzeOpportunities(gameState, aiPlayer);

    // Early game: Focus on modules and defense
    if (gamePhase === 'early') {
      return this.makeEarlyGameDecision(validActions, aiPlayer, threats);
    }

    // Mid game: Balance offense and defense
    if (gamePhase === 'mid') {
      return this.makeMidGameDecision(
        validActions,
        gameState,
        aiPlayer,
        threats,
        opportunities
      );
    }

    // Late game: Aggressive play to win or block opponents
    return this.makeLateGameDecision(
      validActions,
      gameState,
      aiPlayer,
      threats
    );
  }

  /**
   * Get all valid actions for a player
   */
  private static getValidActions(
    gameState: GameState,
    player: Player
  ): GameAction[] {
    const actions: GameAction[] = [];
    const timestamp = Date.now();

    // Try to play each card in hand
    player.hand.forEach(card => {
      if (cardRequiresTarget(card)) {
        const validTargets = getValidTargets(card, gameState, player.id);
        validTargets.forEach(target => {
          if (target.isValid) {
            const actionData: PlayCardActionData = {
              card,
              targetPlayerId: target.playerId,
              targetModuleId: target.moduleId,
            };

            actions.push({
              type: ActionType.PLAY_CARD,
              playerId: player.id,
              data: actionData,
              timestamp,
            });
          }
        });
      } else {
        // Card doesn't need targeting
        const actionData: PlayCardActionData = { card };
        actions.push({
          type: ActionType.PLAY_CARD,
          playerId: player.id,
          data: actionData,
          timestamp,
        });
      }
    });

    // Discard actions (1-3 cards)
    if (player.hand.length > 0) {
      for (let i = 1; i <= Math.min(3, player.hand.length); i++) {
        const cardsToDiscard = player.hand.slice(0, i);
        const actionData: DiscardCardsActionData = { cards: cardsToDiscard };

        actions.push({
          type: ActionType.DISCARD_CARDS,
          playerId: player.id,
          data: actionData,
          timestamp,
        });
      }
    }

    return actions;
  }

  /**
   * Helper methods for action analysis
   */
  private static isModuleAction(action: GameAction): boolean {
    return (
      action.type === ActionType.PLAY_CARD &&
      (action.data as PlayCardActionData).card.type === CardType.MODULE
    );
  }

  private static isPatchAction(action: GameAction): boolean {
    return (
      action.type === ActionType.PLAY_CARD &&
      (action.data as PlayCardActionData).card.type === CardType.PATCH
    );
  }

  private static isBugAction(action: GameAction): boolean {
    return (
      action.type === ActionType.PLAY_CARD &&
      (action.data as PlayCardActionData).card.type === CardType.BUG
    );
  }

  private static isOperationAction(action: GameAction): boolean {
    return (
      action.type === ActionType.PLAY_CARD &&
      (action.data as PlayCardActionData).card.type === CardType.OPERATION
    );
  }

  private static getActionTargetPlayerId(
    action: GameAction
  ): string | undefined {
    if (action.type === ActionType.PLAY_CARD) {
      return (action.data as PlayCardActionData).targetPlayerId;
    }
    return undefined;
  }

  private static selectBestModule(
    moduleActions: GameAction[],
    aiPlayer: Player
  ): GameAction {
    // Prefer modules that complete different types
    const existingColors = aiPlayer.modules.map(m => m.color);
    const newModuleActions = moduleActions.filter(action => {
      const card = (action.data as PlayCardActionData).card;
      return !existingColors.includes(card.color as ModuleColor);
    });

    return newModuleActions.length > 0 ? newModuleActions[0] : moduleActions[0];
  }

  private static getGameLeader(
    gameState: GameState,
    excludePlayer: Player
  ): Player | null {
    const otherPlayers = gameState.players.filter(
      p => p.id !== excludePlayer.id
    );
    return otherPlayers.reduce(
      (leader, player) => {
        const playerStableModules = player.modules.filter(
          m => m.state === ModuleState.STABILIZED
        ).length;
        const leaderStableModules = leader
          ? leader.modules.filter(m => m.state === ModuleState.STABILIZED)
              .length
          : 0;

        return playerStableModules > leaderStableModules ? player : leader;
      },
      null as Player | null
    );
  }

  private static selectBeneficialOperation(
    operationActions: GameAction[],
    _gameState: GameState,
    _aiPlayer: Player
  ): GameAction | null {
    // Simple heuristic: prefer operations that benefit us most
    // This would be expanded with specific logic for each operation type
    return operationActions[0] || null;
  }

  private static analyzeGamePhase(
    gameState: GameState,
    _aiPlayer: Player
  ): 'early' | 'mid' | 'late' {
    const maxModules = Math.max(
      ...gameState.players.map(p => p.modules.length)
    );

    if (maxModules <= 1) return 'early';
    if (maxModules <= 2) return 'mid';
    return 'late';
  }

  private static analyzeThreatLevel(
    gameState: GameState,
    aiPlayer: Player
  ): 'low' | 'medium' | 'high' {
    const otherPlayers = gameState.players.filter(p => p.id !== aiPlayer.id);
    const maxStableModules = Math.max(
      ...otherPlayers.map(
        p => p.modules.filter(m => m.state === ModuleState.STABILIZED).length
      )
    );

    if (maxStableModules >= 3) return 'high';
    if (maxStableModules >= 2) return 'medium';
    return 'low';
  }

  private static analyzeOpportunities(
    gameState: GameState,
    aiPlayer: Player
  ): string[] {
    const opportunities: string[] = [];

    // Check if we can win next turn
    const stableModules = aiPlayer.modules.filter(
      m => m.state === ModuleState.STABILIZED
    ).length;
    if (stableModules >= 3) {
      opportunities.push('can_win');
    }

    // Check if we can block someone from winning
    const leader = this.getGameLeader(gameState, aiPlayer);
    if (
      leader &&
      leader.modules.filter(m => m.state === ModuleState.STABILIZED).length >= 3
    ) {
      opportunities.push('block_leader');
    }

    return opportunities;
  }

  private static makeEarlyGameDecision(
    validActions: GameAction[],
    aiPlayer: Player,
    _threats: string
  ): AIDecision {
    // Focus on modules in early game
    const moduleActions = validActions.filter(a => this.isModuleAction(a));
    if (moduleActions.length > 0) {
      return {
        action: this.selectBestModule(moduleActions, aiPlayer),
        reasoning: 'Hard AI: Early game module focus',
      };
    }

    return {
      action: validActions[0],
      reasoning: 'Hard AI: Early game fallback',
    };
  }

  private static makeMidGameDecision(
    validActions: GameAction[],
    _gameState: GameState,
    _aiPlayer: Player,
    _threats: string,
    opportunities: string[]
  ): AIDecision {
    // Balance strategy in mid game
    if (opportunities.includes('can_win')) {
      const moduleActions = validActions.filter(a => this.isModuleAction(a));
      if (moduleActions.length > 0) {
        return {
          action: moduleActions[0],
          reasoning: 'Hard AI: Going for the win',
        };
      }
    }

    return {
      action: validActions[0],
      reasoning: 'Hard AI: Mid game balanced play',
    };
  }

  private static makeLateGameDecision(
    validActions: GameAction[],
    _gameState: GameState,
    _aiPlayer: Player,
    threats: string
  ): AIDecision {
    // Aggressive late game play
    if (threats === 'high') {
      const bugActions = validActions.filter(a => this.isBugAction(a));
      if (bugActions.length > 0) {
        return {
          action: bugActions[0],
          reasoning: 'Hard AI: Blocking opponents in late game',
        };
      }
    }

    return {
      action: validActions[0],
      reasoning: 'Hard AI: Late game aggressive play',
    };
  }

  private static createPassAction(player: Player): AIDecision {
    return {
      action: {
        type: ActionType.PASS_TURN,
        playerId: player.id,
        data: {},
        timestamp: Date.now(),
      },
      reasoning: 'AI: No valid actions available, passing turn',
    };
  }
}
