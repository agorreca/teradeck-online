import {
  AIDifficulty,
  Card,
  ModuleCard,
  Player,
} from '../../../shared/src/types/game';

// App-specific types - extending real game types for UI needs
export interface AppPlayer extends Player {
  // Compatibility property for existing UI code
  name?: string; // Will be derived from nickname
  isActive?: boolean; // UI state for turn indication
}

export interface LanguageStrings {
  es: string;
  en: string;
}

export interface AppState {
  currentScreen: 'landing' | 'game' | 'settings';
  currentPlayer: string;
  players: AppPlayer[];
}

// Re-export game types for convenience
export type GameCard = Card;
export type GameModule = ModuleCard;
export type GameDifficulty = AIDifficulty;

// UI-specific types
export interface GameUIState {
  selectedCard: string | null;
  hoveredCard: string | null;
  showGameRules: boolean;
  showSettings: boolean;
  animationsEnabled: boolean;
}

// Compatibility interface for existing code that expects simpler structure
export interface SimpleModule {
  id: string;
  name: string;
  description: string;
  color: string;
  state: string;
  bugs: number;
  patches: number;
}

// Helper to convert real game types to simple types for UI
export function moduleToSimple(module: ModuleCard): SimpleModule {
  return {
    id: module.id,
    name:
      typeof module.name === 'object'
        ? module.name.es || module.name.en || ''
        : module.name,
    description:
      typeof module.description === 'object'
        ? module.description.es || module.description.en || ''
        : module.description,
    color: module.color,
    state: module.state,
    bugs: module.bugs.length,
    patches: module.patches.length,
  };
}
