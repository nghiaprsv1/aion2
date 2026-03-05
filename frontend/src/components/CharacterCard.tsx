import { useState, useEffect } from 'react';
import { Character, MAX_ENERGY } from '../types';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, character: Partial<Character>) => void;
}

export default function CharacterCard({ character, onEdit, onDelete, onUpdate }: CharacterCardProps) {
  const [currentEnergy, setCurrentEnergy] = useState(character.energy_calculation?.current_energy || 0);
  const [timeToFull, setTimeToFull] = useState(character.energy_calculation?.time_to_full_formatted || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    main_energy: character.main_energy,
    secondary_energy: character.secondary_energy,
    kina: character.kina,
  });

  useEffect(() => {
    const updateEnergy = () => {
      if (character.energy_calculation) {
        setCurrentEnergy(character.energy_calculation.current_energy);
        setTimeToFull(character.energy_calculation.time_to_full_formatted);
      }
    };

    updateEnergy();
    const interval = setInterval(updateEnergy, 1000);
    return () => clearInterval(interval);
  }, [character]);

  const energyPercentage = (currentEnergy / MAX_ENERGY) * 100;
  const isFull = currentEnergy >= MAX_ENERGY;

  const handleQuickUpdate = () => {
    if (character.id) {
      onUpdate(character.id, editValues);
      setIsEditing(false);
    }
  };

  return (
    <div className="card p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{character.character_name}</h3>
          <p className="text-blue-200 text-sm">{character.account_name}</p>
          <p className="text-blue-300 text-xs">{character.server_name}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(character)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            title="Chỉnh sửa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => character.id && onDelete(character.id)}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
            title="Xóa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Năng lượng chính</span>
          <span className={`text-sm font-bold ${isFull ? 'text-green-400' : 'text-blue-300'}`}>
            {Math.floor(currentEnergy)} / {MAX_ENERGY}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isFull ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-cyan-500'
            }`}
            style={{ width: `${Math.min(energyPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-white/70 mt-1">
          {isFull ? '✓ Đã đầy năng lượng' : `Đầy sau: ${timeToFull}`}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {isEditing ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Năng lượng chính:</span>
              <input
                type="number"
                value={editValues.main_energy}
                onChange={(e) => setEditValues({ ...editValues, main_energy: parseInt(e.target.value) || 0 })}
                className="input-field w-24 py-1 text-sm"
                max={MAX_ENERGY}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Năng lượng phụ:</span>
              <input
                type="number"
                value={editValues.secondary_energy}
                onChange={(e) => setEditValues({ ...editValues, secondary_energy: parseInt(e.target.value) || 0 })}
                className="input-field w-24 py-1 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Kina:</span>
              <input
                type="number"
                value={editValues.kina}
                onChange={(e) => setEditValues({ ...editValues, kina: parseInt(e.target.value) || 0 })}
                className="input-field w-24 py-1 text-sm"
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={handleQuickUpdate} className="btn-primary flex-1 py-1 text-sm">
                Lưu
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1 py-1 text-sm">
                Hủy
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Sức mạnh:</span>
              <span className="text-sm font-semibold text-yellow-400">{character.power.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Năng lượng phụ:</span>
              <span className="text-sm font-semibold text-purple-400">{character.secondary_energy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Kina:</span>
              <span className="text-sm font-semibold text-green-400">{character.kina.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary w-full mt-2 py-1 text-sm"
            >
              Cập nhật nhanh
            </button>
          </>
        )}
      </div>
    </div>
  );
}

