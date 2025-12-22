'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Room, Player, GameState } from '../types/game';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import {jwtDecode} from 'jwt-decode';

interface GameLobbyProps {
  socket: Socket | null;
  setCurrentRoom: Dispatch<SetStateAction<Room | null>>;
  setPlayer: Dispatch<SetStateAction<Player | null>>;
  setGameState: Dispatch<SetStateAction<GameState | null>>;
}

interface TokenPayload {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
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

  // Decode JWT from localStorage once
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        setPlayerName(`${decoded.first_name} ${decoded.second_name}`);
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

  // Initialize particles
  const particlesInit = async (engine: any) => {
    await loadFull(engine);
  };

  // Fetch available rooms every 10s
  useEffect(() => {
    if (!socket) return;
    const fetchRooms = () => socket.emit('get_available_rooms', { lastMinutes: 2 });
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);

    socket.on('available_rooms', (data: { rooms?: Room[] }) => {
      setAvailableRooms(data.rooms || []);
    });

    return () => {
      clearInterval(interval);
      socket.off('available_rooms');
    };
  }, [socket]);

  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return setError('Enter your name');
    setError('');
    socket.emit('create_game', { playerName, maxPlayers });
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return setError('Enter name & room code');
    setError('');
    socket.emit('join_game', { playerName, gameId: roomCode });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white bg-[#0B1E4F] overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#0B1E4F' } },
          fpsLimit: 60,
          interactivity: { events: { onHover: { enable: true, mode: 'repulse' }, resize: true }, modes: { repulse: { distance: 100, duration: 0.4 } } },
          particles: {
            color: { value: '#ffffff' },
            links: { enable: true, distance: 150, color: '#ffffff', opacity: 0.3, width: 1 },
            move: { enable: true, speed: 1, outModes: { default: 'bounce' } },
            number: { value: 60, density: { enable: true, area: 800 } },
            opacity: { value: 0.3 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 4 } },
          },
          detectRetina: true,
        }}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      <motion.div className="flex flex-col items-center gap-6 p-6 bg-black/50 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-2 text-yellow-400">🎮 YIT UNO Game</h2>

        {error && <div className="bg-red-600 px-4 py-2 rounded-lg">{error}</div>}

        <input
          type="text"
          placeholder="Enter your name"
          className="p-3 rounded w-64 text-black focus:outline-yellow-400"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <input
          type="number"
          min={2}
          max={10}
          placeholder="Max players"
          className="p-3 rounded w-64 text-black focus:outline-yellow-400"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
        />

        <div className="flex gap-4">
          <button onClick={handleCreateRoom} className="bg-green-500 px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
            Create Game
          </button>

          <input
            type="text"
            placeholder="Room code"
            className="p-3 rounded w-48 text-black focus:outline-yellow-400"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={handleJoinRoom} className="bg-yellow-500 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition">
            Join Game
          </button>
        </div>

        <div className="w-full max-w-md mt-6">
          <h3 className="text-lg font-semibold mb-2 text-center text-yellow-300">Available Games (last 2 min)</h3>
          {availableRooms.length === 0 ? (
            <p className="text-gray-300 text-center">No active game yet — create one!</p>
          ) : (
            <ul className="space-y-2">
              {availableRooms.map((room) => (
                <motion.li key={room.gameId} className="bg-blue-600 p-3 rounded-lg flex justify-between items-center"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div>
                    <strong>Room {room.gameId}</strong>
                    <p className="text-sm text-gray-200">{room.currentPlayers || 0}/{room.maxPlayers} players</p>
                    <p className="text-sm text-gray-200">Host: {room.hostName || 'Unknown'}</p>
                  </div>
                  <button onClick={() => setRoomCode(room.gameId)} className="bg-white text-blue-800 px-3 py-1 rounded hover:bg-gray-200 transition">
                    Join
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
