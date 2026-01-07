'use client';

import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

import GameLobby from './GameLobby';
import GameRoom from './GameRoom';
import { GameState, Player, Room } from '../types/game';
import { SocketContext } from '../context/SocketContext';

export default function Home() {
  const socket = useContext(SocketContext); // ✅ single socket source

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // tsparticles init
  const particlesInit = async (engine: any) => {
    await loadFull(engine);
  };

  // socket lifecycle
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('✅ Connected:', socket.id);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('⚠️ Disconnected');
      setIsConnected(false);
    };

    const onError = (err: any) => {
      console.error('❌ Socket error:', err.message);
      setError(err.message);
    };

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
    if (socket && player && currentRoom) {
      socket.emit('leave_game', {
        token: localStorage.getItem('token'),
        gameId: currentRoom.gameId,
      });
    }

    setCurrentRoom(null);
    setPlayer(null);
    setGameState(null);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1E4F] text-white flex flex-col items-center justify-center overflow-hidden">
     <Particles id="tsparticles" options={{ background: { color: { value: '#0B1E4F' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 200, duration: 0.4 } }, }, particles: { color: { value: '#FFD700' }, links: { enable: true, color: '#FFD700', distance: 150 }, move: { enable: true, speed: 2 }, number: { value: 40 }, opacity: { value: 0.7 }, size: { value: { min: 2, max: 5 } }, }, }} className="absolute inset-0 -z-10" />

      <motion.h1
        className="text-5xl font-bold mb-8 animate-pulse"
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        🎮 YIT UNO Game
      </motion.h1>

      {!socket && <p className="mb-4">Initializing socket…</p>}
      {socket && !isConnected && !error && (
        <p className="mb-4">Connecting to game server…</p>
      )}

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
