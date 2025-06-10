import { createTeraDeckDeck, shuffleDeck } from '../constants/cards';
import {
  ActionType,
  BugCard,
  Card,
  CardType,
  DiscardCardsActionData,
  GameAction,
  GameState,
  ModuleCard,
  ModuleColor,
  OperationCard,
  PatchCard,
  PlayCardActionData,
  Player,
  PlayValidation,
  WinCondition,
} from '../types/game';
import {
  applyBug,
  applyOperation,
  applyPatch,
  placeModule,
} from './cardEffects';

// Game initialization
export function initializeGame(players: Player[]): GameState {
  const deck = createTeraDeckDeck();
  const gameState: GameState = {
    id: generateGameId(),
    status: 'waiting' as any,
    players: players.map(p => ({
      ...p,
      hand: [],
      modules: [],
      skippedTurns: 0,
    })),
    currentPlayerIndex: 0,
    turn: 1,
    deck,
    discardPile: [],
    settings: {
      maxPlayers: 6,
      aiPlayers: 0,
      language: 'es' as any,
      aiDifficulty: 'normal' as any,
    },
    language: 'es' as any,
  };

  // Deal initial cards (3 to each player)
  dealInitialCards(gameState);

  return gameState;
}

export function dealInitialCards(gameState: GameState): void {
  gameState.players.forEach(player => {
    player.hand = [];
    for (let i = 0; i < 3; i++) {
      const card = drawCard(gameState);
      if (card) {
        player.hand.push(card);
      }
    }
  });
}

export function drawCard(gameState: GameState): Card | null {
  if (gameState.deck.length === 0) {
    // Reshuffle discard pile if deck is empty
    if (gameState.discardPile.length > 0) {
      gameState.deck = shuffleDeck([...gameState.discardPile]);
      gameState.discardPile = [];
    } else {
      return null; // No more cards available
    }
  }

  return gameState.deck.pop() || null;
}

export function drawCardsToHand(gameState: GameState, playerId: string): void {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return;

  // Draw cards until player has 3 in hand
  while (player.hand.length < 3) {
    const card = drawCard(gameState);
    if (!card) break;
    player.hand.push(card);
  }
}

// Turn management
export function getCurrentPlayer(gameState: GameState): Player | null {
  return gameState.players[gameState.currentPlayerIndex] || null;
}

export function advanceTurn(gameState: GameState): void {
  const currentPlayer = getCurrentPlayer(gameState);

  // Skip players who have skipped turns
  if (currentPlayer && currentPlayer.skippedTurns > 0) {
    currentPlayer.skippedTurns--;
  }

  // Move to next player
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.length;

  // If we've completed a full round, increment turn
  if (gameState.currentPlayerIndex === 0) {
    gameState.turn++;
  }

  // Draw cards for the new current player
  const newCurrentPlayer = getCurrentPlayer(gameState);
  if (newCurrentPlayer) {
    drawCardsToHand(gameState, newCurrentPlayer.id);
  }
}

// ===============================
// 🎮 MAIN GAME ACTION PROCESSOR
// ===============================

export function processGameAction(
  gameState: GameState,
  action: GameAction
): PlayValidation {
  switch (action.type) {
    case ActionType.PLAY_CARD:
      return processPlayCard(
        gameState,
        action.playerId,
        action.data as PlayCardActionData
      );
    case ActionType.DISCARD_CARDS:
      return processDiscardCards(
        gameState,
        action.playerId,
        action.data as DiscardCardsActionData
      );
    case ActionType.PASS_TURN:
      return processPassTurn(gameState, action.playerId);
    default:
      return { isValid: false, errorKey: 'errors.invalidActionType' };
  }
}

