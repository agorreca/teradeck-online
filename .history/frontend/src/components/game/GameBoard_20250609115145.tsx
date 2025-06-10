import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ActionType,
  Card,
  CardType,
  GameState,
  ModuleCard,
  PlayCardActionData,
  Player,
  TargetOption,
} from '../../../../shared/src/types/game';
import { cardRequiresTarget } from '../../../../shared/src/utils/targeting';
import { useSocket } from '../../hooks/useSocket';
import { useTargeting } from '../../hooks/useTargeting';
import { useTranslation } from '../../hooks/useTranslation';
import { TargetingOverlay } from './TargetingOverlay';

export function GameBoard() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { socket } = useSocket();
  const { t } = useTranslation();
  const targeting = useTargeting();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !roomCode) return;

    // Request current game state when connecting
    socket.on('connect', () => {
      console.log('🎮 Socket connected, requesting game state for:', roomCode);
      socket.emit('get-room-state', roomCode);
    });

    // If already connected, request state immediately
    if (socket.connected) {
      console.log(
        '🎮 Socket already connected, requesting game state for:',
        roomCode
      );
      socket.emit('get-room-state', roomCode);
    }

    const handleGameUpdated = (newGameState: GameState) => {
      setGameState(newGameState);
      // Find current player based on socket ID
      const player = newGameState.players.find(p => p.id === socket.id);
      setCurrentPlayer(player || null);
    };

    const handleRoomState = (newGameState: GameState) => {
      console.log('📥 Received room state in GameBoard:', newGameState);
      setGameState(newGameState);
      // Find current player based on socket ID
      const player = newGameState.players.find(p => p.id === socket.id);
      setCurrentPlayer(player || null);
    };

    const handleGameError = (error: string) => {
      console.error('Game error:', error);
      // Handle error display
    };

    socket.on('game-updated', handleGameUpdated);
    socket.on('room-state', handleRoomState);
    socket.on('error', handleGameError);

    return () => {
      socket.off('game-updated', handleGameUpdated);
      socket.off('room-state', handleRoomState);
      socket.off('error', handleGameError);
    };
  }, [socket, roomCode]);

  // Handle card play
  const handleCardPlay = (card: Card) => {
    if (!gameState || !currentPlayer || !socket) return;

    // Check if card requires targeting
    if (cardRequiresTarget(card)) {
      setSelectedCard(card);
      targeting.startTargeting(card, gameState, currentPlayer.id);
    } else {
      // Play card immediately
      playCard(card, []);
    }
  };

  // Handle targeting confirmation
  const handleTargetingConfirm = () => {
    if (!selectedCard || !targeting.canConfirm) return;

    const success = targeting.confirmTargeting();
    if (success) {
      playCard(selectedCard, targeting.selectedTargets);
      setSelectedCard(null);
    }
  };

  // Handle targeting cancellation
  const handleTargetingCancel = () => {
    targeting.cancelTargeting();
    setSelectedCard(null);
  };

  // Play card with targets
  const playCard = (card: Card, targets: any[]) => {
    if (!socket || !currentPlayer) return;

    const actionData: PlayCardActionData = {
      card,
      targetPlayerId: targets[0]?.playerId,
      targetModuleId: targets[0]?.moduleId,
    };

    socket.emit('game-action', {
      type: ActionType.PLAY_CARD,
      playerId: currentPlayer.id,
      data: actionData,
      timestamp: Date.now(),
    });
  };

  // Handle target selection
  const handleTargetSelect = (target: TargetOption) => {
    targeting.selectTarget(target);
  };

  // Get selected target IDs for overlay
  const getSelectedTargetIds = () => {
    return targeting.selectedTargets.map(t => t.moduleId || t.playerId || '');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-bold text-gray-800 mb-4">🎴 Cargando partida...</h1>
            <p className="text-gray-600">
              Sala: <strong className="text-blue-600">{roomCode}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {socket?.connected ? 'Conectado - Obteniendo datos del juego...' : 'Estableciendo conexión...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentPlayerTurn =
    gameState.currentPlayerIndex ===
    gameState.players.findIndex(p => p.id === currentPlayer.id);

  return (
    <div className="game-board">
      {/* Game Header */}
      <div className="game-header mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎴 TeraDeck Online</h1>
          <div className="text-white">
            <span className="text-sm">Sala: </span>
            <strong>{roomCode}</strong>
          </div>
        </div>

        <div className="mt-4 text-center">
          {isCurrentPlayerTurn ? (
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
              {t('ui.game.yourTurn')}
            </div>
          ) : (
            <div className="bg-gray-500 text-white px-4 py-2 rounded-lg">
              {t('ui.game.waitingTurn')}
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="game-area grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Other Players */}
        <div className="other-players">
          <h2 className="text-lg font-semibold text-white mb-4">
            Otros Jugadores
          </h2>
          <div className="space-y-4">
            {gameState.players
              .filter(p => p.id !== currentPlayer.id)
              .map(player => (
                <div
                  key={player.id}
                  className="player-area bg-white/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">
                      {player.nickname}
                    </span>
                    <span className="text-sm text-white/80">
                      {player.hand.length} cartas
                    </span>
                  </div>

                  {/* Player modules */}
                  <div className="modules-grid grid grid-cols-2 gap-2">
                    {player.modules.map(module => (
                      <div
                        key={module.id}
                        className={`card card-module ${getModuleStateClass(module)}`}
                      >
                        <div className="card-name">
                          {module.name[gameState.language]}
                        </div>
                        <div className="card-type">{t('ui.cards.module')}</div>
                        <div
                          className={`card-color-indicator ${getModuleColorClass(module.color)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Game Board Center */}
        <div className="game-center">
          <div className="text-center text-white mb-4">
            <div className="text-sm">Turno {gameState.turn}</div>
            <div className="text-lg font-semibold">
              Jugador actual:{' '}
              {gameState.players[gameState.currentPlayerIndex]?.nickname}
            </div>
          </div>

          {/* Deck and discard pile */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="deck bg-blue-600 text-white rounded-lg p-4 text-center">
              <div className="text-sm">Mazo</div>
              <div className="text-xl font-bold">{gameState.deck.length}</div>
            </div>
            <div className="discard bg-gray-600 text-white rounded-lg p-4 text-center">
              <div className="text-sm">Descarte</div>
              <div className="text-xl font-bold">
                {gameState.discardPile.length}
              </div>
            </div>
          </div>
        </div>

        {/* Current Player Area */}
        <div className="current-player">
          <h2 className="text-lg font-semibold text-white mb-4">Tu Área</h2>

          {/* Player modules */}
          <div className="player-modules mb-6">
            <h3 className="text-white mb-2">
              Tus Módulos ({currentPlayer.modules.length}/4)
            </h3>
            <div className="modules-grid grid grid-cols-2 gap-2">
              {currentPlayer.modules.map(module => (
                <div
                  key={module.id}
                  className={`card card-module ${getModuleStateClass(module)}`}
                >
                  <div className="card-name">
                    {module.name[gameState.language]}
                  </div>
                  <div className="card-type">{t('ui.cards.module')}</div>
                  <div
                    className={`card-color-indicator ${getModuleColorClass(module.color)}`}
                  />

                  {/* Show bugs and patches */}
                  {module.bugs.length > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      🐛 {module.bugs.length} bug
                      {module.bugs.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {module.patches.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      🔧 {module.patches.length} parche
                      {module.patches.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Player hand */}
          <div className="player-hand">
            <h3 className="text-white mb-2">
              {t('ui.game.handCards')} ({currentPlayer.hand.length})
            </h3>
            <div className="hand-cards grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {currentPlayer.hand.map(card => (
                <button
                  key={card.id}
                  className={`card ${getCardTypeClass(card.type)} text-left ${!isCurrentPlayerTurn ? 'not-playable' : 'playable hover:scale-105'}`}
                  onClick={() => isCurrentPlayerTurn && handleCardPlay(card)}
                  disabled={!isCurrentPlayerTurn}
                >
                  <div className="card-header">
                    <div className="card-name">
                      {card.name[gameState.language]}
                    </div>
                    <div className="card-type">
                      {t(`ui.cards.${card.type}`)}
                    </div>
                  </div>
                  <div className="card-description">
                    {card.description[gameState.language]}
                  </div>
                  <div className="card-footer">
                    {card.color && (
                      <div
                        className={`card-color-indicator ${getModuleColorClass(card.color)}`}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Targeting Overlay */}
      <TargetingOverlay
        targetingState={targeting.targetingState}
        gameState={gameState}
        currentPlayerId={currentPlayer.id}
        selectedTargets={getSelectedTargetIds()}
        onTargetSelect={handleTargetSelect}
        onConfirm={handleTargetingConfirm}
        onCancel={handleTargetingCancel}
        canConfirm={targeting.canConfirm}
      />
    </div>
  );
}

// Helper functions
function getModuleStateClass(module: ModuleCard): string {
  return `state-${module.state}`;
}

function getModuleColorClass(color: string): string {
  return `color-${color.replace('_', '-')}`;
}

function getCardTypeClass(type: CardType): string {
  return `card-${type}`;
}
