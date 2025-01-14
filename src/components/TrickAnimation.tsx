import React, { useEffect, useState } from 'react';
import { Card as CardType } from '../types/game';

interface TrickAnimationProps {
  cards: CardType[];
  winningPlayerName: string;
  onComplete: () => void;
}

const TrickAnimation: React.FC<TrickAnimationProps> = ({
  cards,
  winningPlayerName,
  onComplete,
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    // Start collecting animation after a brief delay
    const collectTimer = setTimeout(() => {
      setIsCollecting(true);
    }, 300);

    // Show winner text shortly after cards start collecting
    const winnerTimer = setTimeout(() => {
      setShowWinner(true);
    }, 600);

    // Complete animation and clean up
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(collectTimer);
      clearTimeout(winnerTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Cards container */}
      <div className="relative">
        {/* Cards */}
        <div className="relative flex items-center justify-center">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`
                absolute transform
                ${isCollecting 
                  ? 'scale-90 opacity-0 rotate-0 translate-x-0 translate-y-0'
                  : `
                    ${index === 0 ? '-translate-y-20' : ''}
                    ${index === 1 ? 'translate-x-20' : ''}
                    ${index === 2 ? 'translate-y-20' : ''}
                    ${index === 3 ? '-translate-x-20' : ''}
                    rotate-${index * 90}
                  `}
                transition-all duration-500 ease-in-out
              `}
              style={{
                transitionDelay: `${index * 75}ms`,
              }}
            >
              <div className={`
                w-24 h-36 rounded-xl border-2 border-white bg-white shadow-lg
                flex flex-col justify-between p-3
              `}>
                {card.isJoker ? (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🃏
                  </div>
                ) : (
                  <>
                    <div className={`text-xl font-bold ${getSuitColor(card.suit)} text-left`}>
                      {getRankDisplay(card.rank)}
                      <span className="text-2xl ml-1">{getSuitSymbol(card.suit)}</span>
                    </div>
                    
                    <div className={`text-4xl ${getSuitColor(card.suit)} text-center`}>
                      {getSuitSymbol(card.suit)}
                    </div>
                    
                    <div className={`text-xl font-bold ${getSuitColor(card.suit)} text-right rotate-180`}>
                      {getRankDisplay(card.rank)}
                      <span className="text-2xl ml-1">{getSuitSymbol(card.suit)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Winner text */}
        <div
          className={`
            absolute left-1/2 transform -translate-x-1/2
            ${showWinner ? 'opacity-100 translate-y-12' : 'opacity-0 translate-y-0'}
            transition-all duration-400 ease-in-out whitespace-nowrap
          `}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl">
            <span className="text-xl font-bold text-gray-900">
              {winningPlayerName} wins the trick!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrickAnimation; 