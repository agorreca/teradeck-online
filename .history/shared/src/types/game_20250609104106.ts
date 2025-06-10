// Player types
export interface Player {
  id: string;
  nickname: string;
  isAI: boolean;
  isHost: boolean;
  isConnected: boolean;
  hand: Card[];
  modules: ModuleCard[];
  skippedTurns: number;
}

export interface PlayerStats {
  health: number;
  mana: number;
  score: number;
}

// Card types based on real TeraDeck rules
export interface Card {
  id: string;
  name: Record<string, string>; // Multi-language support
  description: Record<string, string>; // Multi-language support
  type: CardType;
  color?: ModuleColor;
  effect?: OperationEffect;
}

export interface ModuleCard extends Card {
  type: CardType.MODULE;
  color: ModuleColor;
  state: ModuleState;
  bugs: BugCard[];
  patches: PatchCard[];
  isStabilized: boolean;
}

export interface BugCard extends Card {
  type: CardType.BUG;
  color: ModuleColor | 'multicolor';
}

export interface PatchCard extends Card {
  type: CardType.PATCH;
  color: ModuleColor | 'multicolor';
}

export interface OperationCard extends Card {
  type: CardType.OPERATION;
  effect: OperationEffect;
}

export enum CardType {
  MODULE = 'module',
  BUG = 'bug',
  PATCH = 'patch',
  OPERATION = 'operation',
}

export enum ModuleColor {
  BACKEND = 'backend', // Blue
  FRONTEND = 'frontend', // Yellow
  MOBILE = 'mobile', // Red
  DATA_SCIENCE = 'data_science', // Green
  MULTICOLOR = 'multicolor', // Can be any color
}

export enum ModuleState {
  FREE = 'free', // No bugs or patches
  PATCHED = 'patched', // Has 1 patch, protected
  BUGGED = 'bugged', // Has 1+ bugs, not stable
  STABILIZED = 'stabilized', // Has 2+ patches, permanent protection
}

export enum OperationEffect {
  ARCHITECT_CHANGE = 'architect_change', // Cambio de Arquitecto
  RECRUIT_ACE = 'recruit_ace', // Reclutamiento del Groso
  INTERNAL_PHISHING = 'internal_phishing', // Phishing Interno
  END_YEAR_PARTY = 'end_year_party', // Fiesta de Fin de Año
  PROJECT_SWAP = 'project_swap', // Project Swap
}

// Game state types
export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  deck: Card[];
  discardPile: Card[];
  winner?: string;
  settings: GameSettings;
  lastAction?: GameAction;
  language: Language;
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  PAUSED = 'paused',
}

export interface GameSettings {
  maxPlayers: number;
  aiPlayers: number;
  language: Language;
  aiDifficulty: AIDifficulty;
}

export enum Language {
  SPANISH = 'es',
  ENGLISH = 'en',
}

export enum AIDifficulty {
  EASY = 'easy', // Random valid actions
  NORMAL = 'normal', // Prioritizes modules and attacks leader
  HARD = 'hard', // Optimizes special cards and blocks opponents
}

// Action types
export interface GameAction {
  type: ActionType;
  playerId: string;
  data: ActionData;
  timestamp: number;
}

export type ActionData =
  | PlayCardActionData
  | DiscardCardsActionData
  | PassTurnActionData;

export interface PlayCardActionData {
  card: Card;
  targetPlayerId?: string; // For bugs, patches, operations
  targetModuleId?: string; // For bugs and patches
  swapTargetPlayerId?: string; // For operations like project swap (single target)
  swapPlayerIds?: string[]; // For architect change (two players)
  swapModuleIds?: string[]; // For module swaps
  bugTransfers?: { playerId: string; moduleId: string }[]; // For internal phishing
}

export interface DiscardCardsActionData {
  cards: Card[];
}

export interface PassTurnActionData {
  // No additional data needed
}

export enum ActionType {
  PLAY_CARD = 'play_card',
  DISCARD_CARDS = 'discard_cards',
  DRAW_CARDS = 'draw_cards',
  PASS_TURN = 'pass_turn',
}

// Socket event types
export interface SocketEvents {
  // Client to Server
  'create-room': (settings: GameSettings, nickname: string) => void;
  'join-room': (roomCode: string, nickname: string) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'game-action': (action: GameAction) => void;
  'chat-message': (message: string) => void;
  'change-language': (language: Language) => void;

  // Server to Client
  'room-created': (roomCode: string) => void;
  'room-joined': (gameState: GameState) => void;
  'room-error': (error: string) => void;
  'game-started': (gameState: GameState) => void;
  'game-updated': (gameState: GameState) => void;
  'game-ended': (winner: string, finalState: GameState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'chat-message': (
    playerId: string,
    message: string,
    timestamp: number
  ) => void;
  'language-changed': (language: Language) => void;
  error: (message: string) => void;
}

// Game validation types
export interface PlayValidation {
  isValid: boolean;
  errorKey?: string; // For i18n error messages
  errorParams?: Record<string, any>;
}

// Win condition helper
export interface WinCondition {
  hasWon: boolean;
  modulesCount: number;
  stableModulesCount: number;
  missingModules: ModuleColor[];
}

// Targeting system types
export interface TargetingState {
  isActive: boolean;
  cardBeingPlayed?: Card;
  validTargets: TargetOption[];
  targetType: TargetType;
  requiresTarget: boolean;
}

export interface TargetOption {
  type: TargetType;
  playerId?: string;
  moduleId?: string;
  playerName?: string;
  moduleName?: string;
  isValid: boolean;
  reason?: string; // Why this target is/isn't valid
}

export enum TargetType {
  NONE = 'none',
  PLAYER = 'player',
  MODULE = 'module',
  ENEMY_PLAYER = 'enemy_player',
  ENEMY_MODULE = 'enemy_module',
  OWN_MODULE = 'own_module',
  BUGGED_MODULE = 'bugged_module',
  FREE_MODULE = 'free_module',
  ANY_MODULE = 'any_module',
}

// Enhanced PlayCardActionData with targeting
export interface EnhancedPlayCardActionData extends PlayCardActionData {
  targets?: SelectedTarget[];
}

export interface SelectedTarget {
  type: TargetType;
  playerId?: string;
  moduleId?: string;
}

// Card targeting requirements
export interface CardTargetRequirements {
  cardType: CardType;
  cardEffect?: OperationEffect;
  requiredTargets: TargetType[];
  maxTargets: number;
  minTargets: number;
  description: Record<string, string>; // Multi-language targeting instructions
}
