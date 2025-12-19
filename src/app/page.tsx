'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import GameLobby from '../components/GameLobby';
import GameRoom from '../components/GameRoom';
import { GameState, Player, Room, Card } from '../types/game';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newSocket = io('http://localhost:3002', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setCurrentRoom(null);
      setGameState(null);
      setPlayer(null);
    });

    // Update global game state
    newSocket.on('game_state', (data: { game: GameState }) => {
      setGameState(data.game);
    });

    // Update individual player's hand
    newSocket.on('playerCards', (data: { cards: Card[] }) => {
      setPlayer((prev) => prev ? { ...prev, cards: data.cards } : null);
    });

    // Handle errors
    newSocket.on('game_error', (data: { message?: string }) => {
      setError(data.message || 'Unknown error');
    });

    // When game is created or joined
    newSocket.on('game_room_created', (data: { room: Room; player: Player }) => {
      setCurrentRoom(data.room);
      setPlayer(data.player);
    });

    newSocket.on('game_room_joined', (data: { room: Room; player: Player }) => {
      setCurrentRoom(data.room);
      setPlayer(data.player);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleLeaveRoom = () => {
    if (socket && player && currentRoom) {
      socket.emit('leave_game', { playerId: player.id, gameId: currentRoom.gameId });
    }
    setCurrentRoom(null);
    setPlayer(null);
    setGameState(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1E4F] text-white">
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen">
          <p>Connecting to game server...</p>
        </div>
      ) : currentRoom && player && socket ? (
        <GameRoom
          socket={socket}
          gameId={currentRoom.gameId}
          playerId={player.id}
          playerName={player.name}
          onLeaveRoom={handleLeaveRoom}
          gameState={gameState}
          currentRoom={currentRoom}
          player={player}
        />
      ) : (
        <GameLobby
          socket={socket}
          setCurrentRoom={setCurrentRoom}
          setPlayer={setPlayer}
          setGameState={setGameState}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
