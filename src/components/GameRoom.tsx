'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState as BaseGameState, Player, Room, Card } from '../types/game';
import PlayerList from './PlayerList';

export interface GameState extends BaseGameState {
  gameStatus: 'waiting' | 'playing' | 'finished';
}

interface GameRoomProps {
  socket: Socket;
  gameId: string;
  playerId: string;
  playerName: string;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
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
  setGameState,
  currentRoom,
  player,
  onLeaveRoom,
}: GameRoomProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>(player.cards || []);

  // Listen to player's hand updates
  useEffect(() => {
    if (!socket) return;

    const handlePlayerCards = (data: { cards: Card[] }) => setPlayerCards(data.cards);

    socket.on('playerCards', handlePlayerCards);
    return () => {
      socket.off('playerCards', handlePlayerCards);
    };
  }, [socket]);

  // Listen for game started or updated
  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (updatedGame: GameState) => {
      setGameState(updatedGame);
      const me = updatedGame.players.find((p) => p.id === playerId);
      if (me) setPlayerCards(me.cards || []);
    };

    socket.on('game_started', handleGameUpdate);
    socket.on('game_updated', handleGameUpdate);

    return () => {
      socket.off('game_started', handleGameUpdate);
      socket.off('game_updated', handleGameUpdate);
    };
  }, [socket, setGameState, playerId]);

  const handleDrawCard = () => {
    socket.emit('draw_card', { playerId, gameId });
  };

  const handlePlayCard = (index: number, chosenColor: string | null = null) => {
    socket.emit('play_card', { gameId, playerId, cardIndex: index, chosenColor });
  };

  const handleStartGame = () => {
    socket.emit('start_game', { gameId });
  };

  if (!gameState) return <div>Loading game...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Room: {currentRoom.gameId}</h2>
        <button className="bg-red-600 px-3 py-1 rounded" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>

      {/* Host Start Button */}
      {player.isHost && gameState.gameStatus === 'waiting' && (
        <button
          className="bg-green-600 px-3 py-1 rounded mb-4"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}

      {/* Top card */}
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
            currentUserId={playerId}
          />
        ) : (
          <p>Waiting for players...</p>
        )}
      </div>

      {/* Player hand */}
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

      {/* Game info */}
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
