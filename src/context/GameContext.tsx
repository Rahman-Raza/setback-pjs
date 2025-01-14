import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { GameState, Card, Suit, Player, Bid, Partnership } from '../types/game';
import { createDeck, shuffleDeck, calculateHandPoints } from '../utils/cardUtils';

interface GameContextType {
  state: GameState;
  initializeGame: (playerNames: string[]) => void;
  dealCards: () => void;
  placeBid: (playerId: string, points: number, pass: boolean) => void;
  playCard: (playerId: string, card: Card) => void;
  setTrump: (suit: Suit) => void;
  completeTrick: () => void;
  exportGameState: () => void;
  importGameState: (file: File) => void;
  updatePlayerName: (playerId: string, newName: string) => void;
}

const defaultPlayer: Player = {
  id: '',
  name: '',
  hand: [],
  isDealer: false,
  position: 0,
};

const initialState: GameState = {
  deck: [],
  players: [],
  partnerships: [
    { players: [{ ...defaultPlayer }, { ...defaultPlayer }] as [Player, Player], score: 0 },
    { players: [{ ...defaultPlayer }, { ...defaultPlayer }] as [Player, Player], score: 0 },
  ],
  currentTrick: [],
  bids: [],
  currentPlayer: 0,
  phase: 'dealing',
  pointsAvailable: {
    highTrump: true,
    lowTrump: true,
    jackOfTrump: false,
    offJack: false,
    joker: false,
    gamePoints: true,
  },
  tricks: [],
  currentDealer: 0,
  winningScore: 21,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerNames: string[] } }
  | { type: 'RESTORE_STATE'; payload: { partnerships: [Partnership, Partnership] } }
  | { type: 'DEAL_CARDS' }
  | { type: 'RESTORE_HAND'; payload: { playerId: string; cards: Card[] } }
  | { type: 'SET_TRUMP'; payload: Suit }
  | { type: 'PLACE_BID'; payload: Bid }
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: Card } }
  | { type: 'COMPLETE_TRICK' }
  | { type: 'UPDATE_PLAYER_NAME'; payload: { playerId: string; newName: string } };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const players = action.payload.playerNames.map((name, index) => ({
        id: `player-${index}`,
        name,
        hand: [] as Card[],
        isDealer: index === 0,
        position: index as 0 | 1 | 2 | 3,
      }));

      const partnerships: [Partnership, Partnership] = [
        { players: [players[0], players[2]] as [Player, Player], score: 0 },
        { players: [players[1], players[3]] as [Player, Player], score: 0 },
      ];

      return {
        ...initialState,
        players,
        partnerships,
        phase: 'dealing',
        currentDealer: 0,
      };
    }

    case 'RESTORE_STATE': {
      return {
        ...state,
        partnerships: action.payload.partnerships,
      };
    }

    case 'RESTORE_HAND': {
      const { playerId, cards } = action.payload;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;

      const newPlayers = [...state.players];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        hand: cards,
      };

      return {
        ...state,
        players: newPlayers,
      };
    }

    case 'DEAL_CARDS': {
      const deck = shuffleDeck(createDeck());
      const players = state.players.map(player => ({ ...player, hand: [] as Card[] }));
      
      // Deal 6 cards to each player
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          const playerIndex = (state.currentDealer + 1 + j) % 4;
          const card = deck.pop();
          if (card) {
            players[playerIndex].hand = [...players[playerIndex].hand, card];
          }
        }
      }

      return {
        ...state,
        deck,
        players,
        phase: 'bidding',
        currentPlayer: (state.currentDealer + 1) % 4,
        bids: [],
        currentBid: undefined,
        currentTrick: [],
        trumpSuit: undefined,
        tricks: [],
        pointsAvailable: {
          highTrump: true,
          lowTrump: true,
          jackOfTrump: false,
          offJack: false,
          joker: false,
          gamePoints: true,
        },
      };
    }

    case 'PLACE_BID': {
      const newBids = [...state.bids, action.payload];
      const allPassed = newBids.length === 4 && newBids.every(bid => bid.pass);
      const biddingComplete = newBids.length === 4 || newBids.some(bid => bid.points === 6);
      
      return {
        ...state,
        bids: newBids,
        currentBid: action.payload.pass ? state.currentBid : action.payload,
        currentPlayer: (state.currentPlayer + 1) % 4,
        phase: biddingComplete ? 'playing' : 'bidding',
        // If everyone passes, dealer must bid 2
        ...(allPassed && {
          currentBid: { playerId: state.players[state.currentDealer].id, points: 2, pass: false }
        }),
      };
    }

    case 'PLAY_CARD': {
      const { playerId, card } = action.payload;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;

      const newPlayers = [...state.players];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        hand: newPlayers[playerIndex].hand.filter(c => 
          c.rank !== card.rank || c.suit !== card.suit
        ),
      };

      const newTrick = [...state.currentTrick, card];
      const trickComplete = newTrick.length === 4;

      return {
        ...state,
        players: newPlayers,
        currentTrick: newTrick,
        currentPlayer: (state.currentPlayer + 1) % 4,
        phase: trickComplete ? 'scoring' : 'playing',
      };
    }

    case 'SET_TRUMP':
      return {
        ...state,
        trumpSuit: action.payload,
      };

    case 'COMPLETE_TRICK': {
      const newTricks = [...state.tricks, state.currentTrick];
      const isHandComplete = newTricks.length === 6;

      if (!isHandComplete) {
        return {
          ...state,
          tricks: newTricks,
          currentTrick: [],
          phase: 'playing',
        };
      }

      // If hand is complete, calculate points
      if (!state.trumpSuit || !state.currentBid) return state;

      const points = calculateHandPoints(newTricks, state.trumpSuit);
      const declaringPartnership = state.partnerships.findIndex(p => 
        p.players.some(player => player.id === state.currentBid?.playerId)
      );
      
      const pointsWon = [0, 0];
      
      // Assign points to partnerships
      if (points.highTrumpWinner !== -1) {
        pointsWon[points.highTrumpWinner % 2]++;
      }
      if (points.lowTrumpWinner !== -1) {
        pointsWon[points.lowTrumpWinner % 2]++;
      }
      if (points.jackTrumpWinner !== null) {
        pointsWon[points.jackTrumpWinner % 2]++;
      }
      if (points.offJackWinner !== null) {
        pointsWon[points.offJackWinner % 2]++;
      }
      if (points.jokerWinner !== null) {
        pointsWon[points.jokerWinner % 2]++;
      }
      if (points.gamePointsWinner !== -1) {
        pointsWon[points.gamePointsWinner % 2]++;
      }

      const newPartnerships: [Partnership, Partnership] = [
        {
          ...state.partnerships[0],
          score: state.partnerships[0].score + (declaringPartnership === 0 
            ? (pointsWon[0] >= (state.currentBid?.points || 0) ? pointsWon[0] : -(state.currentBid?.points || 0))
            : pointsWon[0])
        },
        {
          ...state.partnerships[1],
          score: state.partnerships[1].score + (declaringPartnership === 1
            ? (pointsWon[1] >= (state.currentBid?.points || 0) ? pointsWon[1] : -(state.currentBid?.points || 0))
            : pointsWon[1])
        }
      ];

      // Check if game is won
      const gameWon = newPartnerships.some(p => p.score >= state.winningScore);

      return {
        ...state,
        tricks: newTricks,
        currentTrick: [],
        partnerships: newPartnerships,
        phase: gameWon ? 'gameOver' : 'dealing',
        currentDealer: (state.currentDealer + 1) % 4,
      };
    }

    case 'UPDATE_PLAYER_NAME': {
      const { playerId, newName } = action.payload;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;

      const newPlayers = [...state.players];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        name: newName,
      };

      // Update partnerships to reflect the name change
      const newPartnerships: [Partnership, Partnership] = [
        {
          ...state.partnerships[0],
          players: [
            state.partnerships[0].players[0].id === playerId 
              ? { ...state.partnerships[0].players[0], name: newName }
              : state.partnerships[0].players[0],
            state.partnerships[0].players[1].id === playerId
              ? { ...state.partnerships[0].players[1], name: newName }
              : state.partnerships[0].players[1],
          ] as [Player, Player],
        },
        {
          ...state.partnerships[1],
          players: [
            state.partnerships[1].players[0].id === playerId
              ? { ...state.partnerships[1].players[0], name: newName }
              : state.partnerships[1].players[0],
            state.partnerships[1].players[1].id === playerId
              ? { ...state.partnerships[1].players[1], name: newName }
              : state.partnerships[1].players[1],
          ] as [Player, Player],
        },
      ];

      return {
        ...state,
        players: newPlayers,
        partnerships: newPartnerships,
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved state after mounting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('setbackGameState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState.players.length > 0) {
            // Initialize game with saved players
            dispatch({ 
              type: 'INITIALIZE_GAME', 
              payload: { playerNames: parsedState.players.map((p: Player) => p.name) }
            });

            // Restore partnerships
            dispatch({
              type: 'RESTORE_STATE',
              payload: { partnerships: parsedState.partnerships }
            });

            // Restore the deck and deal cards if needed
            if (parsedState.phase !== 'dealing') {
              dispatch({ type: 'DEAL_CARDS' });
              
              // Restore player hands
              parsedState.players.forEach((player: Player, index: number) => {
                dispatch({
                  type: 'RESTORE_HAND',
                  payload: { playerId: `player-${index}`, cards: player.hand }
                });
              });
            }

            // Restore other state properties
            if (parsedState.trumpSuit) {
              dispatch({ type: 'SET_TRUMP', payload: parsedState.trumpSuit });
            }

            // Restore bids
            parsedState.bids.forEach((bid: Bid) => {
              dispatch({ type: 'PLACE_BID', payload: bid });
            });

            // Restore tricks
            parsedState.tricks.forEach((trick: Card[]) => {
              trick.forEach((card: Card) => {
                const playerId = parsedState.players[parsedState.currentPlayer].id;
                dispatch({ type: 'PLAY_CARD', payload: { playerId, card } });
              });
              if (trick.length === 4) {
                dispatch({ type: 'COMPLETE_TRICK' });
              }
            });

            // Restore current trick
            parsedState.currentTrick.forEach((card: Card) => {
              const playerId = parsedState.players[parsedState.currentPlayer].id;
              dispatch({ type: 'PLAY_CARD', payload: { playerId, card } });
            });
          }
        } catch (error) {
          console.error('Error loading saved game state:', error);
        }
      }
      setMounted(true);
    }
  }, []);

  // Save state to session storage whenever it changes, but only after mounted
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      sessionStorage.setItem('setbackGameState', JSON.stringify(state));
    }
  }, [state, mounted]);

  const initializeGame = (playerNames: string[]) => {
    console.log('Initializing game with players:', playerNames);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('setbackGameState');
    }
    dispatch({ type: 'INITIALIZE_GAME', payload: { playerNames } });
  };

  const dealCards = () => {
    console.log('Dealing cards...');
    dispatch({ type: 'DEAL_CARDS' });
  };

  const placeBid = (playerId: string, points: number, pass: boolean) => {
    dispatch({ type: 'PLACE_BID', payload: { playerId, points, pass } });
  };

  const playCard = (playerId: string, card: Card) => {
    dispatch({ type: 'PLAY_CARD', payload: { playerId, card } });
  };

  const setTrump = (suit: Suit) => {
    dispatch({ type: 'SET_TRUMP', payload: suit });
  };

  const completeTrick = () => {
    dispatch({ type: 'COMPLETE_TRICK' });
  };

  const exportGameState = () => {
    const gameState = JSON.stringify(state, null, 2);
    const blob = new Blob([gameState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `setback-game-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importGameState = async (file: File) => {
    try {
      const text = await file.text();
      const parsedState = JSON.parse(text);
      
      // Initialize game with saved players
      dispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: { playerNames: parsedState.players.map((p: Player) => p.name) }
      });

      // Restore partnerships
      dispatch({
        type: 'RESTORE_STATE',
        payload: { partnerships: parsedState.partnerships }
      });

      // Restore the deck and deal cards if needed
      if (parsedState.phase !== 'dealing') {
        dispatch({ type: 'DEAL_CARDS' });
        
        // Restore player hands
        parsedState.players.forEach((player: Player, index: number) => {
          dispatch({
            type: 'RESTORE_HAND',
            payload: { playerId: `player-${index}`, cards: player.hand }
          });
        });
      }

      // Restore other state properties
      if (parsedState.trumpSuit) {
        dispatch({ type: 'SET_TRUMP', payload: parsedState.trumpSuit });
      }

      // Restore bids
      parsedState.bids.forEach((bid: Bid) => {
        dispatch({ type: 'PLACE_BID', payload: bid });
      });

      // Restore tricks
      parsedState.tricks.forEach((trick: Card[]) => {
        trick.forEach((card: Card) => {
          const playerId = parsedState.players[parsedState.currentPlayer].id;
          dispatch({ type: 'PLAY_CARD', payload: { playerId, card } });
        });
        if (trick.length === 4) {
          dispatch({ type: 'COMPLETE_TRICK' });
        }
      });

      // Restore current trick
      parsedState.currentTrick.forEach((card: Card) => {
        const playerId = parsedState.players[parsedState.currentPlayer].id;
        dispatch({ type: 'PLAY_CARD', payload: { playerId, card } });
      });
    } catch (error) {
      console.error('Error importing game state:', error);
      alert('Error importing game state. Please check if the file is valid.');
    }
  };

  const updatePlayerName = (playerId: string, newName: string) => {
    dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { playerId, newName } });
  };

  // Always render with initial state on first mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <GameContext.Provider value={{ 
        state: initialState, 
        initializeGame, 
        dealCards, 
        placeBid, 
        playCard, 
        setTrump,
        completeTrick,
        exportGameState,
        importGameState,
        updatePlayerName,
      }}>
        {children}
      </GameContext.Provider>
    );
  }

  return (
    <GameContext.Provider value={{ 
      state, 
      initializeGame, 
      dealCards, 
      placeBid, 
      playCard, 
      setTrump,
      completeTrick,
      exportGameState,
      importGameState,
      updatePlayerName,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 