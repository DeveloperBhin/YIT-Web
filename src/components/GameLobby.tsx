'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { Room, Player, GameState } from '../types/game';

interface GameLobbyProps {
  socket: Socket | null;
  setCurrentRoom: Dispatch<SetStateAction<Room | null>>;
  setPlayer: Dispatch<SetStateAction<Player | null>>;
  setGameState: Dispatch<SetStateAction<GameState | null>>;
}

export default function GameLobby({
  socket,
  setCurrentRoom,
  setPlayer,
  setGameState,
}: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  // 🔁 Fetch available rooms initially and every 10 seconds
 useEffect(() => {
  if (!socket) return;

  const fetchRooms = () => {
    console.log('🔹 Emitting get_available_rooms');
    socket.emit('get_available_rooms', { lastMinutes: 2 });
  };

  fetchRooms(); // initial fetch

  const interval = setInterval(fetchRooms, 10000); // refresh every 10s

  socket.on('available_rooms', (data: { rooms?: Room[] }) => {
    console.log('🔹 Received available_rooms:', data);
    setAvailableRooms(data.rooms || []);
  });

  return () => {
    clearInterval(interval);
    socket.off('available_rooms');
  };
}, [socket]);

  // ⚡ Listen for game events: created/joined rooms
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data: { room: Room; player: Player; game: GameState }) => {
      setCurrentRoom(data.room);
      const cards = data.game.players.find(p => p.id === data.player.id)?.cards || [];
      setPlayer({ ...data.player, cards });
      setGameState(data.game);
    };

    const handleRoomJoined = (data: { room: Room; player: Player; game: GameState }) => {
      setCurrentRoom(data.room);
      const cards = data.game.players.find(p => p.id === data.player.id)?.cards || [];
      setPlayer({ ...data.player, cards });
      setGameState(data.game);
    };

    socket.on('game_room_created', handleRoomCreated);
    socket.on('game_room_joined', handleRoomJoined);

    return () => {
      socket.off('game_room_created', handleRoomCreated);
      socket.off('game_room_joined', handleRoomJoined);
    };
  }, [socket, setCurrentRoom, setPlayer, setGameState]);

  // 🧠 Create a new room
  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return setError('Enter your name');
    setError('');
    socket.emit('create_game', { playerName, maxPlayers });
  };

  // 🚪 Join existing room
  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return setError('Enter name & room code');
    setError('');
    socket.emit('join_game', { playerName, gameId: roomCode });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold mb-4">🎮 YIT UNO Game Lobby</h2>

      {error && <div className="bg-red-600 px-4 py-2 rounded-lg">{error}</div>}

      <input
        type="text"
        placeholder="Enter your name"
        className="p-2 rounded w-64 text-black"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <input
        type="number"
        min={2}
        max={10}
        placeholder="Max players"
        className="p-2 rounded w-64 text-black"
        value={maxPlayers}
        onChange={(e) => setMaxPlayers(Number(e.target.value))}
      />

      <div className="flex gap-4">
        <button
          onClick={handleCreateRoom}
          className="bg-green-500 px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Create Room
        </button>

        <input
          type="text"
          placeholder="Room code"
          className="p-2 rounded w-48 text-black"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />

        <button
          onClick={handleJoinRoom}
          className="bg-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
        >
          Join Room
        </button>
      </div>

      {/* Room List Section */}
      <div className="w-full max-w-md mt-6">
        <h3 className="text-lg font-semibold mb-2">Available Rooms (last 2 min)</h3>
        {availableRooms.length === 0 ? (
          <p className="text-gray-300">No active rooms yet — create one!</p>
        ) : (
          <ul className="space-y-2">
            {availableRooms.map((room) => (
              <li
                key={room.gameId}
                className="bg-blue-600 p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <strong>Room {room.gameId}</strong>
                  <p className="text-sm text-gray-200">
                    {room.currentPlayers || 0}/{room.maxPlayers} players
                  </p>
                  <p className="text-sm text-gray-200">Host: {room.hostName || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => setRoomCode(room.gameId)}
                  className="bg-white text-blue-800 px-3 py-1 rounded hover:bg-gray-200 transition"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
