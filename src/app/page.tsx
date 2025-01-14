'use client';

import { GameProvider } from '../context/GameContext';
import { TutorialProvider } from '../context/TutorialContext';
import GameBoard from '../components/GameBoard';

export default function Home() {
  return (
    <GameProvider>
      <TutorialProvider>
        <main>
          <GameBoard />
        </main>
      </TutorialProvider>
    </GameProvider>
  );
}
