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

    const newSocket: Socket = io('https://yit-apis.onrender.com/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      secure: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('⚠️ Disconnected from server');
      setIsConnected(false);
      setCurrentRoom(null);
      setGameState(null);
      setPlayer(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

    // Game state updates
    newSocket.on('game_state', (data: { game: GameState }) => setGameState(data.game));

    // Individual player updates
    newSocket.on('playerCards', (data: { cards: Card[] }) => {
      setPlayer((prev) => (prev ? { ...prev, cards: data.cards } : null));
    });

    // Error messages from server
    newSocket.on('game_error', (data: { message?: string }) => {
      setError(data.message || 'Unknown error');
    });

    // Room creation/joining
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
