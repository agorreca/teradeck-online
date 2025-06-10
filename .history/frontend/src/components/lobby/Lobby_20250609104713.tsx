import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIDifficulty, Language } from '../../../../shared/src/types/game';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useTranslation } from '../../hooks/useTranslation';

export function Lobby() {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [showAIOptions, setShowAIOptions] = useState(false);
  const [selectedAIDifficulty, setSelectedAIDifficulty] =
    useState<AIDifficulty>(AIDifficulty.NORMAL);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [aiPlayers, setAiPlayers] = useState<number>(1);
  const navigate = useNavigate();
  const { socket, createRoom, joinRoom } = useGameSocket();
  const { t, tUI, changeLanguage, isSpanish, language } = useTranslation();

  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      alert(
        t('errors.pleaseEnterNickname', {
          defaultValue: 'Por favor ingresa tu nickname',
        })
      );
      return;
    }

    setIsCreating(true);
    try {
      const settings = {
        maxPlayers: maxPlayers,
        aiPlayers: 0,
        language,
        aiDifficulty: AIDifficulty.NORMAL,
      };

      await createRoom(settings, nickname);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(t('errors.createRoom', { defaultValue: 'Error al crear la sala' }));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAIGame = async (difficulty: AIDifficulty) => {
    if (!nickname.trim()) {
      alert(
        t('errors.pleaseEnterNickname', {
          defaultValue: 'Por favor ingresa tu nickname',
        })
      );
      return;
    }

    setIsCreating(true);
    try {
      const settings = {
        maxPlayers: aiPlayers + 1, // Player + AI players
        aiPlayers: aiPlayers,
        language,
        aiDifficulty: difficulty,
      };

      await createRoom(settings, nickname);
    } catch (error) {
      console.error('Error creating AI game:', error);
      alert(t('errors.createRoom', { defaultValue: 'Error al crear la sala' }));
    } finally {
      setIsCreating(false);
      setShowAIOptions(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomCode.trim()) {
      alert(
        t('errors.enterNicknameAndCode', {
          defaultValue: 'Por favor ingresa tu nickname y el código de sala',
        })
      );
      return;
    }

    setIsJoining(true);
    try {
      await joinRoom(roomCode, nickname);
    } catch (error) {
      console.error('Error joining room:', error);
      alert(
        t('errors.joinRoom', { defaultValue: 'Error al unirse a la sala' })
      );
    } finally {
      setIsJoining(false);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = isSpanish ? Language.ENGLISH : Language.SPANISH;
    changeLanguage(newLanguage);
  };

  // Listen for room creation/join success
  socket?.on('room-created', (code: string) => {
    navigate(`/room/${code}`);
  });

  socket?.on('room-joined', () => {
    navigate(`/room/${roomCode}`);
  });

  socket?.on('room-error', (error: string) => {
    alert(`Error: ${error}`);
    setIsCreating(false);
    setIsJoining(false);
  });

  return (
    <div className="lobby">
      <div className="lobby-container">
        {/* Language Toggle */}
        <div className="language-toggle">
          <button
            className="btn-language"
            onClick={toggleLanguage}
            title={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
          >
            {isSpanish ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>
        </div>

        <h1 className="lobby-title">{tUI('lobby.title')}</h1>
        <p className="lobby-subtitle">{tUI('lobby.subtitle')}</p>

        <div className="lobby-form">
          <div className="form-group">
            <label htmlFor="nickname">{tUI('lobby.nickname')}</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder={isSpanish ? 'Ingresa tu nombre' : 'Enter your name'}
              maxLength={20}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base 
                       transition-colors duration-200 focus:outline-none focus:border-primary-500
                       placeholder:text-gray-400"
            />
          </div>

          <div className="lobby-actions">


            <button
              className="btn btn-primary w-full py-4 text-lg font-bold tracking-wide 
                       transform transition-all duration-200 hover:scale-105 
                       disabled:hover:scale-100 disabled:cursor-not-allowed"
              onClick={handleCreateRoom}
              disabled={isCreating || !nickname.trim()}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {tUI('lobby.creating')}
                </span>
              ) : (
                `${tUI('lobby.createGame')} (${maxPlayers} ${isSpanish ? 'jugadores' : 'players'})`
              )}
            </button>

            {/* AI Game Section */}
            <div className="ai-section">
              <button
                className="btn btn-secondary w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-none"
                onClick={() => setShowAIOptions(!showAIOptions)}
                disabled={!nickname.trim()}
              >
                🤖 {isSpanish ? 'Jugar contra IA' : 'Play against AI'}
              </button>

              {showAIOptions && (
                <div className="ai-options mt-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4">
                  {/* Number of AI Players */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 text-sm">
                      {isSpanish
                        ? 'Oponentes IA (1-5):'
                        : 'AI Opponents (1-5):'}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          className={`btn btn-sm px-3 py-2 rounded-lg ${
                            aiPlayers === num
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300'
                          }`}
                          onClick={() => setAiPlayers(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 text-sm">
                      {isSpanish ? 'Dificultad:' : 'Difficulty:'}
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        className={`btn btn-sm py-2 ${
                          selectedAIDifficulty === AIDifficulty.EASY
                            ? 'bg-green-500 text-white'
                            : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                        onClick={() =>
                          setSelectedAIDifficulty(AIDifficulty.EASY)
                        }
                      >
                        🟢 {isSpanish ? 'Fácil' : 'Easy'} -{' '}
                        {isSpanish ? 'Movimientos aleatorios' : 'Random moves'}
                      </button>
                      <button
                        className={`btn btn-sm py-2 ${
                          selectedAIDifficulty === AIDifficulty.NORMAL
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                        }`}
                        onClick={() =>
                          setSelectedAIDifficulty(AIDifficulty.NORMAL)
                        }
                      >
                        🟡 {isSpanish ? 'Normal' : 'Normal'} -{' '}
                        {isSpanish
                          ? 'Estrategia balanceada'
                          : 'Balanced strategy'}
                      </button>
                      <button
                        className={`btn btn-sm py-2 ${
                          selectedAIDifficulty === AIDifficulty.HARD
                            ? 'bg-red-500 text-white'
                            : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50'
                        }`}
                        onClick={() =>
                          setSelectedAIDifficulty(AIDifficulty.HARD)
                        }
                      >
                        🔴 {isSpanish ? 'Difícil' : 'Hard'} -{' '}
                        {isSpanish
                          ? 'Estrategia avanzada'
                          : 'Advanced strategy'}
                      </button>
                    </div>
                  </div>

                  {/* Start AI Game Button */}
                  <button
                    className="btn btn-primary w-full py-3 mt-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
                    onClick={() => handleCreateAIGame(selectedAIDifficulty)}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isSpanish ? 'Creando...' : 'Creating...'}
                      </span>
                    ) : (
                      `🚀 ${isSpanish ? 'Empezar Partida' : 'Start Game'} (${aiPlayers} IA)`
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="join-section">
              <div className="form-group">
                <label htmlFor="roomCode">{tUI('lobby.roomCode')}</label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base 
                           transition-colors duration-200 focus:outline-none focus:border-primary-500
                           placeholder:text-gray-400 uppercase tracking-widest font-mono"
                />
              </div>
              <button
                className="btn btn-secondary w-full py-3 transition-all duration-200 
                         hover:shadow-md disabled:hover:shadow-none"
                onClick={handleJoinRoom}
                disabled={isJoining || !nickname.trim() || !roomCode.trim()}
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    {tUI('lobby.joining')}
                  </span>
                ) : (
                  tUI('lobby.joinGame')
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lobby-info">
          <h3 className="text-lg font-bold mb-3">{tUI('lobby.howToPlay')}</h3>
          <ul className="space-y-2">
            {(
              t('ui.lobby.instructions', { returnObjects: true }) as string[]
            ).map((instruction: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 text-lg">🎯</span>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Game Rules Summary */}
        <div className="game-rules">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            <span>📖</span>
            {isSpanish ? 'Reglas del Juego' : 'Game Rules'}
          </h3>
          <div className="rules-grid space-y-3">
            <div className="rule-item transform transition-all duration-200 hover:scale-105">
              <strong className="flex items-center gap-2">
                <span>🎯</span>
                {isSpanish ? 'Objetivo:' : 'Objective:'}
              </strong>
              <span>
                {isSpanish
                  ? 'Reunir 4 módulos estables (Frontend, Backend, Mobile, Data Science)'
                  : 'Gather 4 stable modules (Frontend, Backend, Mobile, Data Science)'}
              </span>
            </div>
            <div className="rule-item transform transition-all duration-200 hover:scale-105">
              <strong className="flex items-center gap-2">
                <span>⚡</span>
                {isSpanish ? 'Turno:' : 'Turn:'}
              </strong>
              <span>
                {isSpanish
                  ? 'Jugar 1 carta O descartar 1-3 cartas, luego robar hasta tener 3'
                  : 'Play 1 card OR discard 1-3 cards, then draw to have 3'}
              </span>
            </div>
            <div className="rule-item transform transition-all duration-200 hover:scale-105">
              <strong className="flex items-center gap-2">
                <span>🃏</span>
                {isSpanish ? 'Cartas:' : 'Cards:'}
              </strong>
              <span>
                {isSpanish
                  ? 'Módulos, Bugs (sabotean), Parches (protegen), Operaciones (especiales)'
                  : 'Modules, Bugs (sabotage), Patches (protect), Operations (special)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
