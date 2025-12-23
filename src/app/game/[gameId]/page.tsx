'use client';

import { useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SocketContext } from '@/context/SocketContext';
import type { GameState } from '@/types/game';

export default function GameRoomPage() {
  const { gameId } = useParams();
  const socket = useContext(SocketContext);
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleGameState = (state: GameState) => setGameState(state);

    socket.on('game_state', handleGameState);
    socket.emit('get_game_state', { gameId });

    return () => {
      socket.off('game_state', handleGameState);
    };
  }, [socket, gameId]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const leaveGame = () => {
    if (!socket) return;
    socket.emit('leave_game', { gameId, token });
    router.push('/lobby');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1E4F] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎮 Game Room {gameId}</h1>
      {gameState ? <p>Players: {gameState.players?.length}</p> : <p>Loading...</p>}
      <button onClick={leaveGame} className="bg-red-500 p-2 rounded mt-4">
        Leave Game
      </button>
    </div>
  );
}
