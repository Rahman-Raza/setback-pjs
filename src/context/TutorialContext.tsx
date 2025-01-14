import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TutorialState, TutorialStep } from '../types/tutorial';
import { GameState } from '../types/game';

interface TutorialContextType {
  state: TutorialState;
  startTutorial: (gameState: GameState) => void;
  nextStep: () => void;
  previousStep: () => void;
  endTutorial: () => void;
  markStepComplete: (stepId: string) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Setback!',
    content: 'Setback is a trick-taking card game played by four players in two partnerships. Let\'s learn how to play!',
    position: 'top',
    phase: 'dealing',
  },
  {
    id: 'partnerships',
    title: 'Partnerships',
    content: 'Players sitting across from each other are partners. North & South form one team, East & West form the other.',
    highlight: '[data-tutorial="partnerships"]',
    position: 'top',
    phase: 'dealing',
  },
  {
    id: 'dealing',
    title: 'Dealing Cards',
    content: 'Each player receives 6 cards. The dealer rotates clockwise after each hand.',
    highlight: '[data-tutorial="deal-button"]',
    position: 'bottom',
    phase: 'dealing',
  },
  {
    id: 'bidding',
    title: 'Bidding Phase',
    content: 'Starting with the player to the dealer\'s left, each player can either bid (2-6 points) or pass.',
    highlight: '[data-tutorial="bidding-ui"]',
    position: 'bottom',
    phase: 'bidding',
  },
  {
    id: 'bidding-rules',
    title: 'Bidding Rules',
    content: 'Each bid must be higher than the previous bid. If everyone passes, the dealer must bid 2.',
    highlight: '[data-tutorial="bidding-ui"]',
    position: 'bottom',
    phase: 'bidding',
    condition: (gameState: GameState) => gameState.bids.length > 0,
  },
  {
    id: 'playing-first-card',
    title: 'Playing First Card',
    content: 'The winning bidder leads the first trick. The suit of this card becomes trump for the entire hand!',
    highlight: '[data-tutorial="player-hand"]',
    position: 'bottom',
    phase: 'playing',
    condition: (gameState: GameState) => !gameState.trumpSuit,
  },
  {
    id: 'trump-suit',
    title: 'Trump Suit',
    content: 'The trump suit is more powerful than other suits. Any trump card beats any non-trump card.',
    highlight: '[data-tutorial="trump-indicator"]',
    position: 'right',
    phase: 'playing',
    condition: (gameState: GameState) => !!gameState.trumpSuit,
  },
  {
    id: 'following-suit',
    title: 'Following Suit',
    content: 'You must play a card of the same suit as the first card played, if you have one.',
    highlight: '[data-tutorial="current-trick"]',
    position: 'top',
    phase: 'playing',
    condition: (gameState: GameState) => gameState.currentTrick.length > 0,
  },
  {
    id: 'scoring',
    title: 'Scoring Points',
    content: 'Points are awarded for: High trump (1), Low trump (1), Jack of trump (1), Off jack (1), Game points (1).',
    highlight: '[data-tutorial="partnerships"]',
    position: 'top',
    phase: 'scoring',
  },
  {
    id: 'winning',
    title: 'Winning the Game',
    content: 'The first partnership to reach 21 points wins the game!',
    highlight: '[data-tutorial="partnerships"]',
    position: 'top',
    phase: 'scoring',
  },
];

const initialState: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  steps: tutorialSteps,
  completedSteps: new Set(),
};

type TutorialAction =
  | { type: 'START_TUTORIAL'; payload: GameState }
  | { type: 'END_TUTORIAL' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'MARK_COMPLETE'; payload: string };

function findAppropriateStep(gameState: GameState, steps: TutorialStep[]): number {
  // Find the first step that matches the current game phase and conditions
  const stepIndex = steps.findIndex(step => {
    const phaseMatches = step.phase === gameState.phase;
    const conditionMet = !step.condition || step.condition(gameState);
    return phaseMatches && conditionMet;
  });

  // If no matching step found, start from beginning
  return stepIndex === -1 ? 0 : stepIndex;
}

function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
  switch (action.type) {
    case 'START_TUTORIAL': {
      const gameState = action.payload;
      const startingStep = findAppropriateStep(gameState, state.steps);
      
      return {
        ...state,
        isActive: true,
        currentStepIndex: startingStep,
        completedSteps: new Set(),
      };
    }
    case 'END_TUTORIAL':
      return {
        ...state,
        isActive: false,
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1),
      };
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
      };
    case 'MARK_COMPLETE':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };
    default:
      return state;
  }
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);

  const startTutorial = (gameState: GameState) => {
    dispatch({ type: 'START_TUTORIAL', payload: gameState });
  };
  const endTutorial = () => dispatch({ type: 'END_TUTORIAL' });
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const previousStep = () => dispatch({ type: 'PREVIOUS_STEP' });
  const markStepComplete = (stepId: string) => dispatch({ type: 'MARK_COMPLETE', payload: stepId });

  return (
    <TutorialContext.Provider 
      value={{ 
        state, 
        startTutorial, 
        endTutorial, 
        nextStep, 
        previousStep, 
        markStepComplete 
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
} 