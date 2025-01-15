import React, { useState } from 'react';
import { Partnership } from '../types/game';

interface EditTeamNameProps {
  partnership: Partnership;
  partnershipIndex: number;
  onSave: (partnershipIndex: number, newName: string) => void;
  onCancel: () => void;
}

const EditTeamName: React.FC<EditTeamNameProps> = ({ partnership, partnershipIndex, onSave, onCancel }) => {
  const [teamName, setTeamName] = useState(partnership.teamName || `Partnership ${partnershipIndex + 1}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(partnershipIndex, teamName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Edit Team Name</h2>
        <p className="text-gray-600 mb-6">
          Enter a new name for {partnership.players[0].name} & {partnership.players[1].name}&apos;s team
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200
                       text-gray-900 text-lg"
              placeholder="Enter team name"
              autoFocus
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700
                       border border-gray-300 hover:bg-gray-50
                       transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white
                       bg-blue-500 hover:bg-blue-600
                       transition-all duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamName; 