'use client';

import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import { useRouter } from 'next/navigation';

import GameLobby from './GameLobby';
import GameRoom from './GameRoom';
import { GameState, Player, Room } from '../types/game';
import { SocketContext } from '../context/SocketContext';
import {jwtDecode} from 'jwt-decode';

interface TokenPayload {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  token?: string;
}

export default function Dashboard() {
  const socket = useContext(SocketContext);
  const router = useRouter();

  const [user, setUser] = useState<TokenPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Decode JWT once on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      decoded.token = token;
      setUser(decoded);
    } catch (err) {
      console.error('Invalid token', err);
      router.push('/login');
    }
  }, [router]);

  // Socket lifecycle
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = (err: any) => setError(err.message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [socket]);

  const handleLeaveRoom = () => {
    if (socket && currentRoom && user?.token) {
      socket.emit('leave_game', { token: user.token, gameId: currentRoom.gameId });
    }
    setCurrentRoom(null);
    setPlayer(null);
    setGameState(null);
  };

  const particlesInit = async (engine: any) => {
    await loadFull(engine);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1E4F] text-white flex flex-col items-center justify-center overflow-hidden">
      <Particles
        id="tsparticles"
        options={{
          background: { color: { value: '#0B1E4F' } },
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 200, duration: 0.4 } },
          },
          particles: {
            color: { value: '#FFD700' },
            links: { enable: true, color: '#FFD700', distance: 150 },
            move: { enable: true, speed: 2 },
            number: { value: 40 },
            opacity: { value: 0.7 },
            size: { value: { min: 2, max: 5 } },
          },
        }}
        className="absolute inset-0 -z-10"
      />

      <motion.h1 className="text-5xl font-bold mb-8 animate-pulse">
        🎮 YIT UNO Game
      </motion.h1>

      {!socket && <p className="mb-4">Initializing socket…</p>}
      {socket && !isConnected && !error && <p className="mb-4">Connecting to game server…</p>}
      {error && <div className="bg-red-600 px-4 py-2 rounded mb-4">{error}</div>}

      <AnimatePresence mode="wait">
        {isConnected && socket && currentRoom && player && user ? (
          <motion.div key="gameRoom" className="w-full">
            <GameRoom
              socket={socket}
              gameId={currentRoom.gameId}
              gameState={gameState}
              setGameState={setGameState}
              currentRoom={currentRoom}
              player={player}
              onLeaveRoom={handleLeaveRoom}
              user={user}
            />
          </motion.div>
        ) : isConnected && socket && user ? (
          <motion.div key="gameLobby" className="w-full">
            <GameLobby
              socket={socket}
              setCurrentRoom={setCurrentRoom}
              setPlayer={setPlayer}
              setGameState={setGameState}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
