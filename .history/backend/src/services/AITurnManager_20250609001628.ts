import { EventEmitter } from 'events';
import {
  AIDifficulty,
  GameState,
  Player,
} from '../../../shared/src/types/game';
import { AIDecision, AIService } from './AIService';

export interface AITurnConfig {
  /** Delay before AI makes a decision (in milliseconds) */
  decisionDelay: number;
  /** Whether to log AI reasoning for debugging */
  logReasoning: boolean;
  /** Maximum thinking time for Hard AI */
  maxThinkingTime: number;
}

export class AITurnManager extends EventEmitter {
  private turnTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: AITurnConfig;

  constructor(config: Partial<AITurnConfig> = {}) {
    super();
    this.config = {
      decisionDelay: 1500, // 1.5 seconds default
      logReasoning: true,
      maxThinkingTime: 5000, // 5 seconds max for Hard AI
      ...config,
    };
  }

  /**
   * Handles an AI player's turn
   */
  handleAITurn(gameState: GameState, aiPlayer: Player): void {
    if (!aiPlayer.isAI) {
      throw new Error('Player is not an AI');
    }

    // Clear any existing timer for this player
    this.clearTurnTimer(aiPlayer.id);

    // Calculate thinking time based on difficulty
    const thinkingTime = this.calculateThinkingTime(
      gameState.settings.aiDifficulty
    );

    console.log(`AI ${aiPlayer.nickname} is thinking... (${thinkingTime}ms)`);

    // Set timer for AI decision
    const timer = setTimeout(() => {
      this.makeAIDecision(gameState, aiPlayer);
    }, thinkingTime);

    this.turnTimers.set(aiPlayer.id, timer);
  }

  /**
   * Forces an AI to make an immediate decision (for testing or urgent situations)
   */
  forceAIDecision(gameState: GameState, aiPlayer: Player): AIDecision {
    this.clearTurnTimer(aiPlayer.id);
    return this.makeAIDecision(gameState, aiPlayer);
  }

  /**
   * Cancels any pending AI turns (game ended, player disconnected, etc.)
   */
  cancelAllAITurns(): void {
    this.turnTimers.forEach(timer => clearTimeout(timer));
    this.turnTimers.clear();
  }

  /**
   * Cancels a specific AI player's turn
   */
  cancelAITurn(playerId: string): void {
    this.clearTurnTimer(playerId);
  }

  /**
   * Makes the actual AI decision and emits the result
   */
  private makeAIDecision(gameState: GameState, aiPlayer: Player): AIDecision {
    try {
      const decision = AIService.makeDecision(
        gameState,
        aiPlayer,
        gameState.settings.aiDifficulty
      );

      if (this.config.logReasoning && decision.reasoning) {
        console.log(`AI ${aiPlayer.nickname}: ${decision.reasoning}`);
      }

      // Emit the decision for the game engine to process
      this.emit('ai-decision', {
        playerId: aiPlayer.id,
        decision,
        gameState,
      });

      this.clearTurnTimer(aiPlayer.id);
      return decision;
    } catch (error) {
      console.error(
        `Error making AI decision for ${aiPlayer.nickname}:`,
        error
      );

      // Fallback: emit a pass turn action
      const fallbackDecision: AIDecision = {
        action: {
          type: 'pass_turn' as any,
          playerId: aiPlayer.id,
          data: {},
          timestamp: Date.now(),
        },
        reasoning: 'Error fallback: passing turn',
      };

      this.emit('ai-decision', {
        playerId: aiPlayer.id,
        decision: fallbackDecision,
        gameState,
      });

      return fallbackDecision;
    }
  }

  /**
   * Calculates thinking time based on AI difficulty and game state
   */
  private calculateThinkingTime(difficulty: AIDifficulty): number {
    const baseDelay = this.config.decisionDelay;

    switch (difficulty) {
      case AIDifficulty.EASY:
        // Quick decisions, appears more impulsive
        return baseDelay * 0.5; // 750ms default

      case AIDifficulty.NORMAL:
        // Standard thinking time
        return baseDelay; // 1500ms default

      case AIDifficulty.HARD:
        // Longer thinking time, appears more strategic
        return Math.min(baseDelay * 2, this.config.maxThinkingTime); // 3000ms default

      default:
        return baseDelay;
    }
  }

  /**
   * Clears a specific player's turn timer
   */
  private clearTurnTimer(playerId: string): void {
    const timer = this.turnTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.turnTimers.delete(playerId);
    }
  }

  /**
   * Gets the current status of AI turns
   */
  getAIStatus(): { playerId: string; isThinking: boolean }[] {
    const status: { playerId: string; isThinking: boolean }[] = [];

    this.turnTimers.forEach((timer, playerId) => {
      status.push({
        playerId,
        isThinking: true,
      });
    });

    return status;
  }

  /**
   * Updates AI configuration
   */
  updateConfig(newConfig: Partial<AITurnConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup method for when the manager is no longer needed
   */
  destroy(): void {
    this.cancelAllAITurns();
    this.removeAllListeners();
  }
}
