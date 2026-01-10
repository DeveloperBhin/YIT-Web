'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameState as BaseGameState, Player, Room, Card } from '../types/game';
import PlayerList from './PlayerList';

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

  // Listen for game state updates
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (game: GameState) => {
      setGameState(game);
      const me = game.players.find((p) => p.id === user.id);
      if (me) setPlayerCards(me.cards || []);
    };
    

    socket.on('game_state', handleGameState);
    return () => {socket.off('game_state', handleGameState)};
  }, [socket, user, setGameState]);

  

  const handleDrawCard = () => socket.emit('draw_card', { playerId: user.id, gameId });
  const handlePlayCard = (index: number, chosenColor: string | null = null) =>
    socket.emit('play_card', { gameId, playerId: user.id, cardIndex: index, chosenColor });
  const handleStartGame = () => socket.emit('start_game', { gameId });

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Game Room {currentRoom.gameId}</h2>
        <button className="bg-red-600 px-3 py-1 rounded" onClick={onLeaveRoom}>
          Leave Game
        </button>
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
