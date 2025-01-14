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
  onComplete 
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    // Start the collection animation after a brief delay
    const collectionTimer = setTimeout(() => {
      setIsCollecting(true);
    }, 1000);

    // Show the winner after cards start collecting
    const winnerTimer = setTimeout(() => {
      setShowWinner(true);
    }, 1500);

    // Complete the animation
    const completionTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(collectionTimer);
      clearTimeout(winnerTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      {/* Cards container */}
      <div className={`relative w-96 h-96 ${isCollecting ? 'scale-0' : 'scale-100'} 
                    transition-transform duration-500 ease-in-out`}>
        {cards.map((card, index) => {
          // Calculate position for each card in the trick
          const angle = (index * 90 + 45) * (Math.PI / 180);
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={`${card.suit}-${card.rank}`}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                       transition-all duration-500 ease-in-out"
              style={{
                transform: isCollecting 
                  ? 'translate(-50%, -50%) scale(0.8)' 
                  : `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${index * 90}deg)`
              }}
            >
              {/* Reuse existing Card component here */}
              <div className="w-20 h-32 bg-white rounded-xl border-2 border-white shadow-md
                           flex items-center justify-center text-2xl">
                {card.isJoker ? '🃏' : `${card.rank} ${card.suit}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner announcement */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     transition-all duration-500 ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-xl">
          <div className="text-2xl font-bold text-center">
            {winningPlayerName} wins the trick!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrickAnimation; 