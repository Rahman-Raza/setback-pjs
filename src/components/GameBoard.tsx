import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTutorial } from '../context/TutorialContext';
import { Card as CardType, Partnership, Player } from '../types/game';
import { calculateHandPoints, getRankValue } from '../utils/cardUtils';
import TutorialOverlay from './TutorialOverlay';
import PlayerNameForm from './PlayerNameForm';
import EditPlayerName from './EditPlayerName';
import TrickAnimation from './TrickAnimation';
import GameHistoryViewer from './GameHistoryViewer';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  playerName?: string;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled, playerName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-800';
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getRankDisplay = (rank: string) => {
    switch (rank) {
      case 'ace': return 'A';
      case 'king': return 'K';
      case 'queen': return 'Q';
      case 'jack': return 'J';
      default: return rank;
    }
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      setIsClicked(true);
      // Reset the click state after animation
      setTimeout(() => setIsClicked(false), 200);
      onClick();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {playerName && (
        <div className="text-white text-sm mb-1 font-medium">{playerName}</div>
      )}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        className={`
          relative w-20 h-32 rounded-xl border-2
          ${disabled ? 'opacity-50 border-gray-300 cursor-not-allowed' : 
            isClicked ? 'border-blue-600 shadow-lg scale-95' :
            isHovered ? 'border-blue-400 shadow-xl translate-y-[-8px]' : 'border-white'} 
          bg-white shadow-md
          transform transition-all duration-200 ease-in-out
          flex flex-col justify-between p-2
          ${!disabled && 'hover:z-10'}
        `}
      >
        {card.isJoker ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🃏
          </div>
        ) : (
          <>
            {/* Top left */}
            <div className={`text-lg font-bold ${getSuitColor(card.suit)} text-left`}>
              {getRankDisplay(card.rank)}
              <span className="text-xl ml-0.5">{getSuitSymbol(card.suit)}</span>
            </div>
            
            {/* Center */}
            <div className={`text-4xl ${getSuitColor(card.suit)} text-center
                           transform transition-transform duration-200
                           ${isHovered && !disabled ? 'scale-125' : 'scale-100'}`}>
              {getSuitSymbol(card.suit)}
            </div>
            
            {/* Bottom right */}
            <div className={`text-lg font-bold ${getSuitColor(card.suit)} text-right rotate-180`}>
              {getRankDisplay(card.rank)}
              <span className="text-xl ml-0.5">{getSuitSymbol(card.suit)}</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
};

interface ScoringDialogProps {
  points: {
    highTrumpWinner: number;
    lowTrumpWinner: number;
    jackTrumpWinner: number | null;
    offJackWinner: number | null;
    jokerWinner: number | null;
    gamePointsWinner: number;
  };
  partnerships: [Partnership, Partnership];
  onClose: () => void;
}

const ScoringDialog: React.FC<ScoringDialogProps> = ({ points, partnerships, onClose }) => {
  const getPartnershipName = (playerIndex: number) => {
    const partnershipIndex = playerIndex % 2;
    return `${partnerships[partnershipIndex].players[0].name} & ${partnerships[partnershipIndex].players[1].name}`;
  };

  // Calculate total points won by each partnership
  const pointsWon = [0, 0];
  if (points.highTrumpWinner !== -1) pointsWon[points.highTrumpWinner % 2]++;
  if (points.lowTrumpWinner !== -1) pointsWon[points.lowTrumpWinner % 2]++;
  if (points.jackTrumpWinner !== null) pointsWon[points.jackTrumpWinner % 2]++;
  if (points.offJackWinner !== null) pointsWon[points.offJackWinner % 2]++;
  if (points.jokerWinner !== null) pointsWon[points.jokerWinner % 2]++;
  if (points.gamePointsWinner !== -1) pointsWon[points.gamePointsWinner % 2]++;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 border-b pb-4">Hand Summary</h2>
        
        {/* Points breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Points Earned</h3>
          <div className="space-y-3">
            {points.highTrumpWinner !== -1 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">High Trump</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.highTrumpWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
            {points.lowTrumpWinner !== -1 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">Low Trump</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.lowTrumpWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
            {points.jackTrumpWinner !== null && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">Jack of Trump</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.jackTrumpWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
            {points.offJackWinner !== null && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">Off Jack</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.offJackWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
            {points.jokerWinner !== null && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">Joker</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.jokerWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
            {points.gamePointsWinner !== -1 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg font-medium text-gray-900">Game Points</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{getPartnershipName(points.gamePointsWinner)}</span>
                  <span className="text-lg font-bold text-green-600">+1</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total points won this hand */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4 text-blue-900">Total Points Won</h3>
          {partnerships.map((partnership, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <span className="text-lg font-bold text-blue-900">
                {partnership.players[0].name} & {partnership.players[1].name}
              </span>
              <span className="text-2xl font-bold text-blue-900">{pointsWon[index]}</span>
            </div>
          ))}
        </div>

        {/* Final scores with explanation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Final Scores</h3>
          {partnerships.map((partnership, index) => {
            const scoreChange = partnership.score - (partnerships[index].score - pointsWon[index]);
            const isNegative = scoreChange < 0;
            return (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {partnership.players[0].name} & {partnership.players[1].name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{partnership.score}</span>
                    <span className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      ({isNegative ? '' : '+'}
                      {scoreChange})
                    </span>
                  </div>
                </div>
                {isNegative && (
                  <div className="mt-2 text-base font-medium text-red-600 bg-red-50 p-3 rounded-lg">
                    Failed to make bid of {Math.abs(scoreChange)} points
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 
                   transition-colors duration-200 font-bold text-lg shadow-md"
        >
          Continue to Next Hand
        </button>
      </div>
    </div>
  );
};

const GameBoard: React.FC = () => {
  const { 
    state, 
    playCard, 
    placeBid, 
    setTrump, 
    dealCards, 
    initializeGame,
    completeTrick,
    exportGameState,
    importGameState,
    updatePlayerName
  } = useGame();
  const { startTutorial } = useTutorial();
  const { currentPlayer, phase, players, currentTrick, trumpSuit, partnerships, currentBid, bids } = state;
  const [showScoringDialog, setShowScoringDialog] = useState(false);
  const [lastHandPoints, setLastHandPoints] = useState<ScoringDialogProps['points'] | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showTrickAnimation, setShowTrickAnimation] = useState(false);
  const [trickWinner, setTrickWinner] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  const handleStartGame = (playerNames: string[]) => {
    console.log('Starting game with players:', playerNames);
    // Initialize game with custom player names
    initializeGame(playerNames);
    
    // Deal cards after a short delay to ensure initialization is complete
    setTimeout(() => {
      console.log('Dealing initial cards...');
      dealCards();
    }, 100);
  };

  const handleStartTutorial = () => {
    console.log('Starting tutorial...');
    startTutorial(state);
  };

  const handleCardClick = (card: CardType) => {
    if (phase === 'playing' && players[currentPlayer]) {
      playCard(players[currentPlayer].id, card);
      
      if (!trumpSuit) {
        setTrump(card.suit);
      }
    }
  };

  const handleBid = (points: number, pass: boolean = false) => {
    if (phase === 'bidding' && players[currentPlayer]) {
      placeBid(players[currentPlayer].id, points, pass);
    }
  };

  const handleNextHand = () => {
    setShowScoringDialog(false);
    dealCards();
  };

  const determineTrickWinner = (trick: CardType[]): string => {
    if (!trick.length || !trumpSuit) return '';
    
    let winningCard = trick[0];
    let winningIndex = 0;
    const leadSuit = trick[0].suit;

    trick.forEach((card, index) => {
      // Handle joker
      if (card.isJoker) {
        winningCard = card;
        winningIndex = index;
        return;
      }
      if (winningCard.isJoker) return;

      // Handle trump
      if (card.suit === trumpSuit && winningCard.suit !== trumpSuit) {
        winningCard = card;
        winningIndex = index;
      } else if (card.suit === trumpSuit && winningCard.suit === trumpSuit) {
        if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
          winningCard = card;
          winningIndex = index;
        }
      } else if (card.suit === leadSuit && winningCard.suit === leadSuit) {
        if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
          winningCard = card;
          winningIndex = index;
        }
      }
    });

    // Calculate which player won based on the first player and winning index
    const firstPlayerIndex = (currentPlayer - trick.length + 4) % 4;
    const winningPlayerIndex = (firstPlayerIndex + winningIndex) % 4;
    return players[winningPlayerIndex]?.name || '';
  };

  const handleCompleteTrick = () => {
    if (currentTrick.length === 4) {
      const winner = determineTrickWinner(currentTrick);
      setTrickWinner(winner);
      setShowTrickAnimation(true);
    }
  };

  const handleAnimationComplete = () => {
    setShowTrickAnimation(false);
    if (state.tricks.length === 5 && state.currentTrick.length === 4) {
      // This is the last trick of the hand
      const points = calculateHandPoints([...state.tricks, state.currentTrick], state.trumpSuit!);
      setLastHandPoints(points);
      setShowScoringDialog(true);
    }
    completeTrick();
  };

  const getHighestBid = () => {
    if (!bids.length) return null;
    const nonPassBids = bids.filter(bid => !bid.pass);
    if (!nonPassBids.length) return null;
    return nonPassBids.reduce((highest, current) => 
      current.points > highest.points ? current : highest
    );
  };

  const highestBid = getHighestBid();
  const minBid = highestBid ? highestBid.points + 1 : 2;

  // Function to get player name for a card in the current trick
  const getPlayerNameForCard = (index: number): string => {
    // Calculate which player played this card based on the first player of the trick
    const firstPlayer = (currentTrick.length === 0) ? currentPlayer : 
      (currentPlayer - currentTrick.length + 4) % 4;
    const playerIndex = (firstPlayer + index) % 4;
    return players[playerIndex]?.name || '';
  };

  const handleResetGame = () => {
    setShowSidebar(false);
    handleStartGame(['North', 'East', 'South', 'West']);
  };

  const handleEditPlayerName = (playerId: string, newName: string) => {
    updatePlayerName(playerId, newName);
    setEditingPlayer(null);
  };

  // Add this function to prepare trick history data
  const getTrickHistory = () => {
    return state.tricks.map((trick, index) => {
      const firstPlayerIndex = (state.currentDealer + 1 + (index * 4)) % 4;
      const winningPlayerIndex = determineTrickWinnerIndex(trick);
      return {
        cards: trick,
        winningPlayerName: players[winningPlayerIndex]?.name || '',
        leadPlayerName: players[firstPlayerIndex]?.name || '',
        trumpSuit: state.trumpSuit!
      };
    });
  };

  // Helper function to determine the winning player index
  const determineTrickWinnerIndex = (trick: CardType[]): number => {
    if (!trick.length || !state.trumpSuit) return 0;
    
    let winningCard = trick[0];
    let winningIndex = 0;
    const leadSuit = trick[0].suit;

    trick.forEach((card, index) => {
      if (card.suit === state.trumpSuit && winningCard.suit !== state.trumpSuit) {
        winningCard = card;
        winningIndex = index;
      } else if (card.suit === state.trumpSuit && winningCard.suit === state.trumpSuit) {
        if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
          winningCard = card;
          winningIndex = index;
        }
      } else if (card.suit === leadSuit && winningCard.suit === leadSuit) {
        if (getRankValue(card.rank) > getRankValue(winningCard.rank)) {
          winningCard = card;
          winningIndex = index;
        }
      }
    });

    const firstPlayer = (state.currentDealer + 1) % 4;
    return (firstPlayer + winningIndex) % 4;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 p-8">
      <div className="max-w-6xl mx-auto relative">
        {/* Floating Menu Button */}
        {players.length > 0 && (
          <button
            onClick={() => setShowSidebar(true)}
            className="fixed bottom-8 left-8 w-14 h-14 bg-gradient-to-r from-white to-gray-100
                     text-gray-800 rounded-full shadow-lg flex items-center justify-center 
                     transition-all z-50 text-2xl font-bold hover:shadow-xl hover:scale-105
                     border border-gray-200"
          >
            ?
          </button>
        )}

        {/* Sidebar Menu */}
        {showSidebar && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 
                          transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-8 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                                 bg-clip-text text-transparent">Game Menu</h2>
                    <button 
                      onClick={() => setShowSidebar(false)}
                      className="text-gray-400 hover:text-gray-600 w-10 h-10 rounded-full 
                               flex items-center justify-center hover:bg-gray-100 
                               transition-all duration-200 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-8 space-y-5">
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      startTutorial(state);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-5 rounded-2xl
                             hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-between group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-bold">Tutorial Help</span>
                      <span className="text-sm text-blue-100 font-medium">Learn how to play</span>
                    </div>
                    <span className="text-2xl opacity-90 group-hover:opacity-100 transition-all">❔</span>
                  </button>

                  <button
                    onClick={handleResetGame}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-5 rounded-2xl
                             hover:from-red-600 hover:to-red-700 transition-all duration-200 
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-between group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-bold">Reset Game</span>
                      <span className="text-sm text-red-100 font-medium">Start a new game</span>
                    </div>
                    <span className="text-2xl opacity-90 group-hover:opacity-100 transition-all">↺</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      exportGameState();
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-5 rounded-2xl
                             hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-between group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-bold">Export Game</span>
                      <span className="text-sm text-emerald-100 font-medium">Save current game</span>
                    </div>
                    <span className="text-2xl opacity-90 group-hover:opacity-100 transition-all">⬇️</span>
                  </button>

                  <label className="block">
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setShowSidebar(false);
                          importGameState(file);
                        }
                      }}
                    />
                    <div className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-5 rounded-2xl
                                hover:from-violet-600 hover:to-violet-700 transition-all duration-200 
                                shadow-lg hover:shadow-xl hover:-translate-y-0.5
                                flex items-center justify-between group cursor-pointer">
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-bold">Import Game</span>
                        <span className="text-sm text-violet-100 font-medium">Load saved game</span>
                      </div>
                      <span className="text-2xl opacity-90 group-hover:opacity-100 transition-all">⬆️</span>
                    </div>
                  </label>

                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      setShowHistory(true);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-5 rounded-2xl
                             hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5
                             flex items-center justify-between group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-bold">Game History</span>
                      <span className="text-sm text-indigo-100 font-medium">Review previous tricks</span>
                    </div>
                    <span className="text-2xl opacity-90 group-hover:opacity-100 transition-all">📜</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <p className="text-sm text-gray-400 text-center font-medium">
                    Press ESC or click outside to close
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Game phase and status */}
        {players.length > 0 && (
          <div className="flex justify-between items-start gap-8 mb-8">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-white text-center">
                <h1 className="text-3xl font-bold">{phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</h1>
                {currentBid && (
                  <div className="text-xl mt-3 font-medium flex items-center justify-center gap-2">
                    <span className="text-white/80">Current Bid:</span>
                    <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">{currentBid.points}</span>
                    <span className="text-white/80">by</span>
                    <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">
                      {players.find(p => p.id === currentBid.playerId)?.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Bidding history */}
              {phase === 'bidding' && bids.length > 0 && (
                <div className="text-white/90 text-lg mt-4 text-center font-medium border-t border-white/20 pt-4">
                  <span className="text-white/70 mr-2">Previous bids:</span>
                  {bids.map((bid, i) => (
                    <span key={i} className="inline-flex items-center">
                      <span className="font-bold">{players.find(p => p.id === bid.playerId)?.name}</span>
                      <span className={`mx-1 px-2 py-0.5 rounded ${bid.pass ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {bid.pass ? 'Pass' : bid.points}
                      </span>
                      {i < bids.length - 1 && <span className="mx-2 text-white/50">→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trump suit indicator */}
        {trumpSuit && (
          <div className="fixed bottom-8 right-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl
                        border border-white/20 transition-all hover:scale-105 z-40">
            <div className="text-white text-center">
              <div className="text-lg font-medium text-white/80 mb-2">Trump Suit</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold capitalize">{trumpSuit}</span>
                <span className={`text-4xl ${trumpSuit === 'hearts' || trumpSuit === 'diamonds' ? 'text-red-400' : 'text-white'}`}>
                  {(() => {
                    switch (trumpSuit) {
                      case 'hearts': return '♥';
                      case 'diamonds': return '♦';
                      case 'clubs': return '♣';
                      case 'spades': return '♠';
                      default: return '';
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Partnership scores with edit functionality */}
        <div className="flex justify-center gap-8 mb-12" data-tutorial="partnerships">
          {partnerships.map((partnership, index) => (
            <div key={index} 
                 className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl 
                          border border-white/20 transition-transform hover:scale-105">
              <div className="text-xl font-bold mb-3 text-white">
                Partnership {index + 1}
              </div>
              <div className="text-3xl font-bold mb-2 text-white">
                {partnership.score} points
              </div>
              <div className="space-y-2">
                {partnership.players.map((player, playerIndex) => (
                  <div key={`${partnership.players[0].id}-${partnership.players[1].id}-${playerIndex}`} 
                       className="flex items-center gap-2 text-white/80 font-medium">
                    <button
                      onClick={() => setEditingPlayer(player)}
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>{player.name}</span>
                      <span className="text-xs opacity-60">✎</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bidding UI */}
        {phase === 'bidding' && (
          <div className="flex flex-col items-center gap-6 mb-12" data-tutorial="bidding-ui">
            <div className="text-white text-xl font-medium">
              {players[currentPlayer]?.name}&apos;s turn to bid
              {highestBid && (
                <span className="ml-2 text-white/80">
                  (must bid {minBid} or higher, or pass)
                </span>
              )}
            </div>
            <div className="flex justify-center gap-4">
              {[2, 3, 4, 5, 6].map((points) => (
                <button
                  key={points}
                  onClick={() => handleBid(points)}
                  disabled={points < minBid}
                  className={`
                    px-8 py-4 rounded-xl font-bold text-lg shadow-lg
                    transition-all duration-200 transform hover:scale-105
                    ${points < minBid 
                      ? 'bg-gray-400/50 cursor-not-allowed text-white/50' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'}
                  `}
                >
                  Bid {points}
                </button>
              ))}
              <button
                onClick={() => handleBid(0, true)}
                className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg
                         bg-gradient-to-r from-red-500 to-red-600 text-white
                         transition-all duration-200 transform hover:scale-105
                         hover:from-red-600 hover:to-red-700"
              >
                Pass
              </button>
            </div>
          </div>
        )}

        {/* Current trick */}
        {currentTrick.length > 0 && (
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex justify-center gap-6" data-tutorial="current-trick">
              {currentTrick.map((card, index) => (
                <Card 
                  key={index} 
                  card={card} 
                  disabled 
                  playerName={getPlayerNameForCard(index)}
                />
              ))}
            </div>
            {phase === 'scoring' && (
              <button
                onClick={handleCompleteTrick}
                className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                         px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 
                         transition-all duration-200 transform hover:scale-105
                         font-bold text-lg shadow-lg"
              >
                Complete Trick
              </button>
            )}
          </div>
        )}

        {/* Current player's hand */}
        {players[currentPlayer] && phase !== 'gameOver' && (
          <div 
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                       bg-black/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl
                       border border-white/10"
            data-tutorial="player-hand"
          >
            <div className="text-white text-xl font-bold text-center mb-4">
              {players[currentPlayer].name}&apos;s Hand
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {players[currentPlayer].hand.map((card, index) => (
                <Card
                  key={index}
                  card={card}
                  onClick={() => handleCardClick(card)}
                  disabled={phase !== 'playing'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game over or next hand */}
        {phase === 'gameOver' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6 text-center">Game Over!</h2>
              <p className="text-2xl mb-8 text-center">
                Winner: Partnership {partnerships[0].score > partnerships[1].score ? '1' : '2'}
              </p>
              <button
                onClick={() => handleStartGame(['North', 'East', 'South', 'West'])}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                         px-8 py-4 rounded-xl text-xl font-bold shadow-lg
                         hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                New Game
              </button>
            </div>
          </div>
        )}
        
        {phase === 'dealing' && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleNextHand}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       px-8 py-4 rounded-xl text-xl font-bold shadow-lg
                       hover:from-blue-600 hover:to-blue-700 
                       transition-all duration-200 transform hover:scale-105"
              data-tutorial="deal-button"
            >
              Deal Next Hand
            </button>
          </div>
        )}

        {/* Welcome screen */}
        {players.length === 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
            <PlayerNameForm
              onSubmit={handleStartGame}
              onStartTutorial={() => {
                handleStartGame(['North', 'East', 'South', 'West']);
                handleStartTutorial();
              }}
              onSkipTutorial={() => handleStartGame(['North', 'East', 'South', 'West'])}
            />
          </div>
        )}

        {/* Scoring Dialog */}
        {showScoringDialog && lastHandPoints && (
          <ScoringDialog
            points={lastHandPoints}
            partnerships={partnerships}
            onClose={handleNextHand}
          />
        )}

        {/* Edit player name dialog */}
        {editingPlayer && (
          <EditPlayerName
            player={editingPlayer}
            onSave={handleEditPlayerName}
            onCancel={() => setEditingPlayer(null)}
          />
        )}

        {/* Add TrickAnimation */}
        {showTrickAnimation && (
          <TrickAnimation
            cards={currentTrick}
            winningPlayerName={trickWinner}
            onComplete={handleAnimationComplete}
          />
        )}

        <GameHistoryViewer
          tricks={getTrickHistory()}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />

        <TutorialOverlay />
      </div>
    </div>
  );
};

export default GameBoard; 