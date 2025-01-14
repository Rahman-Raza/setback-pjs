import React, { useEffect, useState, useCallback } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { useGame } from '../context/GameContext';

const TutorialOverlay: React.FC = () => {
  const { state: tutorialState, nextStep, previousStep, endTutorial } = useTutorial();
  const { state: gameState } = useGame();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ [key: string]: string }>({});
  const [lastGameState, setLastGameState] = useState(gameState);
  const [isExiting, setIsExiting] = useState(false);

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

  const handleEndTutorial = () => {
    setIsExiting(true);
    setTimeout(() => {
      endTutorial();
      setIsExiting(false);
    }, 200);
  };

  if (!tutorialState.isActive || !currentStep) return null;

  return (
    <>
      {/* Backdrop overlay with blur */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 pointer-events-none
                   transition-opacity duration-300 ease-in-out
                   ${isExiting ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* Highlight effect */}
      {highlightedElement && (
        <div
          className={`fixed z-50 pointer-events-none
                     transition-all duration-300 ease-in-out
                     ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}

      {/* Tutorial box */}
      <div
        className={`fixed z-50 bg-white rounded-2xl p-8 shadow-2xl w-[450px]
                   transition-all duration-300 ease-in-out
                   ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={position}
      >
        {/* Content */}
        <div className="mb-8">
          {/* Step counter - moved inside and restyled */}
          <div className="mb-4 inline-flex px-4 py-1.5 bg-blue-50 rounded-full">
            <span className="text-sm font-semibold text-blue-600">
              Step {tutorialState.currentStepIndex + 1} of {tutorialState.steps.length}
            </span>
          </div>
          
          <h3 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">
            {currentStep.title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {currentStep.content}
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={previousStep}
              disabled={tutorialState.currentStepIndex === 0}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm
                         transition-all duration-200 ease-in-out
                         flex items-center gap-2
                         ${tutorialState.currentStepIndex === 0
                           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                           : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                         }`}
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              disabled={tutorialState.currentStepIndex === tutorialState.steps.length - 1}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm
                         transition-all duration-200 ease-in-out
                         flex items-center gap-2
                         ${tutorialState.currentStepIndex === tutorialState.steps.length - 1
                           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                           : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
            >
              Next →
            </button>
          </div>
          <button
            onClick={handleEndTutorial}
            className="text-gray-400 hover:text-gray-600 font-medium text-sm
                     transition-colors duration-200"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Progress dots */}
        <div className="absolute -bottom-10 left-0 right-0">
          <div className="flex justify-center items-center gap-2">
            {tutorialState.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200
                           ${index === tutorialState.currentStepIndex
                             ? 'bg-blue-500 w-4'
                             : 'bg-white/50'
                           }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay; 