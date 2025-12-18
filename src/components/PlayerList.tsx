import React from 'react';
import { Player, Card } from '../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  gameStatus: string;
  playerCards: Card[];
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  gameStatus,
  playerCards,
}) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {players.map((p) => (
        <div
          key={p.id}
          className={`p-2 rounded border ${
            p.id === currentPlayerId ? 'border-yellow-400' : 'border-white/30'
          } ${p.id === currentPlayerId ? 'bg-yellow-100/10' : 'bg-gray-800/20'} w-36`}
        >
          <p className="font-semibold truncate">{p.name}</p>
          <p className="text-sm">
            Cards: {p.cards?.length ?? 0}
          </p>
          {p.id === currentPlayerId && (
            <p className="text-sm text-yellow-300 font-semibold">Current Turn</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
