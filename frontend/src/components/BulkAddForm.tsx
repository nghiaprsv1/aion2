import { useState } from 'react';
import { Character } from '../types';

interface BulkAddFormProps {
  onSubmit: (characters: Omit<Character, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onClose: () => void;
}

type AddMode = 'single' | 'multi-server' | 'multi-character';

export default function BulkAddForm({ onSubmit, onClose }: BulkAddFormProps) {
  const [mode, setMode] = useState<AddMode>('single');
  const [baseData, setBaseData] = useState({
    account_name: '',
    server_name: '',
    power: 0,
    main_energy: 0,
    secondary_energy: 0,
    kina: 0,
  });
  
  // For multi-server mode
  const [servers, setServers] = useState('');
  const [characterName, setCharacterName] = useState('');
  
  // For multi-character mode
  const [characterNames, setCharacterNames] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const characters: Omit<Character, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    if (mode === 'single') {
      characters.push({
        account_name: baseData.account_name,
        server_name: baseData.server_name,
        character_name: characterName,
        power: baseData.power,
        main_energy: baseData.main_energy,
        secondary_energy: baseData.secondary_energy,
        kina: baseData.kina,
        last_energy_update: Math.floor(Date.now() / 1000),
      });
    } else if (mode === 'multi-server') {
      // Nhiều server, cùng account, cùng tên nhân vật
      const serverList = servers.split('\n').map(s => s.trim()).filter(s => s);
      serverList.forEach(server => {
        characters.push({
          account_name: baseData.account_name,
          server_name: server,
          character_name: characterName,
          power: baseData.power,
          main_energy: baseData.main_energy,
          secondary_energy: baseData.secondary_energy,
          kina: baseData.kina,
          last_energy_update: Math.floor(Date.now() / 1000),
        });
      });
    } else if (mode === 'multi-character') {
      // Nhiều nhân vật, cùng account, cùng server
      const charList = characterNames.split('\n').map(s => s.trim()).filter(s => s);
      charList.forEach(charName => {
        characters.push({
          account_name: baseData.account_name,
          server_name: baseData.server_name,
          character_name: charName,
          power: baseData.power,
          main_energy: baseData.main_energy,
          secondary_energy: baseData.secondary_energy,
          kina: baseData.kina,
          last_energy_update: Math.floor(Date.now() / 1000),
        });
      });
    }
    
    if (characters.length > 0) {
      onSubmit(characters);
    }
  };

  const handleBaseDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBaseData(prev => ({
      ...prev,
      [name]: ['power', 'main_energy', 'secondary_energy', 'kina'].includes(name) 
        ? parseInt(value) || 0 
        : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Thêm nhân vật</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-3">Chế độ thêm</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'single'
                  ? 'border-slate-500 bg-slate-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="font-semibold text-white">Thêm đơn</div>
                <div className="text-xs text-white/60 mt-1">1 nhân vật</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('multi-server')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'multi-server'
                  ? 'border-slate-500 bg-slate-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <div className="font-semibold text-white">Nhiều server</div>
                <div className="text-xs text-white/60 mt-1">Cùng acc, khác server</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('multi-character')}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === 'multi-character'
                  ? 'border-slate-500 bg-slate-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="font-semibold text-white">Nhiều nhân vật</div>
                <div className="text-xs text-white/60 mt-1">Cùng acc + server</div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tên tài khoản *
              </label>
              <input
                type="text"
                name="account_name"
                value={baseData.account_name}
                onChange={handleBaseDataChange}
                className="input-field w-full"
                required
              />
            </div>

            {mode !== 'multi-server' && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tên server *
                </label>
                <input
                  type="text"
                  name="server_name"
                  value={baseData.server_name}
                  onChange={handleBaseDataChange}
                  className="input-field w-full"
                  required
                />
              </div>
            )}
          </div>

          {/* Mode-specific fields */}
          {mode === 'single' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Tên nhân vật *
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
          )}

          {mode === 'multi-server' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tên nhân vật (chung cho tất cả server) *
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Danh sách server (mỗi server 1 dòng) *
                </label>
                <textarea
                  value={servers}
                  onChange={(e) => setServers(e.target.value)}
                  className="input-field w-full h-32 resize-none"
                  placeholder="Server 1&#10;Server 2&#10;Server 3"
                  required
                />
                <p className="text-xs text-white/60 mt-1">
                  Nhập mỗi server trên một dòng. Ví dụ: Israphel, Siel, Lumiel
                </p>
              </div>
            </>
          )}

          {mode === 'multi-character' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Danh sách tên nhân vật (mỗi tên 1 dòng) *
              </label>
              <textarea
                value={characterNames}
                onChange={(e) => setCharacterNames(e.target.value)}
                className="input-field w-full h-32 resize-none"
                placeholder="Nhân vật 1&#10;Nhân vật 2&#10;Nhân vật 3"
                required
              />
              <p className="text-xs text-white/60 mt-1">
                Nhập mỗi tên nhân vật trên một dòng
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Sức mạnh
              </label>
              <input
                type="number"
                name="power"
                value={baseData.power}
                onChange={handleBaseDataChange}
                className="input-field w-full"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                NL chính
              </label>
              <input
                type="number"
                name="main_energy"
                value={baseData.main_energy}
                onChange={handleBaseDataChange}
                className="input-field w-full"
                min="0"
                max="840"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                NL phụ
              </label>
              <input
                type="number"
                name="secondary_energy"
                value={baseData.secondary_energy}
                onChange={handleBaseDataChange}
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
                value={baseData.kina}
                onChange={handleBaseDataChange}
                className="input-field w-full"
                min="0"
              />
            </div>
          </div>

          {/* Preview */}
          {mode !== 'single' && (
            <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-300 mb-1">Xem trước</div>
                  <div className="text-xs text-white/70">
                    {mode === 'multi-server' && (
                      <>
                        Sẽ tạo <span className="font-bold text-white">{servers.split('\n').filter(s => s.trim()).length}</span> nhân vật
                        {servers.trim() && (
                          <div className="mt-2 space-y-1">
                            {servers.split('\n').filter(s => s.trim()).slice(0, 3).map((server, i) => (
                              <div key={i} className="text-white/60">
                                • {baseData.account_name} - {server.trim()} - {characterName}
                              </div>
                            ))}
                            {servers.split('\n').filter(s => s.trim()).length > 3 && (
                              <div className="text-white/60">
                                ... và {servers.split('\n').filter(s => s.trim()).length - 3} nhân vật khác
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {mode === 'multi-character' && (
                      <>
                        Sẽ tạo <span className="font-bold text-white">{characterNames.split('\n').filter(s => s.trim()).length}</span> nhân vật
                        {characterNames.trim() && (
                          <div className="mt-2 space-y-1">
                            {characterNames.split('\n').filter(s => s.trim()).slice(0, 3).map((char, i) => (
                              <div key={i} className="text-white/60">
                                • {baseData.account_name} - {baseData.server_name} - {char.trim()}
                              </div>
                            ))}
                            {characterNames.split('\n').filter(s => s.trim()).length > 3 && (
                              <div className="text-white/60">
                                ... và {characterNames.split('\n').filter(s => s.trim()).length - 3} nhân vật khác
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {mode === 'single' ? 'Thêm nhân vật' : 'Thêm hàng loạt'}
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

