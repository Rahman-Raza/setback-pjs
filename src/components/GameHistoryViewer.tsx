import React from 'react';
import { Card as CardType } from '../types/game';

// Move helper functions to module scope
const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

interface TrickHistoryItem {
  cards: CardType[];
  winningPlayerName: string;
  leadPlayerName: string;
  trumpSuit: string;
}

interface GameHistoryViewerProps {
  tricks: TrickHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

const Card: React.FC<{ card: CardType }> = ({ card }) => {
  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-800';
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

  return (
    <div className="bg-white rounded-lg shadow-md p-2 w-16 h-24 border border-gray-200
                    transform transition-transform hover:scale-105 hover:shadow-lg">
      <div className="flex flex-col items-center justify-between h-full">
        <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
          {getRankDisplay(card.rank)}
        </div>
        <div className={`text-2xl ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>
    </div>
  );
};

const GameHistoryViewer: React.FC<GameHistoryViewerProps> = ({
  tricks,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Game History</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close history viewer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {tricks.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">
              No tricks have been played yet.
            </div>
          ) : (
            <div className="space-y-6">
              {tricks.map((trick, trickIndex) => (
                <div
                  key={trickIndex}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100
                           hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Trick {trickIndex + 1}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-medium">Lead:</span>
                          <span className="text-gray-900">{trick.leadPlayerName}</span>
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-medium">Trump:</span>
                          <span className={`text-lg ${trick.trumpSuit === 'hearts' || trick.trumpSuit === 'diamonds' ? 'text-red-600' : 'text-gray-900'}`}>
                            {getSuitSymbol(trick.trumpSuit)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-600 text-sm font-medium mb-1">Winner</div>
                      <div className="text-lg font-bold text-indigo-600">
                        {trick.winningPlayerName}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {trick.cards.map((card, cardIndex) => (
                      <Card key={cardIndex} card={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistoryViewer; 