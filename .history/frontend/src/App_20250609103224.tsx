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
 