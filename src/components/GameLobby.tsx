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
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.emit('get_available_rooms');
    socket.on('available_rooms', (data: { rooms?: Room[] }) => {
      setAvailableRooms(data.rooms || []);
    });

    socket.on('game_room_created', (data: { room: Room; player: Player; game: GameState }) => {
      setCurrentRoom(data.room);
      setPlayer({ ...data.player, cards: [] });
      setGameState(data.game);
    });

    socket.on('game_room_joined', (data: { room: Room; player: Player; game: GameState }) => {
      setCurrentRoom(data.room);
      setPlayer({ ...data.player, cards: [] });
      setGameState(data.game);
    });

    return () => {
      socket.off('available_rooms');
      socket.off('game_room_created');
      socket.off('game_room_joined');
    };
  }, [socket, setCurrentRoom, setPlayer, setGameState]);

  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return setError('Please enter your name');
    socket.emit('create_game', { playerName, maxPlayers });
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return setError('Enter name & room code');
    socket.emit('join_game', { playerName, gameId: roomCode });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold mb-4">🎮 UNO Game Lobby</h2>

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
        placeholder="Maximum players"
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

      <div className="w-full max-w-md mt-6">
        <h3 className="text-lg font-semibold mb-2">Available Rooms</h3>
        {availableRooms.length === 0 ? (
          <p className="text-gray-300">No rooms yet. Create one!</p>
        ) : (
          <ul className="space-y-2">
            {availableRooms.map((room) => (
              <li key={room.gameId} className="bg-blue-600 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <strong>Room {room.gameId}</strong>
                  <p className="text-sm text-gray-200">
                    {room.players?.length || 0}/{room.maxPlayers} players
                  </p>
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
