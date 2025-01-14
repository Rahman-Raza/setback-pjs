import React, { useEffect, useState, useCallback } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { useGame } from '../context/GameContext';

const TutorialOverlay: React.FC = () => {
  const { state: tutorialState, nextStep, previousStep, endTutorial } = useTutorial();
  const { state: gameState } = useGame();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ [key: string]: string }>({});
  const [lastGameState, setLastGameState] = useState(gameState);

  const currentStep = tutorialState.steps[tutorialState.currentStepIndex];

  // Track game state changes to advance tutorial
  useEffect(() => {
    if (!tutorialState.isActive || !currentStep) return;

    const hasPhaseChanged = gameState.phase !== lastGameState.phase;
    const hasBidsChanged = gameState.bids.length !== lastGameState.bids.length;
    const hasTrickChanged = gameState.currentTrick.length !== lastGameState.currentTrick.length;
    const hasPlayerChanged = gameState.currentPlayer !== lastGameState.currentPlayer;

    if (hasPhaseChanged || hasBidsChanged || hasTrickChanged || hasPlayerChanged) {
      // Check if current step conditions are met
      const shouldAdvance = 
        currentStep.phase === gameState.phase && 
        (!currentStep.condition || currentStep.condition(gameState));

      if (shouldAdvance) {
        nextStep();
      }
    }

    setLastGameState(gameState);
  }, [gameState, lastGameState, currentStep, tutorialState.isActive, nextStep]);

  const updatePosition = useCallback(() => {
    if (!currentStep?.highlight) {
      setHighlightedElement(null);
      setPosition({});
      return;
    }

    const element = document.querySelector(currentStep.highlight);
    if (!(element instanceof HTMLElement)) {
      console.log('Could not find element for highlight:', currentStep.highlight);
      return;
    }

    setHighlightedElement(element);
    const rect = element.getBoundingClientRect();
    const margin = 20;
    const tutorialBoxWidth = 400;
    const tutorialBoxHeight = 200;

    // Ensure the element is in view
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    let newPosition: { [key: string]: string } = {};
    switch (currentStep.position) {
      case 'top':
        if (rect.top < tutorialBoxHeight + margin * 2) {
          newPosition = {
            top: `${rect.bottom + margin}px`,
            left: `${Math.max(margin, Math.min(window.innerWidth - tutorialBoxWidth - margin, rect.left + rect.width / 2 - tutorialBoxWidth / 2))}px`,
          };
        } else {
          newPosition = {
            bottom: `${window.innerHeight - rect.top + margin}px`,
            left: `${Math.max(margin, Math.min(window.innerWidth - tutorialBoxWidth - margin, rect.left + rect.width / 2 - tutorialBoxWidth / 2))}px`,
          };
        }
        break;
      case 'bottom':
        if (window.innerHeight - rect.bottom < tutorialBoxHeight + margin * 2) {
          newPosition = {
            bottom: `${window.innerHeight - rect.top + margin}px`,
            left: `${Math.max(margin, Math.min(window.innerWidth - tutorialBoxWidth - margin, rect.left + rect.width / 2 - tutorialBoxWidth / 2))}px`,
          };
        } else {
          newPosition = {
            top: `${rect.bottom + margin}px`,
            left: `${Math.max(margin, Math.min(window.innerWidth - tutorialBoxWidth - margin, rect.left + rect.width / 2 - tutorialBoxWidth / 2))}px`,
          };
        }
        break;
      case 'left':
        if (rect.left < tutorialBoxWidth + margin * 2) {
          newPosition = {
            top: `${Math.max(margin, Math.min(window.innerHeight - tutorialBoxHeight - margin, rect.top + rect.height / 2 - tutorialBoxHeight / 2))}px`,
            left: `${rect.right + margin}px`,
          };
        } else {
          newPosition = {
            top: `${Math.max(margin, Math.min(window.innerHeight - tutorialBoxHeight - margin, rect.top + rect.height / 2 - tutorialBoxHeight / 2))}px`,
            right: `${window.innerWidth - rect.left + margin}px`,
          };
        }
        break;
      case 'right':
        if (window.innerWidth - rect.right < tutorialBoxWidth + margin * 2) {
          newPosition = {
            top: `${Math.max(margin, Math.min(window.innerHeight - tutorialBoxHeight - margin, rect.top + rect.height / 2 - tutorialBoxHeight / 2))}px`,
            right: `${window.innerWidth - rect.left + margin}px`,
          };
        } else {
          newPosition = {
            top: `${Math.max(margin, Math.min(window.innerHeight - tutorialBoxHeight - margin, rect.top + rect.height / 2 - tutorialBoxHeight / 2))}px`,
            left: `${rect.right + margin}px`,
          };
        }
        break;
    }
    setPosition(newPosition);
  }, [currentStep?.highlight, currentStep?.position]);

  useEffect(() => {
    if (!tutorialState.isActive) {
      setHighlightedElement(null);
      setPosition({});
      return;
    }

    const handleUpdate = () => {
      requestAnimationFrame(updatePosition);
    };

    handleUpdate();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [tutorialState.isActive, updatePosition]);

  if (!tutorialState.isActive || !currentStep) return null;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />

      {/* Highlight effect */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-200"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            border: '2px solid white',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tutorial box */}
      <div
        className="fixed z-50 bg-white rounded-lg p-6 shadow-xl w-[400px] transition-all duration-200"
        style={position}
      >
        <h3 className="text-xl font-bold mb-2">{currentStep.title}</h3>
        <p className="text-gray-600 mb-4">{currentStep.content}</p>
        
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={previousStep}
              disabled={tutorialState.currentStepIndex === 0}
              className={`mr-2 px-4 py-2 rounded ${
                tutorialState.currentStepIndex === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={tutorialState.currentStepIndex === tutorialState.steps.length - 1}
              className={`px-4 py-2 rounded ${
                tutorialState.currentStepIndex === tutorialState.steps.length - 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
          <button
            onClick={endTutorial}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex justify-center">
          {tutorialState.steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === tutorialState.currentStepIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay; 