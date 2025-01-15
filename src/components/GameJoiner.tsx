import { useState } from 'react';

interface GameJoinerProps {
  onGameStart: () => void;
  onGameJoin: (gameId: string) => void;
}

export default function GameJoiner({ onGameStart, onGameJoin }: GameJoinerProps) {
  const [gameId, setGameId] = useState('');
  const [mode, setMode] = useState<'select' | 'join'>('select');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      onGameJoin(gameId.trim());
    }
  };

  if (mode === 'select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-3xl font-bold mb-8">Welcome to Setback</h1>
        <button
          onClick={() => onGameStart()}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors w-64"
        >
          Start New Game
        </button>
        <button
          onClick={() => setMode('join')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-64"
        >
          Join Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-bold mb-8">Join Game</h1>
      <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4 w-64">
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter Game ID"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Join
        </button>
        <button
          type="button"
          onClick={() => setMode('select')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </form>
    </div>
  );
} 