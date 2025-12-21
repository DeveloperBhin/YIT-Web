import React from 'react';
import { Player, Card } from '../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  gameStatus: 'waiting' | 'playing' | 'finished';
  currentUserId: string;
  onPlayCard?: (index: number, chosenColor?: string | null) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  gameStatus,
  currentUserId,
}) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {players.map((p) => {
        const isCurrentPlayer = p.id === currentPlayerId;
        const isHost = p.isHost;

        const cardsDisplay =
          p.id === currentUserId ? (
            <div className="flex gap-1 flex-wrap">
              {p.cards?.map((c: Card, i: number) => (
                <div
                  key={i}
                  className="w-10 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded border border-white/30 flex items-center justify-center text-xs"
                >
                  {c.color} {c.value}
                </div>
              ))}
            </div>
          ) : p.cards && p.cards.length > 0 ? (
            <div className="flex gap-1">
              <div className="w-10 h-16 bg-gray-700 rounded border border-white/30 flex items-center justify-center text-xs">
                {p.cards[0].color} {p.cards[0].value}
              </div>
              {p.cards.length > 1 && (
                <span className="text-xs text-gray-300 ml-1">+{p.cards.length - 1}</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-300">No cards</p>
          );

        return (
          <div
            key={p.id}
            className={`p-2 rounded border w-36 ${
              isCurrentPlayer
                ? 'border-yellow-400 bg-yellow-100/10'
                : 'border-white/30 bg-gray-800/20'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold truncate">{p.name}</p>
              {isHost && <span className="text-xs text-green-400 font-semibold">Host</span>}
            </div>

            {cardsDisplay}

            {isCurrentPlayer && gameStatus === 'playing' && (
              <p className="text-sm text-yellow-300 font-semibold mt-1">Current Turn</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlayerList;
