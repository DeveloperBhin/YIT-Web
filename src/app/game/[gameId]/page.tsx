'use client';

import { useContext,useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SocketContext } from '@/context/SocketContext';
import GameRoom from '@/components/GameRoom';
import type { Room, Player, GameState } from '@/types/game';

export default function GameRoomPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useContext(SocketContext);
  const router = useRouter();

  // 🔒 Page-level state (DO NOT gate rendering on gameState)
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const leaveGame = () => {
    if (!socket) return;

    socket.emit('leave_game', {
      gameId,
      token,
    });

    router.push('/lobby');
  };

  // ⛔ Important: do NOT render GameRoom until socket exists
  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Connecting to server…
      </div>
    );
  }

  // ⛔ Still waiting for room/player bootstrap (from lobby or server)
  if (!currentRoom || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Joining game room…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1E4F] text-white">
    <GameRoom
  socket={socket}
  gameId={gameId}
  gameState={gameState}
  setGameState={setGameState}
  currentRoom={currentRoom}
  player={player}
  userId={player.id}   // ✅ CORRECT
  onLeaveRoom={leaveGame}
/>

    </div>
  );
}
