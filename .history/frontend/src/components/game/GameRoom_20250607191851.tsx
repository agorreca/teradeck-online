import { useParams } from 'react-router-dom';

export function GameRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();

  return (
    <div className="game-room">
      <div className="text-center">
        <h1>🎮 Sala de Juego</h1>
        <p>Código de sala: <strong>{roomCode}</strong></p>
        <p>Esperando jugadores...</p>
        
        <div className="mt-4">
          <p>🚧 Componente en desarrollo</p>
          <p>Aquí se mostrará la lista de jugadores y configuración de la partida</p>
        </div>
      </div>
    </div>
  );
} 