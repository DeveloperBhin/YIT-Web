'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import {
  GameState as BaseGameState,
  Player,
  Room,
  Card,
} from '../types/game';
import PlayerList from './PlayerList';

/* ---------- TYPES ---------- */

interface GameState extends BaseGameState {
  gameStatus: 'waiting' | 'playing' | 'finished';
}

/* ---------- PROPS ---------- */

interface GameRoomProps {
  socket: Socket;
  gameId: string;
  currentRoom: Room;
  player: Player;
  userId: string;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  onLeaveRoom: () => void;
}

/* ---------- COMPONENT ---------- */

export default function GameRoom({
  socket,
  gameId,
  currentRoom,
  player,
  userId,
  gameState,
  setGameState,
  onLeaveRoom,
}: GameRoomProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  /** prevent duplicate listeners in React strict mode */
  const listenerAttached = useRef(false);

  /* ---------- READY FLAG ---------- */

  const ready = useMemo(() => {
    return Boolean(socket && gameId && userId);
  }, [socket, gameId, userId]);

  /* ---------- REQUEST GAME STATE (ONCE READY) ---------- */

  useEffect(() => {
    if (!ready) return;

    console.log('📤 Requesting game state', {
      gameId,
      playerId: userId,
    });

    socket.emit('get_game_state', {
      gameId,
      playerId: userId,
    });
  }, [ready, socket, gameId, userId]);

  /* ---------- LISTEN FOR GAME STATE ---------- */

  useEffect(() => {
    if (!socket || listenerAttached.current) return;

    console.log('🟢 GameRoom mounted → listening for game_state');

    const handleGameState = (payload: unknown) => {
      const game = (payload as any)?.game ?? payload;

      if (
        !game ||
        !Array.isArray(game.players) ||
        !game.gameStatus
      ) {
        console.error('❌ Invalid game_state payload', payload);
        return;
      }

      setGameState(game);
      setLoading(false);

      const me = game.players.find(
        (p: Player) => p.id === userId
      );

      if (!me) {
        console.warn('⚠️ Player not found in game.players', {
          expected: userId,
          received: game.players.map((p: Player) => p.id),
        });
        return;
      }

      setPlayerCards(me.cards ?? []);
    };

    socket.on('game_state', handleGameState);
    listenerAttached.current = true;

    return () => {
      console.log('🔴 GameRoom unmounted → removing listener');
      socket.off('game_state', handleGameState);
      listenerAttached.current = false;
    };
  }, [socket, userId, setGameState]);

  /* ---------- ACTIONS ---------- */

  const handleDrawCard = () => {
    socket.emit('draw_card', {
      gameId,
      playerId: userId,
    });
  };

  const handlePlayCard = (
    index: number,
    chosenColor: string | null = null
  ) => {
    socket.emit('play_card', {
      gameId,
      playerId: userId,
      cardIndex: index,
      chosenColor,
    });
  };

  const handleStartGame = () => {
    socket.emit('start_game', { gameId });
  };

  /* ---------- GUARD ---------- */

  if (loading || !gameState) {
    return (
      <div className="p-4 text-yellow-400">
        Waiting for game state…
        <div className="text-xs opacity-60 mt-1">
          Game ID: {gameId}
        </div>
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
          currentUserId={userId}
        />
      </div>

      {/* Hand */}
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
        <p>
          <strong>Status:</strong> {gameState.gameStatus}
        </p>
        <p>
          <strong>Current Turn:</strong>{' '}
          {gameState.currentPlayerId}
        </p>
      </div>
    </div>
  );
}
