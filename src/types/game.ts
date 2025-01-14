export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace' | 'joker';

export interface Card {
  suit: Suit;
  rank: Rank;
  isJoker?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isDealer: boolean;
  position: 0 | 1 | 2 | 3; // clockwise from dealer
}

export interface Partnership {
  players: [Player, Player];
  score: number;
}

export interface Bid {
  playerId: string;
  points: number;
  pass: boolean;
}

export type GamePhase = 'dealing' | 'bidding' | 'playing' | 'scoring' | 'gameOver';

export interface GameState {
  deck: Card[];
  players: Player[];
  partnerships: [Partnership, Partnership];
  currentTrick: Card[];
  trumpSuit?: Suit;
  bids: Bid[];
  currentBid?: Bid;
  currentPlayer: number;
  phase: GamePhase;
  pointsAvailable: {
    highTrump: boolean;
    lowTrump: boolean;
    jackOfTrump: boolean;
    offJack: boolean;
    joker: boolean;
    gamePoints: boolean;
  };
  tricks: Card[][];
  currentDealer: number;
  winningScore: number;
} 