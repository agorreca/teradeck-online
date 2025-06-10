import {
  ActionType,
  AIDifficulty,
  CardType,
  DiscardCardsActionData,
  GameSettings,
  Language,
  ModuleColor,
} from '../../shared/src/types/game';
import { GameManager } from '../src/services/GameManager';

describe('GameManager - Discard Cards Functionality', () => {
  let gameManager: GameManager;
  let roomCode: string;
  let hostId: string;
  let player2Id: string;

  beforeEach(() => {
    gameManager = new GameManager();
    hostId = 'host-123';
    player2Id = 'player-456';

    const settings: GameSettings = {
      maxPlayers: 6,
      aiPlayers: 0,
      language: Language.SPANISH,
      aiDifficulty: AIDifficulty.NORMAL,
    };

    roomCode = gameManager.createRoom(settings, hostId, 'Host Player');
    gameManager.joinRoom(roomCode, player2Id, 'Player 2');
    gameManager.startGame(roomCode, hostId);
  });

  describe('Discard Cards Action', () => {
    test('should allow discarding 1 card', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      // Ensure host has cards in hand
      const initialHandSize = hostPlayer.hand.length;
      expect(initialHandSize).toBeGreaterThan(0);

      const cardToDiscard = hostPlayer.hand[0];
      const initialDiscardPileSize = gameState.discardPile.length;

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: [cardToDiscard],
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, discardAction);
      const updatedPlayer = result.players.find(p => p.id === hostId)!;

      // Card should be removed from hand
      expect(updatedPlayer.hand).toHaveLength(initialHandSize - 1);
      expect(
        updatedPlayer.hand.find(c => c.id === cardToDiscard.id)
      ).toBeUndefined();

      // Card should be added to discard pile
      expect(result.discardPile).toHaveLength(initialDiscardPileSize + 1);
      expect(
        result.discardPile.find(c => c.id === cardToDiscard.id)
      ).toBeDefined();

      // Player should draw back to 3 cards
      expect(updatedPlayer.hand).toHaveLength(3);

      // Turn should advance
      expect(result.currentPlayerIndex).not.toBe(gameState.currentPlayerIndex);
    });

    test('should allow discarding 2 cards', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      const cardsToDiscard = hostPlayer.hand.slice(0, 2);
      const initialDiscardPileSize = gameState.discardPile.length;

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: cardsToDiscard,
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, discardAction);
      const updatedPlayer = result.players.find(p => p.id === hostId)!;

      // Cards should be removed from hand and added to discard pile
      expect(result.discardPile).toHaveLength(initialDiscardPileSize + 2);
      cardsToDiscard.forEach(card => {
        expect(updatedPlayer.hand.find(c => c.id === card.id)).toBeUndefined();
        expect(result.discardPile.find(c => c.id === card.id)).toBeDefined();
      });

      // Player should draw back to 3 cards
      expect(updatedPlayer.hand).toHaveLength(3);
    });

    test('should allow discarding 3 cards', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      const cardsToDiscard = hostPlayer.hand.slice(0, 3);
      const initialDiscardPileSize = gameState.discardPile.length;

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: cardsToDiscard,
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, discardAction);
      const updatedPlayer = result.players.find(p => p.id === hostId)!;

      // All 3 cards should be discarded
      expect(result.discardPile).toHaveLength(initialDiscardPileSize + 3);
      cardsToDiscard.forEach(card => {
        expect(updatedPlayer.hand.find(c => c.id === card.id)).toBeUndefined();
        expect(result.discardPile.find(c => c.id === card.id)).toBeDefined();
      });

      // Player should draw back to 3 cards
      expect(updatedPlayer.hand).toHaveLength(3);
    });

    test('should reject discarding 0 cards', () => {
      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: [],
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, discardAction)).toThrow(
        'Must discard between 1 and 3 cards'
      );
    });

    test('should reject discarding more than 3 cards', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      // Add extra cards to hand to have more than 3
      const extraCard = {
        id: 'extra-card',
        name: { es: 'Carta Extra', en: 'Extra Card' },
        description: { es: 'Carta de prueba', en: 'Test card' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
      };
      hostPlayer.hand.push(extraCard);

      const cardsToDiscard = hostPlayer.hand.slice(0, 4);

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: cardsToDiscard,
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, discardAction)).toThrow(
        'Must discard between 1 and 3 cards'
      );
    });

    test('should reject discarding cards not in hand', () => {
      const fakeCard = {
        id: 'fake-card',
        name: { es: 'Carta Falsa', en: 'Fake Card' },
        description: { es: 'No está en la mano', en: 'Not in hand' },
        type: CardType.MODULE,
        color: ModuleColor.BACKEND,
      };

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: [fakeCard],
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, discardAction)).toThrow(
        'Card not found in player hand'
      );
    });

    test('should reject discard action when not player turn', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const player2 = gameState.players.find(p => p.id === player2Id)!;

      // Make sure it's not player2's turn
      expect(gameState.players[gameState.currentPlayerIndex].id).not.toBe(
        player2Id
      );

      const cardToDiscard = player2.hand[0];

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: player2Id,
        data: {
          cards: [cardToDiscard],
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      expect(() => gameManager.processAction(roomCode, discardAction)).toThrow(
        'Not your turn'
      );
    });

    test('should handle deck recycling when drawing after discard', () => {
      const gameState = gameManager.getRoomState(roomCode)!;
      const hostPlayer = gameState.players.find(p => p.id === hostId)!;

      // Simulate low deck by moving most cards to discard pile
      const cardsToMove = gameState.deck.splice(0, gameState.deck.length - 1);
      gameState.discardPile.push(...cardsToMove);

      // Now deck should have only 1 card left
      expect(gameState.deck).toHaveLength(1);
      expect(gameState.discardPile.length).toBeGreaterThan(10);

      const cardToDiscard = hostPlayer.hand[0];

      const discardAction = {
        type: ActionType.DISCARD_CARDS,
        playerId: hostId,
        data: {
          cards: [cardToDiscard],
        } as DiscardCardsActionData,
        timestamp: Date.now(),
      };

      const result = gameManager.processAction(roomCode, discardAction);
      const updatedPlayer = result.players.find(p => p.id === hostId)!;

      // Player should still have 3 cards (deck should have been recycled)
      expect(updatedPlayer.hand).toHaveLength(3);

      // Deck should have been replenished from discard pile
      expect(result.deck.length).toBeGreaterThan(1);
    });
  });
});