function processPlayCard(
  gameState: GameState,
  playerId: string,
  actionData: PlayCardActionData
): PlayValidation {
  const validation = validatePlayCard(
    gameState,
    playerId,
    actionData.card,
    actionData
  );
  if (!validation.isValid) {
    return validation;
  }

  let result: PlayValidation = { isValid: false };

  // Execute card effect based on type
  switch (actionData.card.type) {
    case CardType.MODULE:
      result = placeModule(gameState, playerId, actionData.card as ModuleCard);
      break;
    case CardType.BUG:
      result = applyBug(
        gameState,
        playerId,
        actionData.card as BugCard,
        actionData
      );
      break;
    case CardType.PATCH:
      result = applyPatch(
        gameState,
        playerId,
        actionData.card as PatchCard,
        actionData
      );
      break;
    case CardType.OPERATION:
      result = applyOperation(
        gameState,
        playerId,
        actionData.card as OperationCard,
        actionData
      );
      break;
    default:
      return { isValid: false, errorKey: 'errors.invalidCardType' };
  }

  if (result.isValid) {
    // Draw cards to maintain hand size
    drawCardsToHand(gameState, playerId);

    // Check for win condition
    const winCondition = checkWinCondition(gameState);
    if (winCondition?.hasWon) {
      gameState.status = 'finished' as any;
      gameState.winner = playerId;
      return { isValid: true };
    }

    // Advance turn
    advanceTurn(gameState);
  }

  return result;
}

function processDiscardCards(
  gameState: GameState,
  playerId: string,
  actionData: DiscardCardsActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  const currentPlayer = getCurrentPlayer(gameState);

  if (!player || !currentPlayer || currentPlayer.id !== playerId) {
    return { isValid: false, errorKey: 'errors.notYourTurn' };
  }

  if (player.skippedTurns > 0) {
    return { isValid: false, errorKey: 'errors.playerSkippedTurn' };
  }

  if (actionData.cards.length === 0 || actionData.cards.length > 3) {
    return { isValid: false, errorKey: 'errors.invalidDiscardCount' };
  }

  // Validate that all cards are in player's hand
  const validCards = actionData.cards.every(card =>
    player.hand.some(handCard => handCard.id === card.id)
  );

  if (!validCards) {
    return { isValid: false, errorKey: 'errors.cardNotInHand' };
  }

  // Discard the cards
  actionData.cards.forEach(card => {
    const cardIndex = player.hand.findIndex(c => c.id === card.id);
    if (cardIndex >= 0) {
      player.hand.splice(cardIndex, 1);
      gameState.discardPile.push(card);
    }
  });

  // Draw the same number of cards
  for (let i = 0; i < actionData.cards.length; i++) {
    const newCard = drawCard(gameState);
    if (newCard) {
      player.hand.push(newCard);
    }
  }

  // Advance turn
  advanceTurn(gameState);

  return { isValid: true };
}

function processPassTurn(
  gameState: GameState,
  playerId: string
): PlayValidation {
  const currentPlayer = getCurrentPlayer(gameState);

  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { isValid: false, errorKey: 'errors.notYourTurn' };
  }

  // Draw cards to hand if needed
  drawCardsToHand(gameState, playerId);

  // Advance turn
  advanceTurn(gameState);

  return { isValid: true };
}

// Card validation
export function validatePlayCard(
  gameState: GameState,
  playerId: string,
  card: Card,
  actionData: PlayCardActionData
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  const currentPlayer = getCurrentPlayer(gameState);

  if (!player) {
    return { isValid: false, errorKey: 'errors.playerNotFound' };
  }

  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { isValid: false, errorKey: 'errors.notYourTurn' };
  }

  if (!player.hand.find(c => c.id === card.id)) {
    return { isValid: false, errorKey: 'errors.cardNotInHand' };
  }

  // Skip turn validation if player has skipped turns
  if (player.skippedTurns > 0) {
    return { isValid: false, errorKey: 'errors.playerSkippedTurn' };
  }

  // Validate specific card type actions
  switch (card.type) {
    case CardType.MODULE:
      return validateModulePlay(gameState, playerId, card as ModuleCard);
    case CardType.BUG:
      return validateBugPlay(gameState, playerId, card as BugCard, actionData);
    case CardType.PATCH:
      return validatePatchPlay(
        gameState,
        playerId,
        card as PatchCard,
        actionData
      );
    case CardType.OPERATION:
      return validateOperationPlay(
        gameState,
        playerId,
        card as OperationCard,
        actionData
      );
    default:
      return { isValid: false, errorKey: 'errors.invalidCardType' };
  }
}

