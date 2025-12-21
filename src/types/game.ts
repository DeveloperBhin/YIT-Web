export interface Card {
  id: string;
  type: 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4';
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  cards?: Card[];       // Only for the current player
  cardsCount?: number;  // For other players
  hasUno: boolean;
  isHost: boolean;
  score: number;
}

export interface Room {
  gameId: string;
  host?: string;
  hostName?:string;
  playerCount?: number;
  maxPlayers?: number;
    currentPlayers?: number; // ✅ add this

  players?: Player[];
  isPrivate?: boolean;
  settings?: {
    allowSpectators?: boolean;
    gameSpeed?: 'slow' | 'normal' | 'fast';
    maxScore?: number;
  };
}

export interface GameState {
  id: string; // gameId
  status: 'waiting' | 'playing' | 'finished';
  currentPlayerId: string | null;
  direction: 'clockwise' | 'counterclockwise';
  topCard: Card | null;          // For reference
  discardPileTop: Card | null;   // Use this in UI
  drawPileCount: number;
  drawPile?: Card[];
  discardPile?: Card[];
  players: Player[];
  winner?: Player | null;
  gameOver?: boolean;
  currentColor?: 'red' | 'blue' | 'green' | 'yellow';
  drawCount?: number;
  skipCount?: number;

  // Extra fields needed by GameRoom
  gameStatus: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;            // ✅ Added to fix TS errors
}
