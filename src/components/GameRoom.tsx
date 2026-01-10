'use client';

import { useEffect, useState } from 'react';
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
  token?: string;
}

interface GameRoomProps {
  socket: Socket;
  gameId: string;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  currentRoom: Room;
  player: Player;
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
  const [playerCards, setPlayerCards] = useState<Card[]>(player.cards || []);
  const [loading, setLoading] = useState(true);

  /* ---------- REQUEST GAME STATE ON MOUNT ---------- */
  useEffect(() => {
    if (!socket) return;

    console.log('📤 Requesting game state', { gameId, playerId: user.id });

    socket.emit('get_game_state', {
      gameId,
      playerId: user.id,
    });
  }, [socket, gameId, user.id]);

  useEffect(() => {
  console.log('📤 Requesting game state', { gameId, playerId: user.id });
  socket.emit('get_game_state', {
    gameId,
    playerId: user.id,
  });
}, [socket, gameId, user.id]);

  /* ---------- LISTEN FOR GAME STATE ---------- */
  useEffect(() => {
    if (!socket) {
      console.warn('❌ socket not available');
      return;
    }

    console.log('🟢 GameRoom mounted, listening for game_state');

    const handleGameState = (payload: any) => {
      console.log('🎮 game_state payload received:', payload);

      // ✅ Handle wrapped or raw payload
      const game: GameState | undefined = payload?.game ?? payload;

      if (!game || !game.players) {
        console.error('❌ Invalid game state structure', payload);
        return;
      }

      setGameState(game);
      setLoading(false);

      // 🔍 Match player safely
      const me = game.players.find((p) => p.id === user.id);

      if (!me) {
        console.warn('⚠️ Player not found in game.players', {
          jwtUserId: user.id,
          players: game.players.map((p) => p.id),
        });
      } else {
        setPlayerCards(me.cards || []);
      }
    };

    socket.on('game_state', handleGameState);

    return () => {
      console.log('🔴 GameRoom unmounted, removing listener');
      socket.off('game_state', handleGameState);
    };
  }, [socket, user.id, setGameState]);

  /* ---------- ACTIONS ---------- */
  const handleDrawCard = () => {
    console.log('🃏 draw_card');
    socket.emit('draw_card', { gameId, playerId: user.id });
  };

  const handlePlayCard = (index: number, chosenColor: string | null = null) => {
    console.log('▶️ play_card', { index, chosenColor });
    socket.emit('play_card', {
      gameId,
      playerId: user.id,
      cardIndex: index,
      chosenColor,
    });
  };

  const handleStartGame = () => {
    console.log('🚀 start_game');
    socket.emit('start_game', { gameId });
  };

  /* ---------- UI STATES ---------- */
  if (loading) {
    return (
      <div className="p-4 text-yellow-400">
        Waiting for game state…
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="p-4 text-red-400">
        Failed to load game state
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
        <div className="inline-block w-16 h-24 flex items-center justify-center bg-gray-700 rounded border border-white/30">
          {gameState.discardPileTop
            ? `${gameState.discardPileTop.color} ${gameState.discardPileTop.value}`
            : 'No cards yet'}
        </div>
      </div>

      {/* Players */}
      <div className="mb-4">
        <h3 className="font-semibold">Players:</h3>
        {gameState.players.length > 0 ? (
          <PlayerList
            players={gameState.players}
            currentPlayerId={gameState.currentPlayerId || ''}
            gameStatus={gameState.gameStatus}
            currentUserId={user.id}
          />
        ) : (
          <p>Waiting for players…</p>
        )}
      </div>

      {/* Player Hand */}
      <div className="mt-4">
        <h3 className="font-semibold">Your Hand:</h3>

        <div className="flex gap-2 flex-wrap mt-2">
          {playerCards.map((card, index) => (
            <div
              key={index}
              className="w-16 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded border border-white/30 flex items-center justify-center cursor-pointer hover:scale-105 transition"
              onClick={() => handlePlayCard(index)}
            >
              {card.color} {card.value}
            </div>
          ))}
        </div>

        <button
          className="mt-2 bg-green-600 px-3 py-1 rounded"
          onClick={handleDrawCard}
        >
          Draw Card
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-4 text-sm opacity-70">
        <p><strong>Status:</strong> {gameState.gameStatus}</p>
        <p><strong>Current Turn:</strong> {gameState.currentPlayerId}</p>
      </div>
    </div>
  );
}
