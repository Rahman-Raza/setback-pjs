import { Card, Suit, Rank } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  // Add standard cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  
  // Add joker
  deck.push({ suit: 'hearts', rank: 'joker', isJoker: true });
  
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardPoints(card: Card): number {
  if (card.isJoker) return 0;
  switch (card.rank) {
    case 'jack': return 1;
    case 'queen': return 2;
    case 'king': return 3;
    case 'ace': return 4;
    case '10': return 10;
    default: return 0;
  }
}

export function isHigherCard(card1: Card, card2: Card, leadSuit: Suit, trumpSuit: Suit): boolean {
  if (card1.isJoker) return true;
  if (card2.isJoker) return false;
  
  const card1IsTrump = card1.suit === trumpSuit;
  const card2IsTrump = card2.suit === trumpSuit;
  
  if (card1IsTrump && !card2IsTrump) return true;
  if (!card1IsTrump && card2IsTrump) return false;
  
  if (card1IsTrump && card2IsTrump) {
    return getRankValue(card1.rank) > getRankValue(card2.rank);
  }
  
  const card1IsLead = card1.suit === leadSuit;
  const card2IsLead = card2.suit === leadSuit;
  
  if (card1IsLead && !card2IsLead) return true;
  if (!card1IsLead && card2IsLead) return false;
  
  return getRankValue(card1.rank) > getRankValue(card2.rank);
}

function getRankValue(rank: Rank): number {
  const rankOrder: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14, 'joker': 15
  };
  return rankOrder[rank];
}

export function calculateTrickWinner(trick: Card[], leadSuit: Suit, trumpSuit: Suit): number {
  let winningCardIndex = 0;
  
  for (let i = 1; i < trick.length; i++) {
    if (isHigherCard(trick[i], trick[winningCardIndex], leadSuit, trumpSuit)) {
      winningCardIndex = i;
    }
  }
  
  return winningCardIndex;
}

export function calculateHandPoints(tricks: Card[][], trumpSuit: Suit): {
  highTrumpWinner: number;
  lowTrumpWinner: number;
  jackTrumpWinner: number | null;
  offJackWinner: number | null;
  jokerWinner: number | null;
  gamePointsWinner: number;
} {
  let highTrump: { value: number; player: number } = { value: -1, player: -1 };
  let lowTrump: { value: number; player: number } = { value: 16, player: -1 };
  let jackTrump: number | null = null;
  let offJack: number | null = null;
  let jokerHolder: number | null = null;
  let gamePoints: number[] = [0, 0, 0, 0];

  tricks.forEach(trick => {
    trick.forEach((card, playerOffset) => {
      // Calculate game points
      gamePoints[playerOffset] += getCardPoints(card);

      if (card.suit === trumpSuit) {
        const rankValue = getRankValue(card.rank);
        
        // High trump
        if (rankValue > highTrump.value) {
          highTrump = { value: rankValue, player: playerOffset };
        }
        
        // Low trump
        if (rankValue < lowTrump.value) {
          lowTrump = { value: rankValue, player: playerOffset };
        }
        
        // Jack of trump
        if (card.rank === 'jack') {
          jackTrump = playerOffset;
        }
      } else {
        // Off jack (jack of same color suit)
        if (card.rank === 'jack' && isSameColor(card.suit, trumpSuit)) {
          offJack = playerOffset;
        }
      }

      // Joker
      if (card.isJoker) {
        jokerHolder = playerOffset;
      }
    });
  });

  // Calculate game points winner
  let maxGamePoints = -1;
  let gamePointsWinner = 0;
  gamePoints.forEach((points, player) => {
    if (points > maxGamePoints) {
      maxGamePoints = points;
      gamePointsWinner = player;
    }
  });

  return {
    highTrumpWinner: highTrump.player,
    lowTrumpWinner: lowTrump.player,
    jackTrumpWinner: jackTrump,
    offJackWinner: offJack,
    jokerWinner: jokerHolder,
    gamePointsWinner,
  };
}

function isSameColor(suit1: Suit, suit2: Suit): boolean {
  return (
    (suit1 === 'hearts' && suit2 === 'diamonds') ||
    (suit1 === 'diamonds' && suit2 === 'hearts') ||
    (suit1 === 'clubs' && suit2 === 'spades') ||
    (suit1 === 'spades' && suit2 === 'clubs')
  );
}

export function calculatePartnershipPoints(
  playerPoints: { [key: string]: number },
  partnerships: [string, string][]
): number[] {
  return partnerships.map(([player1, player2]) => 
    (playerPoints[player1] || 0) + (playerPoints[player2] || 0)
  );
} 