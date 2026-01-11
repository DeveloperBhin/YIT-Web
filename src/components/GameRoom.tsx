'use client';

import { useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState as BaseGameState, Player, Room, Card } from '../types/game';
import PlayerList from './PlayerList';

/* ---------- TYPES ---------- */

interface GameState extends BaseGameState {
  gameStatus: 'waiting' | 'playing' | 'finished';
}

interface TokenPayload {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
}

/* ---------- PROPS ---------- */

interface GameRoomProps {
  socket: Socket | null;
  gameId: string;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  currentRoom: Room | null;
  player: Player | null;
  onLeaveRoom: () => void;
  user: TokenPayload;
}

/* ---------- COMPONENT ---------- */

export default function GameRoom({
  socket,
  gameId,
  gameState,
  setGameState,
  currentRoom,
  player,
  onLeaveRoom,
  user,
}: GameRoomProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- DERIVED ---------- */

  const canRequestState = useMemo(() => {
    return Boolean(socket && gameId && user?.id);
  }, [socket, gameId, user?.id]);

  /* ---------- REQUEST GAME STATE (ONCE READY) ---------- */
  useEffect(() => {
    if (!canRequestState) return;

    console.log('📤 Requesting game state', {
      gameId,
      playerId: user.id,
    });

    socket!.emit('get_game_state', {
      gameId,
      playerId: user.id,
    });
  }, [canRequestState, socket, gameId, user.id]);

  /* ---------- LISTEN FOR GAME STATE ---------- */
  useEffect(() => {
    if (!socket) return;

    console.log('🟢 GameRoom mounted → listening for game_state');

    const handleGameState = (payload: any) => {
      console.log('🎮 game_state received:', payload);

      const game: GameState | undefined = payload?.game ?? payload;

      if (!game || !Array.isArray(game.players)) {
        console.error('❌ Invalid game_state payload', payload);
        return;
      }

      setGameState(game);
      setLoading(false);

      const me = game.players.find((p) => p.id === user.id);

      if (!me) {
        console.warn('⚠️ Player not found in game.players', {
          expected: user.id,
          received: game.players.map((p) => p.id),
        });
        return;
      }

      setPlayerCards(me.cards ?? []);
    };

    socket.on('game_state', handleGameState);

    return () => {
      console.log('🔴 GameRoom unmounted → removing listener');
      socket.off('game_state', handleGameState);
    };
  }, [socket, user.id, setGameState]);

  /* ---------- ACTIONS ---------- */

  const handleDrawCard = () => {
    if (!socket || !gameId) return;
    socket.emit('draw_card', { gameId, playerId: user.id });
  };

  const handlePlayCard = (index: number, chosenColor: string | null = null) => {
    if (!socket || !gameId) return;

    socket.emit('play_card', {
      gameId,
      playerId: user.id,
      cardIndex: index,
      chosenColor,
    });
  };

  const handleStartGame = () => {
    if (!socket || !gameId) return;
    socket.emit('start_game', { gameId });
  };

  /* ---------- GUARDS ---------- */

  if (!socket || !currentRoom || !player) {
    return (
      <div className="p-4 text-center opacity-70">
        Initializing game room…
      </div>
    );
  }

  if (loading || !gameState) {
    return (
      <div className="p-4 text-yellow-400">
        Waiting for game state…
        <div className="text-xs opacity-60 mt-1">Game ID: {gameId}</div>
      </div>
    );
  }

  /* ---------- RENDER ---------- */

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          Game Room {currentRoom.gameId}
        </h2>
        <button
          className="bg-red-600 px-3 py-1 rounded"
          onClick={onLeaveRoom}
        >
          Leave Game
        </button>
      </div>

      {/* Host Controls */}
      {player.isHost && gameState.gameStatus === 'waiting' && (
        <button
          className="bg-green-600 px-3 py-1 rounded mb-4"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}

      {/* Discard Pile */}
      <div className="mb-4">
        <h3 className="font-semibold">Top Card:</h3>
        <div className="inline-flex w-16 h-24 items-center justify-center bg-gray-700 rounded border border-white/30">
          {gameState.discardPileTop
            ? `${gameState.discardPileTop.color} ${gameState.discardPileTop.value}`
            : '—'}
        </div>
      </div>

      {/* Players */}
      <div className="mb-4">
        <h3 className="font-semibold">Players:</h3>
        <PlayerList
          players={gameState.players}
          currentPlayerId={gameState.currentPlayerId ?? ''}
          gameStatus={gameState.gameStatus}
          currentUserId={user.id}
        />
      </div>

      {/* Player Hand */}
      <div className="mt-4">
        <h3 className="font-semibold">Your Hand:</h3>

        <div className="flex gap-2 flex-wrap mt-2">
          {playerCards.map((card, index) => (
            <button
              key={index}
              onClick={() => handlePlayCard(index)}
              className="w-16 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded border border-white/30 flex items-center justify-center hover:scale-105 transition"
            >
              {card.color} {card.value}
            </button>
          ))}
        </div>

        <button
          className="mt-3 bg-green-600 px-3 py-1 rounded"
          onClick={handleDrawCard}
        >
          Draw Card
        </button>
      </div>

      {/* Debug */}
      <div className="mt-4 text-sm opacity-70">
        <p><strong>Status:</strong> {gameState.gameStatus}</p>
        <p><strong>Current Turn:</strong> {gameState.currentPlayerId}</p>
      </div>
    </div>
  );
}
