import React, { useState } from 'react';
import { Player } from '../types/game';

interface EditPlayerNameProps {
  player: Player;
  onSave: (playerId: string, newName: string) => void;
  onCancel: () => void;
}

const EditPlayerName: React.FC<EditPlayerNameProps> = ({ player, onSave, onCancel }) => {
  const [name, setName] = useState(player.name);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    onSave(player.id, name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Edit Player Name</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 transition-colors"
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                       hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerName; 