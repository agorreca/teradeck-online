import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameState, Player } from '../../../../shared/src/types/game';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useTranslation } from '../../hooks/useTranslation';

export function GameRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { socket, startGame } = useGameSocket();
  const { isSpanish } = useTranslation();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Store the current player ID when socket connects
    socket.on('connect', () => {
      setCurrentPlayerId(socket.id);
      // Request current room state when connecting
      socket.emit('get-room-state', roomCode);
    });

    // If already connected, set ID and request state
    if (socket.connected) {
      setCurrentPlayerId(socket.id);
      socket.emit('get-room-state', roomCode);
    }

    // Listen for room updates
    socket.on('room-joined', (state: GameState) => {
      setGameState(state);
    });

    socket.on('room-state', (state: GameState) => {
      setGameState(state);
    });

    socket.on('player-joined', (player: Player) => {
      if (gameState) {
        setGameState(prev =>
          prev
            ? {
                ...prev,
                players: [...prev.players, player],
              }
            : null
        );
      }
    });

    socket.on('player-left', (playerId: string) => {
      if (gameState) {
        setGameState(prev =>
          prev
            ? {
                ...prev,
                players: prev.players.filter(p => p.id !== playerId),
              }
            : null
        );
      }
    });

    socket.on('game-started', (state: GameState) => {
      navigate(`/game/${roomCode}`);
    });

    socket.on('room-error', (error: string) => {
      alert(`Error: ${error}`);
      navigate('/');
    });

    return () => {
      socket.off('room-joined');
      socket.off('room-state');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('room-error');
    };
  }, [socket, roomCode, gameState, navigate]);

  const handleStartGame = async () => {
    if (!socket) return;

    setIsStarting(true);
    try {
      startGame();
    } catch (error) {
      console.error('Error starting game:', error);
      alert(isSpanish ? 'Error al iniciar el juego' : 'Error starting game');
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    navigate('/');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {isSpanish ? 'Cargando sala...' : 'Loading room...'}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                {isSpanish
                  ? 'Conectando al servidor...'
                  : 'Connecting to server...'}
              </p>
              <p className="text-sm text-gray-500">
                {socket?.connected
                  ? isSpanish
                    ? 'Conectado - Obteniendo datos...'
                    : 'Connected - Getting room data...'
                  : isSpanish
                    ? 'Estableciendo conexión...'
                    : 'Establishing connection...'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {isSpanish ? 'Volver al Lobby' : 'Back to Lobby'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost || false;
  const humanPlayers = gameState.players.filter(p => !p.isAI);
  const aiPlayers = gameState.players.filter(p => p.isAI);
  const minPlayers = 2;
  const canStart = gameState.players.length >= minPlayers && isHost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                🎮 {isSpanish ? 'Sala de Juego' : 'Game Room'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isSpanish ? 'Código de sala:' : 'Room code:'}
                <span className="font-mono font-bold text-xl text-blue-600 ml-2">
                  {roomCode}
                </span>
              </p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {isSpanish ? 'Salir' : 'Leave'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Players List */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              👥 {isSpanish ? 'Jugadores' : 'Players'} ({humanPlayers.length})
            </h2>
            <div className="space-y-3">
              {humanPlayers.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    player.isHost
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          player.isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                      <span className="font-semibold text-gray-800">
                        {player.nickname}
                      </span>
                      {player.id === currentPlayerId && (
                        <span className="text-blue-600 text-sm font-medium">
                          ({isSpanish ? 'Tú' : 'You'})
                        </span>
                      )}
                    </div>
                    {player.isHost && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                        {isSpanish ? 'HOST' : 'HOST'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Players */}
          {aiPlayers.length > 0 && (
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🤖 {isSpanish ? 'Oponentes IA' : 'AI Opponents'} (
                {aiPlayers.length})
              </h2>
              <div className="space-y-3">
                {aiPlayers.map((ai, index) => (
                  <div
                    key={ai.id}
                    className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="font-semibold text-gray-800">
                          {isSpanish ? `IA ${index + 1}` : `AI ${index + 1}`}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                        {gameState.settings?.aiDifficulty?.toUpperCase() ||
                          'NORMAL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mt-6">
          <div className="text-center">
            {isHost ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  {gameState.players.length < minPlayers
                    ? isSpanish
                      ? `Necesitas al menos ${minPlayers} jugadores para empezar`
                      : `Need at least ${minPlayers} players to start`
                    : isSpanish
                      ? '¡Listo para empezar!'
                      : 'Ready to start!'}
                </p>
                <button
                  onClick={handleStartGame}
                  disabled={!canStart || isStarting}
                  className={`px-8 py-4 text-xl font-bold rounded-lg transition-all transform ${
                    canStart && !isStarting
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isSpanish ? 'Iniciando...' : 'Starting...'}
                    </span>
                  ) : (
                    `🚀 ${isSpanish ? 'Iniciar Juego' : 'Start Game'}`
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 text-lg">
                  {isSpanish
                    ? 'Esperando que el host inicie el juego...'
                    : 'Waiting for host to start the game...'}
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {isSpanish ? 'Configuración del Juego' : 'Game Settings'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>{isSpanish ? 'Jugadores máximos:' : 'Max players:'}</span>
              <span className="font-semibold">
                {gameState.settings?.maxPlayers || 6}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{isSpanish ? 'Oponentes IA:' : 'AI opponents:'}</span>
              <span className="font-semibold">
                {gameState.settings?.aiPlayers || 0}
              </span>
            </div>
            {gameState.settings?.aiPlayers &&
              gameState.settings.aiPlayers > 0 && (
                <div className="flex justify-between">
                  <span>{isSpanish ? 'Dificultad IA:' : 'AI difficulty:'}</span>
                  <span className="font-semibold capitalize">
                    {gameState.settings.aiDifficulty || 'normal'}
                  </span>
                </div>
              )}
            <div className="flex justify-between">
              <span>{isSpanish ? 'Idioma:' : 'Language:'}</span>
              <span className="font-semibold">
                {gameState.settings?.language === 'es' ? 'Español' : 'English'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
