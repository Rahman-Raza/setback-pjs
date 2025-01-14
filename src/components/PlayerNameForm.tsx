import React, { useState } from 'react';

interface PlayerNameFormProps {
  onSubmit: (names: string[]) => void;
  onSkipTutorial: () => void;
  onStartTutorial: () => void;
}

const PlayerNameForm: React.FC<PlayerNameFormProps> = ({ 
  onSubmit, 
  onSkipTutorial, 
  onStartTutorial 
}) => {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const positions = ['North', 'East', 'South', 'West'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map empty names to their default position names
    const finalNames = playerNames.map((name, index) => {
      const trimmedName = name.trim();
      return trimmedName || positions[index];
    });
    
    // Check for uniqueness after applying defaults
    if (new Set(finalNames).size !== 4) {
      setError('All player names must be unique');
      return;
    }

    setError(null);
    onSubmit(finalNames);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Welcome to Setback!</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {positions.map((position, index) => (
            <div key={position} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {position} Player
              </label>
              <input
                type="text"
                value={playerNames[index]}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Enter ${position} player's name`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500 transition-colors"
                maxLength={20}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                     px-6 py-3 rounded-xl text-lg font-bold shadow-lg
                     hover:from-blue-600 hover:to-blue-700 
                     transition-all duration-200 transform hover:scale-105"
          >
            Start Game
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onStartTutorial}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white 
                       px-4 py-3 rounded-xl text-base font-bold shadow-lg
                       hover:from-green-600 hover:to-green-700 
                       transition-all duration-200 transform hover:scale-105"
            >
              With Tutorial
            </button>
            <button
              type="button"
              onClick={onSkipTutorial}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
                       px-4 py-3 rounded-xl text-base font-bold shadow-lg
                       hover:from-gray-600 hover:to-gray-700 
                       transition-all duration-200 transform hover:scale-105"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlayerNameForm; 