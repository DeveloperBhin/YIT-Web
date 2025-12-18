'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState as BaseGameState, Player, Room, Card } from '../types/game';
import PlayerList from './PlayerList';

// Extend GameState to include gameStatus
export interface GameState extends BaseGameState {
  gameStatus: 'waiting' | 'playing' | 'finished';
}

interface GameRoomProps {
  socket: Socket;
  gameId: string;
  playerId: string;
  playerName: string;
  gameState: GameState | null;
  currentRoom: Room;
  player: Player;
  onLeaveRoom: () => void;
}

export default function GameRoom({
  socket,
  gameId,
  playerId,
  playerName,
  gameState,
  currentRoom,
  player,
  onLeaveRoom,
}: GameRoomProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>(player.cards || []);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerCards = (data: { cards: Card[] }) => {
      setPlayerCards(data.cards);
    };

    // Listen for updates to player's hand
    socket.on('playerCards', handlePlayerCards);

    return () => {
      socket.off('playerCards', handlePlayerCards);
    };
  }, [socket]);

  const handleDrawCard = () => {
    socket.emit('draw_card', { playerId });
  };

  const handlePlayCard = (index: number, chosenColor: string | null = null) => {
    socket.emit('play_card', { gameId, playerId, cardIndex: index, chosenColor });
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Room: {currentRoom.gameId}</h2>
        <button className="bg-red-600 px-3 py-1 rounded" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="mb-4">
        {player.isHost && gameState.gameStatus === 'waiting' && (
  <button
    className="bg-green-600 px-3 py-1 rounded mb-4"
    onClick={() => socket.emit('start_game', { gameId })}
  >
    Start Game
  </button>
)}

        <h3 className="font-semibold">Top Card:</h3>
        <div className="inline-block w-16 h-24 ...">
  {gameState?.discardPileTop
    ? `${gameState.discardPileTop.color} ${gameState.discardPileTop.value}`
    : 'No cards yet'}
</div>

      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Players:</h3>
        {gameState.currentPlayerId ? (
          <PlayerList
  players={gameState.players}
  currentPlayerId={gameState.currentPlayerId || ''}
  gameStatus={gameState.gameStatus || 'waiting'}
  playerCards={playerCards}
/>

        ) : (
          <p>Waiting for players...</p>
        )}
      </div>

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
        <button className="mt-2 bg-green-600 px-3 py-1 rounded" onClick={handleDrawCard}>
          Draw Card
        </button>
      </div>

      <div className="mt-4">
        <p>
          <strong>Game Status:</strong> {gameState.gameStatus}
        </p>
        <p>
          <strong>Current Turn:</strong> {gameState.currentPlayerId}
        </p>
      </div>
    </div>
  );
}
