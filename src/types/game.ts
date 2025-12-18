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
  cards?: Card[]; // undefined for other players
  cardsCount?: number; // total cards for other players
  hasUno: boolean;
  isHost: boolean;
  score: number;
}

export interface Room {
  gameId: string;
  host?: string; // optional, may not be in server response
  playerCount?: number;
  maxPlayers?: number;
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
  topCard: Card | null; // discardPileTop in server
  drawPileCount: number;
  discardPileTop: Card | null;
  drawPile?: Card[]; // optional if you never send full pile
  discardPile?: Card[];
  players: Player[];
  winner?: Player | null;
  gameOver?: boolean;
  currentColor?: 'red' | 'blue' | 'green' | 'yellow';
  drawCount?: number;
  skipCount?: number;
    gameStatus: 'waiting' | 'playing' | 'finished';

}