export function validateModulePlay(
  gameState: GameState,
  playerId: string,
  card: ModuleCard
): PlayValidation {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return { isValid: false, errorKey: 'errors.playerNotFound' };

  // Check if player already has a module of this type (unless multicolor)
  if (card.color !== ModuleColor.MULTICOLOR) {
    const hasModuleOfType = player.modules.some(
      m =>
        m.color === card.color ||
        (m.color === ModuleColor.MULTICOLOR &&
          card.color !== ModuleColor.MULTICOLOR)
    );

    if (hasModuleOfType) {
      return { isValid: false, errorKey: 'errors.cannotPlaceDuplicate' };
    }
  }

  return { isValid: true };
}

export function validateBugPlay(
  gameState: GameState,
  _playerId: string,
  card: BugCard,
  actionData: PlayCardActionData
): PlayValidation {
  if (!actionData.targetPlayerId || !actionData.targetModuleId) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const targetPlayer = gameState.players.find(
    p => p.id === actionData.targetPlayerId
  );
  if (!targetPlayer) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const targetModule = targetPlayer.modules.find(
    m => m.id === actionData.targetModuleId
  );
  if (!targetModule) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Can't bug a stabilized module
  if (targetModule.isStabilized) {
    return { isValid: false, errorKey: 'errors.moduleAlreadyStable' };
  }

  // Bug color must match module color, or either card must be multicolor
  if (
    card.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    card.color !== targetModule.color
  ) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  return { isValid: true };
}

export function validatePatchPlay(
  gameState: GameState,
  _playerId: string,
  card: PatchCard,
  actionData: PlayCardActionData
): PlayValidation {
  if (!actionData.targetPlayerId || !actionData.targetModuleId) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const targetPlayer = gameState.players.find(
    p => p.id === actionData.targetPlayerId
  );
  if (!targetPlayer) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  const targetModule = targetPlayer.modules.find(
    m => m.id === actionData.targetModuleId
  );
  if (!targetModule) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  // Patch color must match module color, or either card must be multicolor
  if (
    card.color !== 'multicolor' &&
    targetModule.color !== 'multicolor' &&
    card.color !== targetModule.color
  ) {
    return { isValid: false, errorKey: 'errors.invalidTarget' };
  }

  return { isValid: true };
}

export function validateOperationPlay(
  gameState: GameState,
  playerId: string,
  card: OperationCard,
  actionData: PlayCardActionData
): PlayValidation {
  // Operation-specific validation would go here
  // For now, operations are always valid to play
  return { isValid: true };
}

// Win condition checking
export function checkWinCondition(gameState: GameState): WinCondition | null {
  for (const player of gameState.players) {
    const winCondition = checkPlayerWinCondition(player);
    if (winCondition.hasWon) {
      return winCondition;
    }
  }
  return null;
}

export function checkPlayerWinCondition(player: Player): WinCondition {
  const stableModules = player.modules.filter(
    module => module.bugs.length === 0 // Module is stable if it has no bugs
  );

  const moduleTypes = new Set(stableModules.map(m => m.color));
  const hasAllTypes = moduleTypes.size >= 4 && stableModules.length >= 4;

  // Check if player has at least one of each type (accounting for multicolor)
  const requiredTypes = [
    ModuleColor.BACKEND,
    ModuleColor.FRONTEND,
    ModuleColor.MOBILE,
    ModuleColor.DATA_SCIENCE,
  ];
  const missingTypes: ModuleColor[] = [];

  for (const type of requiredTypes) {
    const hasType = stableModules.some(
      m => m.color === type || m.color === ModuleColor.MULTICOLOR
    );
    if (!hasType) {
      missingTypes.push(type);
    }
  }

  return {
    hasWon: hasAllTypes && missingTypes.length === 0,
    modulesCount: player.modules.length,
    stableModulesCount: stableModules.length,
    missingModules: missingTypes,
  };
}

// Utility functions
function generateGameId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getPlayerById(
  gameState: GameState,
  playerId: string
): Player | null {
  return gameState.players.find(p => p.id === playerId) || null;
}

export function isPlayerTurn(gameState: GameState, playerId: string): boolean {
  const currentPlayer = getCurrentPlayer(gameState);
  return currentPlayer?.id === playerId;
}
