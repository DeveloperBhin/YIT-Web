'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import GameLobby from './GameLobby';
import GameRoom from './GameRoom';
import { GameState, Player, Room } from '../types/game';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Initialize tsparticles
  const particlesInit = async (engine: any) => {
    await loadFull(engine);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socketInstance = io('https://yit-apis.onrender.com/', {
      transports: ['', 'polling'],
      reconnection: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('⚠️ Disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      socketInstance.disconnect();
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

      <motion.h1
        className="text-5xl font-bold mb-8 animate-pulse"
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        🎮 YIT UNO Game
      </motion.h1>

      {!isConnected && !error && <p className="mb-4">Connecting to game server...</p>}
      {error && (
        <motion.div
          className="bg-red-600 px-4 py-2 rounded-lg mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isConnected && socket && currentRoom && player ? (
          <motion.div
            key="gameRoom"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <GameRoom
              socket={socket}
              gameId={currentRoom.gameId}
              gameState={gameState}
              setGameState={setGameState}
              currentRoom={currentRoom}
              player={player}
              onLeaveRoom={handleLeaveRoom}
            />
          </motion.div>
        ) : isConnected && socket ? (
          <motion.div
            key="gameLobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
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
