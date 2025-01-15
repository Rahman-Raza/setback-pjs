'use client';

import { useState } from 'react';
import { GameProvider } from '../context/GameContext';
import { TutorialProvider } from '../context/TutorialContext';
import GameBoard from '../components/GameBoard';
import GameJoiner from '../components/GameJoiner';

export default function Home() {
  const [gameActive, setGameActive] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const handleGameStart = () => {
    // Generate a unique game ID (we'll implement this later)
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(newGameId);
    setGameActive(true);
  };

  const handleGameJoin = (id: string) => {
    setGameId(id);
    setGameActive(true);
  };

  return (
    <GameProvider>
      <TutorialProvider>
        <main className="container mx-auto px-4">
          {!gameActive ? (
            <GameJoiner onGameStart={handleGameStart} onGameJoin={handleGameJoin} />
          ) : (
            <>
              {gameId && (
                <div className="text-center py-4">
                  <p className="text-gray-600">Game ID: <span className="font-mono font-bold">{gameId}</span></p>
                </div>
              )}
              <GameBoard />
            </>
          )}
        </main>
      </TutorialProvider>
    </GameProvider>
  );
}
