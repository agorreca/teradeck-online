import type { GameAction, GameSettings } from '@shared/types/game';
import { Server, Socket } from 'socket.io';
import { GameManager } from '../services/GameManager';

const gameManager = new GameManager();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // Create room
    socket.on('create-room', (settings: GameSettings, nickname: string) => {
      try {
        const roomCode = gameManager.createRoom(settings, socket.id, nickname);
        socket.join(roomCode);

        // Get the room state and emit both room-created and room-joined
        const room = gameManager.getRoomState(roomCode);
        if (room) {
          socket.emit('room-created', roomCode);
          socket.emit('room-joined', room);
        }

        console.log(
          `🎮 Room created: ${roomCode} by ${nickname} (${socket.id})`
        );
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('room-error', 'Failed to create room');
      }
    });

    // Join room
    socket.on('join-room', (roomCode: string, nickname: string) => {
      try {
        const gameState = gameManager.joinRoom(roomCode, socket.id, nickname);
        socket.join(roomCode);
        socket.emit('room-joined', gameState);

        // Notify other players
        socket.to(roomCode).emit(
          'player-joined',
          gameState.players.find((p: any) => p.id === socket.id)
        );
        console.log(
          `🚪 Player ${nickname} (${socket.id}) joined room ${roomCode}`
        );
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(
          'room-error',
          error instanceof Error ? error.message : 'Failed to join room'
        );
      }
    });

    // Get room state
    socket.on('get-room-state', (roomCode: string) => {
      try {
        const gameState = gameManager.getRoomState(roomCode);
        if (gameState) {
          // For AI games, update the human player's socket ID if needed
          const humanPlayer = gameState.players.find(p => !p.isAI);
          if (humanPlayer && humanPlayer.id !== socket.id) {
            gameManager.updatePlayerSocketId(roomCode, humanPlayer.id, socket.id);
            // Join the room with the new socket ID
            socket.join(roomCode);
            console.log(`🔄 Updated player ${humanPlayer.nickname} socket ID from ${humanPlayer.id} to ${socket.id}`);
          }
          
          const updatedGameState = gameManager.getRoomState(roomCode);
          socket.emit('room-state', updatedGameState || gameState);
          console.log(`🔍 Room state sent for ${roomCode} to ${socket.id}`);
        } else {
          socket.emit('room-error', 'Room not found');
        }
      } catch (error) {
        console.error('Error getting room state:', error);
        socket.emit('room-error', 'Failed to get room state');
      }
    });

    // Leave room
    socket.on('leave-room', () => {
      try {
        const roomCode = gameManager.getPlayerRoom(socket.id);
        if (roomCode) {
          gameManager.leaveRoom(roomCode, socket.id);
          socket.leave(roomCode);
          socket.to(roomCode).emit('player-left', socket.id);
          console.log(`🚪 Player ${socket.id} left room ${roomCode}`);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Start game
    socket.on('start-game', () => {
      try {
        const roomCode = gameManager.getPlayerRoom(socket.id);
        if (roomCode) {
          const gameState = gameManager.startGame(roomCode, socket.id);
          io.to(roomCode).emit('game-started', gameState);
          console.log(`🎮 Game started in room ${roomCode}`);
        }
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit(
          'room-error',
          error instanceof Error ? error.message : 'Failed to start game'
        );
      }
    });

    // Game action
    socket.on('game-action', (action: GameAction) => {
      try {
        const roomCode = gameManager.getPlayerRoom(socket.id);
        if (roomCode) {
          const gameState = gameManager.processAction(roomCode, action);
          io.to(roomCode).emit('game-updated', gameState);

          // Check if game ended
          if (gameState.winner) {
            io.to(roomCode).emit('game-ended', gameState.winner, gameState);
            console.log(
              `🏆 Game ended in room ${roomCode}, winner: ${gameState.winner}`
            );
          }
        }
      } catch (error) {
        console.error('Error processing game action:', error);
        socket.emit(
          'error',
          error instanceof Error ? error.message : 'Invalid action'
        );
      }
    });

    // Chat message
    socket.on('chat-message', (message: string) => {
      try {
        const roomCode = gameManager.getPlayerRoom(socket.id);
        if (roomCode) {
          const player = gameManager.getPlayer(roomCode, socket.id);
          if (player) {
            io.to(roomCode).emit(
              'chat-message',
              socket.id,
              message,
              Date.now()
            );
          }
        }
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      try {
        const roomCode = gameManager.getPlayerRoom(socket.id);
        if (roomCode) {
          gameManager.handleDisconnection(roomCode, socket.id);
          socket.to(roomCode).emit('player-left', socket.id);
        }
        console.log(`🔌 Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}
