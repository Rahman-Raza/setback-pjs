import React, { useState } from 'react';
import { Player } from '../types/game';

interface EditPlayerNameProps {
  player: Player;
  onSave: (playerId: string, newName: string) => void;
  onCancel: () => void;
}

const EditPlayerName: React.FC<EditPlayerNameProps> = ({ player, onSave, onCancel }) => {
  const [name, setName] = useState(player.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(player.id, name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Edit Player Name</h2>
          <p className="text-gray-500 mt-1">Change the display name for this player</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200
                       text-gray-800 text-lg
                       placeholder-gray-400"
              placeholder="Enter player name"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200
                       text-gray-600 font-medium
                       hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl
                       bg-blue-500 text-white font-medium
                       hover:bg-blue-600
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerName; 