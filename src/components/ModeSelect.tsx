import React from 'react';

interface ModeSelectProps {
  onSelectMode: (mode: 'local' | 'multiplayer') => void;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
      <h1 className="text-4xl font-bold text-center">Welcome to Setback</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => onSelectMode('local')}
          className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xl font-semibold"
        >
          Play Local Game
          <p className="text-sm font-normal mt-1 text-green-100">
            Play against AI or pass-and-play with friends on this device
          </p>
        </button>
        <button
          onClick={() => onSelectMode('multiplayer')}
          className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xl font-semibold"
        >
          Play Online
          <p className="text-sm font-normal mt-1 text-blue-100">
            Play with friends online in real-time
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelect; 