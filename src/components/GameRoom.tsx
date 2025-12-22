'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState as BaseGameState, Player, Room, Card } from '../types/game';
import PlayerList from './PlayerList';
import {jwtDecode} from 'jwt-decode';

export interface GameState extends BaseGameState {
  gameStatus: 'waiting' | 'playing' | 'finished';
}

interface GameRoomProps {
  socket: Socket;
  gameId: string;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  currentRoom: Room;
  player: Player;
  onLeaveRoom: () => void;
}

interface TokenPayload {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
}

export default function GameRoom({
  socket,
  gameId,
  gameState,
  setGameState,
  currentRoom,
  player,
  onLeaveRoom,
}: GameRoomProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>(player.cards || []);
  const [user, setUser] = useState<TokenPayload | null>(null);

  // Decode JWT from localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

  // Player cards updates
  useEffect(() => {
    if (!socket) return;
    const handlePlayerCards = (data: { cards: Card[] }) => setPlayerCards(data.cards);
    socket.on('playerCards', handlePlayerCards);
    return () => {
      socket.off('playerCards', handlePlayerCards);
    };
  }, [socket]);

  // Game updates
  useEffect(() => {
    if (!socket || !user) return;
    const handleGameUpdate = (updatedGame: GameState) => {
      setGameState(updatedGame);
      const me = updatedGame.players.find((p) => p.id === user.id);
      if (me) setPlayerCards(me.cards || []);
    };
    socket.on('game_started', handleGameUpdate);
    socket.on('game_updated', handleGameUpdate);
    return () => {
      socket.off('game_started', handleGameUpdate);
      socket.off('game_updated', handleGameUpdate);
    };
  }, [socket, setGameState, user]);

  const handleDrawCard = () => {
    if (!user) return;
    socket.emit('draw_card', { playerId: user.id, gameId });
  };

  const handlePlayCard = (index: number, chosenColor: string | null = null) => {
    if (!user) return;
    socket.emit('play_card', { gameId, playerId: user.id, cardIndex: index, chosenColor });
  };

  const handleStartGame = () => socket.emit('start_game', { gameId });

  if (!gameState || !user) return <div>Loading game...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Room: {currentRoom.gameId}</h2>
        <button className="bg-red-600 px-3 py-1 rounded" onClick={onLeaveRoom}>Leave Room</button>
      </div>

      {player.isHost && gameState.gameStatus === 'waiting' && (
        <button className="bg-green-600 px-3 py-1 rounded mb-4" onClick={handleStartGame}>
          Start Game
        </button>
      )}

      <div className="mb-4">
        <h3 className="font-semibold">Top Card:</h3>
        <div className="inline-block w-16 h-24 flex items-center justify-center bg-gray-700 rounded border border-white/30">
          {gameState.discardPileTop
            ? `${gameState.discardPileTop.color} ${gameState.discardPileTop.value}`
            : 'No cards yet'}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Players:</h3>
        {gameState.players.length > 0 ? (
          <PlayerList
            players={gameState.players}
            currentPlayerId={gameState.currentPlayerId || ''}
            gameStatus={gameState.gameStatus}
            currentUserId={user.id}
          />
        ) : <p>Waiting for players...</p>}
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
        <p><strong>Game Status:</strong> {gameState.gameStatus}</p>
        <p><strong>Current Turn:</strong> {gameState.currentPlayerId}</p>
      </div>
    </div>
  );
}
