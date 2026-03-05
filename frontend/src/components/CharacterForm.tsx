import { useState, useEffect } from 'react';
import { Character, MAX_ENERGY } from '../types';

interface CharacterFormProps {
  character: Character | null;
  onSubmit: (character: any) => void;
  onClose: () => void;
}

export default function CharacterForm({ character, onSubmit, onClose }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    account_name: '',
    server_name: '',
    character_name: '',
    power: 0,
    main_energy: 0,
    secondary_energy: 0,
    kina: 0,
  });

  useEffect(() => {
    if (character) {
      setFormData({
        account_name: character.account_name,
        server_name: character.server_name,
        character_name: character.character_name,
        power: character.power,
        main_energy: character.main_energy,
        secondary_energy: character.secondary_energy,
        kina: character.kina,
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['power', 'main_energy', 'secondary_energy', 'kina'].includes(name) 
        ? parseInt(value) || 0 
        : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {character ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tên tài khoản *
              </label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tên server *
              </label>
              <input
                type="text"
                name="server_name"
                value={formData.server_name}
                onChange={handleChange}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tên nhân vật *
            </label>
            <input
              type="text"
              name="character_name"
              value={formData.character_name}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Sức mạnh
              </label>
              <input
                type="number"
                name="power"
                value={formData.power}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Kina
              </label>
              <input
                type="number"
                name="kina"
                value={formData.kina}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Năng lượng chính (0-{MAX_ENERGY})
              </label>
              <input
                type="number"
                name="main_energy"
                value={formData.main_energy}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
                max={MAX_ENERGY}
              />
              <p className="text-xs text-white/60 mt-1">
                Tự động cộng 15 năng lượng mỗi 3 tiếng
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Năng lượng phụ
              </label>
              <input
                type="number"
                name="secondary_energy"
                value={formData.secondary_energy}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
              <p className="text-xs text-white/60 mt-1">
                Không tự động thay đổi
              </p>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {character ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

