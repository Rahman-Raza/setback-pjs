import React from 'react';

interface WaitingRoomProps {
  gameId: string;
  playerCount: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameId, playerCount }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <h1 className="text-3xl font-bold">Waiting for Players</h1>
      <div className="text-xl">
        Game ID: <span className="font-mono font-bold">{gameId}</span>
      </div>
      <div className="text-lg">
        Players Connected: <span className="font-bold">{playerCount}/4</span>
      </div>
      <p className="text-gray-600 max-w-md text-center">
        Share this Game ID with other players to let them join. The game will start automatically when all players have joined.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(gameId);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Copy Game ID
        </button>
      </div>
    </div>
  );
}

export default WaitingRoom; 