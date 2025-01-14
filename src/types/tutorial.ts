import { GameState } from './game';

export type TutorialStep = {
  id: string;
  title: string;
  content: string;
  highlight?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  phase: 'dealing' | 'bidding' | 'playing' | 'scoring' | 'gameOver';
  condition?: (gameState: GameState) => boolean; // Optional condition to show this step
};

export type TutorialState = {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  completedSteps: Set<string>;
}; 