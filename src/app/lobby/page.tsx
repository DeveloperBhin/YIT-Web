'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocketContext } from '@/context/SocketContext';
import type { Room, Player, GameState } from '@/types/game';

export default function LobbyPage() {
  const socket = useContext(SocketContext);
  const router = useRouter();

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  // Set player name from token (client-side only)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload: any = JSON.parse(atob(token.split('.')[1]));
      setPlayerName(`${payload.first_name} ${payload.second_name}`);
    } catch (err) {
      console.error('Invalid token', err);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: { room: Room; player: Player; game: GameState }) => {
      router.push(`/game/${data.room.gameId}`);
    };
    const handleJoined = (data: { room: Room; player: Player; game: GameState }) => {
      router.push(`/game/${data.room.gameId}`);
    };
    const handleAvailable = (data: { rooms?: Room[] }) => setAvailableRooms(data.rooms || []);
    const handleError = (err: { message: string }) => setError(err.message);

    socket.on('game_room_created', handleCreated);
    socket.on('game_room_joined', handleJoined);
    socket.on('available_rooms', handleAvailable);
    socket.on('game_error', handleError);

    socket.emit('get_available_rooms');
    const interval = setInterval(() => socket.emit('get_available_rooms'), 10000);

    return () => {
      clearInterval(interval);
      socket.off('game_room_created', handleCreated);
      socket.off('game_room_joined', handleJoined);
      socket.off('available_rooms', handleAvailable);
      socket.off('game_error', handleError);
    };
  }, [socket, router]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleCreateRoom = () => {
    if (!socket || !playerName) return setError('Enter your name');
    socket.emit('create_game', { maxPlayers, token });
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName || !roomCode) return setError('Enter name & room code');
    socket.emit('join_game', { gameId: roomCode, token });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1E4F] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎮 YIT UNO Game</h1>

      {error && <p className="bg-red-600 p-2 rounded mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="p-2 rounded text-black mb-2"
      />

      <input
        type="number"
        min={2}
        max={10}
        value={maxPlayers}
        onChange={(e) => setMaxPlayers(Number(e.target.value))}
        className="p-2 rounded text-black mb-2"
      />

      <button onClick={handleCreateRoom} className="bg-green-500 p-2 rounded mb-4">
        Create Game
      </button>

      <input
        type="text"
        placeholder="Room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="p-2 rounded text-black mb-2"
      />
      <button onClick={handleJoinRoom} className="bg-yellow-500 p-2 rounded mb-4">
        Join Game
      </button>

      <h2 className="text-xl mb-2">Available Rooms</h2>
      {availableRooms.length === 0 ? (
        <p>No active games — create one!</p>
      ) : (
        availableRooms.map((r) => (
          <div key={r.gameId} className="bg-blue-600 p-2 rounded flex justify-between mb-1">
            <span>
              {r.gameId} ({r.currentPlayers}/{r.maxPlayers})
            </span>
            <button onClick={() => setRoomCode(r.gameId)} className="bg-white text-blue-800 px-2 rounded">
              Join
            </button>
          </div>
        ))
      )}
    </div>
  );
}
