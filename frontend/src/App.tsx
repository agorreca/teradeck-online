import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './components/lobby/Lobby';
import { GameRoom } from './components/game/GameRoom';
import { GameBoard } from './components/game/GameBoard';
import './i18n';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Landing/Lobby page */}
          <Route path="/" element={<Lobby />} />
          
          {/* Game room (waiting for players) */}
          <Route path="/room/:roomCode" element={<GameRoom />} />
          
          {/* Active game */}
          <Route path="/game/:roomCode" element={<GameBoard />} />
          
          {/* Redirect any unknown routes to lobby */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

  // Functional game page with real game logic
  const GamePage = () => (
    <div
      style={{
        padding: '20px',
        color: 'white',
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #DC2626 0%, #7C2D12 50%, #451A03 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Game Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <button
          onClick={() =>
            setAppState(prev => ({ ...prev, currentScreen: 'landing' }))
          }
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← {t('settings.back')}
        </button>

        <h1 style={{ fontSize: '2rem', margin: 0, textAlign: 'center' }}>
          🎮 TeraDeck Online
        </h1>

        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          🤖 {numberOfOpponents} vs 👤 1
        </div>
      </div>

      {/* Game Status */}
      <div
        style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
          {t('game.yourProject')}
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '15px', opacity: 0.9 }}>
          {t('game.progress')}: {appState.players[0].modules.length}/4
        </p>
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            ⚡ {t('game.gameStarted')} Dificultad:{' '}
            <strong>{t(`ai.${selectedDifficulty}`)}</strong>
          </p>
        </div>
      </div>

      {/* Game Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '20px',
          height: '60vh',
        }}
      >
        {/* Main Game Board */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>
            🏗️ Área de Construcción
          </h3>

          {/* Player's Project */}
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '15px', color: '#10B981' }}>
              👤 Tu Proyecto:
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '10px',
                minHeight: '80px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '15px',
              }}
            >
              {appState.players[0].modules.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    opacity: 0.7,
                    textAlign: 'center',
                    gridColumn: '1 / -1',
                  }}
                >
                  {t('game.playModulesToBuild')}
                </p>
              ) : (
                appState.players[0].modules.map(module => (
                  <div
                    key={module.id}
                    style={{
                      background: getModuleColor(module.color),
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {module.name[i18n.language] || module.name.es}
                    </div>
                    <div style={{ opacity: 0.8, fontSize: '0.7rem' }}>
                      {module.color}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Opponents */}
          <div>
            <h4 style={{ marginBottom: '15px', color: '#EF4444' }}>
              🤖 Oponentes IA:
            </h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              {Array.from({ length: numberOfOpponents }, (_, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    🤖 IA {i + 1} ({t(`ai.${selectedDifficulty}`)})
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(60px, 1fr))',
                      gap: '6px',
                    }}
                  >
                    {appState.players[i + 1]?.modules.length === 0 ? (
                      <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                        {t('game.noModulesYet')}
                      </span>
                    ) : (
                      appState.players[i + 1]?.modules.map(module => (
                        <div
                          key={module.id}
                          style={{
                            background: getModuleColor(module.color),
                            padding: '6px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '0.7rem',
                          }}
                        >
                          {module.color}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Controls & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Turn Status */}
          <div
            style={{
              background: isPlayerTurn
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              border: `2px solid ${isPlayerTurn ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>
              {isPlayerTurn ? '✅ Tu Turno' : '🤖 Turno IA'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {isPlayerTurn
                ? 'Selecciona una carta para jugar'
                : 'La IA está pensando...'}
            </p>
          </div>

          {/* Player Hand */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '15px',
              flex: 1,
            }}
          >
            <h4 style={{ marginBottom: '12px' }}>
              🃏 Tu Mano ({playerHand.length} cartas)
            </h4>
            <div
              style={{
                display: 'grid',
                gap: '8px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {playerHand.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
                  No tienes cartas
                </p>
              ) : (
                playerHand.slice(0, 3).map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    disabled={!isPlayerTurn}
                    style={{
                      background:
                        selectedCard?.id === card.id
                          ? 'rgba(139, 92, 246, 0.3)'
                          : card.color
                            ? getCardColor(card.color, card.type)
                            : 'rgba(255,255,255,0.1)',
                      border:
                        selectedCard?.id === card.id
                          ? '2px solid #8B5CF6'
                          : `2px solid ${getCardBorderColor(card.color || '', card.type)}`,
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
                      opacity: isPlayerTurn ? 1 : 0.5,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow:
                        selectedCard?.id === card.id
                          ? '0 8px 25px rgba(139, 92, 246, 0.4)'
                          : '0 4px 15px rgba(0,0,0,0.3)',
                      transform:
                        selectedCard?.id === card.id
                          ? 'translateY(-2px)'
                          : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                      {getCardIcon(card.type)}
                    </div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        marginBottom: '4px',
                      }}
                    >
                      {card.name[i18n.language] || card.name.es}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {card.type}
                    </div>
                    {card.color && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.9,
                          background: 'rgba(255,255,255,0.1)',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          marginTop: '4px',
                        }}
                      >
                        {card.color}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <button
              onClick={() => playCard(selectedCard)}
              disabled={!selectedCard || !isPlayerTurn}
              style={{
                padding: '12px',
                background:
                  selectedCard && isPlayerTurn
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor:
                  selectedCard && isPlayerTurn ? 'pointer' : 'not-allowed',
                opacity: selectedCard && isPlayerTurn ? 1 : 0.5,
              }}
            >
              🎮 Jugar Carta
            </button>

            <button
              onClick={() => {
                if (isPlayerTurn) {
                  addLog('⏭️ Pasaste tu turno');
                  setIsPlayerTurn(false);
                  setTimeout(() => setIsPlayerTurn(true), 1500);
                }
              }}
              disabled={!isPlayerTurn}
              style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'white',
                cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
                opacity: isPlayerTurn ? 1 : 0.5,
              }}
            >
              ⏭️ Pasar Turno
            </button>
          </div>
        </div>
      </div>

      {/* Game Log */}
      <div
        style={{
          marginTop: '20px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '15px',
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>
          📝 Registro del Juego
        </h4>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          {gameLog.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.6 }}>
              El juego está comenzando...
            </p>
          ) : (
            gameLog.map((log, index) => (
              <div
                key={index}
                style={{ marginBottom: '4px', opacity: 1 - index * 0.1 }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to get module colors
  const getModuleColor = (color: string) => {
    const colors = {
      backend: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
      frontend: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      mobile: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      'data-science': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      data_science: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      multicolor: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    };
    return colors[color as keyof typeof colors] || 'rgba(255,255,255,0.2)';
  };

  // Card styling functions
  const getCardColor = (color: string, type: string) => {
    if (type === CardType.MODULE) {
      return getModuleColor(color);
    }
    if (type === CardType.BUG) {
      return 'rgba(239, 68, 68, 0.2)'; // Red tint for bugs
    }
    if (type === CardType.PATCH) {
      return 'rgba(34, 197, 94, 0.2)'; // Green tint for patches
    }
    if (type === CardType.OPERATION) {
      return 'rgba(168, 85, 247, 0.2)'; // Purple tint for operations
    }
    return 'rgba(255,255,255,0.1)';
  };

  const getCardBorderColor = (color: string, type: string) => {
    if (type === CardType.MODULE) {
      return getModuleBorderColor(color);
    }
    if (type === CardType.BUG) {
      return '#EF4444'; // Red border for bugs
    }
    if (type === CardType.PATCH) {
      return '#22C55E'; // Green border for patches
    }
    if (type === CardType.OPERATION) {
      return '#A855F7'; // Purple border for operations
    }
    return 'rgba(255,255,255,0.2)';
  };

  const getModuleBorderColor = (color: string) => {
    const colors = {
      backend: '#3B82F6',
      frontend: '#F59E0B',
      mobile: '#EF4444',
      'data-science': '#10B981',
      data_science: '#10B981',
      multicolor: '#8B5CF6',
    };
    return colors[color as keyof typeof colors] || 'rgba(255,255,255,0.2)';
  };

  const getCardIcon = (type: string) => {
    const icons = {
      [CardType.MODULE]: '🏗️',
      [CardType.BUG]: '🐛',
      [CardType.PATCH]: '🔧',
      [CardType.OPERATION]: '⚡',
    };
    return icons[type as keyof typeof icons] || '🎴';
  };

  // Initialize complete TeraDeck game when starting
  React.useEffect(() => {
    if (appState.currentScreen === 'game') {
      // Import the complete deck
      import('../../shared/src/constants/cards.js').then(
        ({ createTeraDeckDeck }) => {
          const fullDeck = createTeraDeckDeck();
          setGameDeck(fullDeck);

          // Deal initial cards (7 per player as per TeraDeck rules)
          const initialHand = fullDeck.splice(0, 7);
          setPlayerHand(initialHand);
          setDeckSize(fullDeck.length);

          addLog(
            `🎮 ${t('game.startingVsAI', { count: numberOfOpponents, difficulty: t(`ai.${selectedDifficulty}`) })}`
          );
          addLog(
            `🃏 Repartidas 7 cartas. Mazo: ${fullDeck.length} cartas restantes`
          );
        }
      );
    }
  }, [appState.currentScreen, numberOfOpponents, selectedDifficulty]);

  // Main render
  switch (appState.currentScreen) {
    case 'settings':
      return <SettingsPage />;
    case 'game':
      return <GamePage />;
    default:
      return <LandingPage />;
  }
}

export default App;
