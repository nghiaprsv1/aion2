import { useState, useMemo } from 'react';
import { Character, MAX_ENERGY } from '../types';

interface CharacterListProps {
  characters: Character[];
  onEdit: (character: Character) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, character: Partial<Character>) => void;
}

type EnergyFilter = 'all' | 'urgent' | 'warning' | 'safe' | 'full';

export default function CharacterList({ characters, onEdit, onDelete, onUpdate }: CharacterListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [energyFilter, setEnergyFilter] = useState<EnergyFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ main_energy: number; secondary_energy: number; kina: number }>({
    main_energy: 0,
    secondary_energy: 0,
    kina: 0,
  });
  const itemsPerPage = 100;

  // Get unique accounts and servers
  const uniqueAccounts = useMemo(() => {
    return Array.from(new Set(characters.map(c => c.account_name))).sort();
  }, [characters]);

  const uniqueServers = useMemo(() => {
    return Array.from(new Set(characters.map(c => c.server_name))).sort();
  }, [characters]);

  const toggleAccount = (account: string) => {
    setSelectedAccounts(prev =>
      prev.includes(account) ? prev.filter(a => a !== account) : [...prev, account]
    );
    setCurrentPage(1);
  };

  const toggleServer = (server: string) => {
    setSelectedServers(prev =>
      prev.includes(server) ? prev.filter(s => s !== server) : [...prev, server]
    );
    setCurrentPage(1);
  };

  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters.filter(char => {
      // Filter by search term
      const matchesSearch = searchTerm === '' ||
        char.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.server_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by selected accounts
      const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(char.account_name);

      // Filter by selected servers
      const matchesServer = selectedServers.length === 0 || selectedServers.includes(char.server_name);

      // Filter by energy time to full
      let matchesEnergy = true;
      if (energyFilter !== 'all') {
        const currentEnergy = char.energy_calculation?.current_energy || 0;
        const timeToFull = char.energy_calculation?.time_to_full || 0;
        const daysToFull = timeToFull / (24 * 60 * 60);
        const isFull = currentEnergy >= 840;

        if (energyFilter === 'urgent') {
          matchesEnergy = !isFull && daysToFull < 1;
        } else if (energyFilter === 'warning') {
          matchesEnergy = !isFull && daysToFull >= 1 && daysToFull < 3;
        } else if (energyFilter === 'safe') {
          matchesEnergy = !isFull && daysToFull >= 3;
        } else if (energyFilter === 'full') {
          matchesEnergy = isFull;
        }
      }

      return matchesSearch && matchesAccount && matchesServer && matchesEnergy;
    });

    // Create a map to store the earliest created_at for each account and account+server combination
    const accountFirstCreated = new Map<string, number>();
    const accountServerFirstCreated = new Map<string, number>();

    filtered.forEach(char => {
      const accountKey = char.account_name;
      const accountServerKey = `${char.account_name}|||${char.server_name}`;
      const createdAt = char.created_at || 0;

      // Track earliest created_at for each account
      if (!accountFirstCreated.has(accountKey) || createdAt < accountFirstCreated.get(accountKey)!) {
        accountFirstCreated.set(accountKey, createdAt);
      }

      // Track earliest created_at for each account+server combination
      if (!accountServerFirstCreated.has(accountServerKey) || createdAt < accountServerFirstCreated.get(accountServerKey)!) {
        accountServerFirstCreated.set(accountServerKey, createdAt);
      }
    });

    // Sort by: earliest account created_at, then earliest server created_at within account, then character created_at
    filtered.sort((a, b) => {
      const aAccountKey = a.account_name;
      const bAccountKey = b.account_name;
      const aAccountServerKey = `${a.account_name}|||${a.server_name}`;
      const bAccountServerKey = `${b.account_name}|||${b.server_name}`;

      // First sort by earliest created_at of the account
      const aAccountFirstCreated = accountFirstCreated.get(aAccountKey) || 0;
      const bAccountFirstCreated = accountFirstCreated.get(bAccountKey) || 0;

      if (aAccountFirstCreated !== bAccountFirstCreated) {
        return aAccountFirstCreated - bAccountFirstCreated;
      }

      // If same account, sort by earliest created_at of the server within that account
      const aServerFirstCreated = accountServerFirstCreated.get(aAccountServerKey) || 0;
      const bServerFirstCreated = accountServerFirstCreated.get(bAccountServerKey) || 0;

      if (aServerFirstCreated !== bServerFirstCreated) {
        return aServerFirstCreated - bServerFirstCreated;
      }

      // If same account and server, sort by character's created_at
      const aCreated = a.created_at || 0;
      const bCreated = b.created_at || 0;
      return aCreated - bCreated;
    });

    return filtered;
  }, [characters, searchTerm, selectedAccounts, selectedServers, energyFilter]);

  const totalPages = Math.ceil(filteredAndSortedCharacters.length / itemsPerPage);
  const paginatedCharacters = filteredAndSortedCharacters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (character: Character) => {
    setEditingId(character.id!);
    setEditValues({
      main_energy: character.main_energy,
      secondary_energy: character.secondary_energy,
      kina: character.kina,
    });
  };

  const handleSave = (id: number) => {
    onUpdate(id, editValues);
    setEditingId(null);
  };

  if (characters.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-24 h-24 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Chưa có nhân vật nào</h3>
            <p className="text-white/60">Nhấn nút "Thêm nhân vật" để bắt đầu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhân vật..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field w-full pl-10"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-white/70">Tổng số: </span>
              <span className="font-bold text-white">{filteredAndSortedCharacters.length}</span>
            </div>
          </div>
        </div>

        {/* Account Filter */}
        {uniqueAccounts.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-white/70">Lọc theo tài khoản:</span>
              {selectedAccounts.length > 0 && (
                <button
                  onClick={() => setSelectedAccounts([])}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueAccounts.map(account => (
                <button
                  key={account}
                  onClick={() => toggleAccount(account)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedAccounts.includes(account)
                      ? 'bg-slate-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {account}
                  <span className="ml-2 text-xs opacity-70">
                    ({characters.filter(c => c.account_name === account).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Server Filter */}
        {uniqueServers.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span className="text-sm font-semibold text-white/70">Lọc theo server:</span>
              {selectedServers.length > 0 && (
                <button
                  onClick={() => setSelectedServers([])}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueServers.map(server => (
                <button
                  key={server}
                  onClick={() => toggleServer(server)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedServers.includes(server)
                      ? 'bg-slate-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {server}
                  <span className="ml-2 text-xs opacity-70">
                    ({characters.filter(c => c.server_name === server).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Energy Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-white/70">Lọc theo thời gian đầy:</span>
            {energyFilter !== 'all' && (
              <button
                onClick={() => setEnergyFilter('all')}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEnergyFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                energyFilter === 'all'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setEnergyFilter('urgent')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                energyFilter === 'urgent'
                  ? 'bg-white/20 text-rose-200 border border-rose-300/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span className="text-rose-300">●</span>
              <span>Khẩn cấp (&lt; 1 ngày)</span>
            </button>
            <button
              onClick={() => setEnergyFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                energyFilter === 'warning'
                  ? 'bg-white/20 text-amber-200 border border-amber-300/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span className="text-amber-300">●</span>
              <span>Cảnh báo (1-3 ngày)</span>
            </button>
            <button
              onClick={() => setEnergyFilter('safe')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                energyFilter === 'safe'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              An toàn (3-7 ngày)
            </button>
            <button
              onClick={() => setEnergyFilter('full')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                energyFilter === 'full'
                  ? 'bg-white/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span className="text-emerald-400">✓</span>
              <span>Đã đầy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Tài khoản</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Server</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Tên nhân vật</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Sức mạnh</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Năng lượng</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">NL Phụ</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Thời gian đầy</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="font-semibold text-sm">Kina</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="font-semibold text-sm">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedCharacters.map((character, index) => {
                const isEditing = editingId === character.id;
                const currentEnergy = character.energy_calculation?.current_energy || 0;
                const energyPercentage = (currentEnergy / MAX_ENERGY) * 100;
                const isFull = currentEnergy >= MAX_ENERGY;
                const timeToFull = character.energy_calculation?.time_to_full || 0;

                // Calculate time urgency level
                const daysToFull = timeToFull / (24 * 60 * 60);
                let timeUrgency: 'safe' | 'warning' | 'urgent' = 'safe';
                if (daysToFull < 1 && !isFull) {
                  timeUrgency = 'urgent';
                } else if (daysToFull >= 1 && daysToFull < 3) {
                  timeUrgency = 'warning';
                }

                // Check if we should show account name (first occurrence or different from previous)
                const prevCharacter = index > 0 ? paginatedCharacters[index - 1] : null;
                const showAccount = !prevCharacter || prevCharacter.account_name !== character.account_name;
                const showServer = !prevCharacter ||
                  prevCharacter.account_name !== character.account_name ||
                  prevCharacter.server_name !== character.server_name;

                return (
                  <tr key={character.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      {showAccount && (
                        <div className="font-semibold text-slate-300">{character.account_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {showServer && (
                        <div className="text-sm text-slate-400">{character.server_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{character.character_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{character.power.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValues.main_energy}
                          onChange={(e) => setEditValues({ ...editValues, main_energy: parseInt(e.target.value) || 0 })}
                          className="input-field w-20 py-1 text-sm"
                          max={MAX_ENERGY}
                        />
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold">
                            <span className={isFull ? 'text-emerald-400' : 'text-slate-300'}>
                              {Math.floor(currentEnergy)}
                            </span>
                            <span className="text-white/50"> / {MAX_ENERGY}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${isFull ? 'bg-emerald-400' : 'bg-slate-400'}`}
                              style={{ width: `${Math.min(energyPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValues.secondary_energy}
                          onChange={(e) => setEditValues({ ...editValues, secondary_energy: parseInt(e.target.value) || 0 })}
                          className="input-field w-20 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-slate-400">{character.secondary_energy}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isFull ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-semibold text-emerald-400">✓ Đã đầy</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {timeUrgency === 'urgent' && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-300 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                            </span>
                          )}
                          {timeUrgency === 'warning' && (
                            <span className="flex h-2 w-2">
                              <span className="animate-pulse absolute inline-flex h-2 w-2 rounded-full bg-amber-300 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                          )}
                          <span className={`text-xs font-semibold ${
                            timeUrgency === 'urgent' ? 'text-rose-300' :
                            timeUrgency === 'warning' ? 'text-amber-300' :
                            'text-white/70'
                          }`}>
                            {character.energy_calculation?.time_to_full_formatted || 'N/A'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValues.kina}
                          onChange={(e) => setEditValues({ ...editValues, kina: parseInt(e.target.value) || 0 })}
                          className="input-field w-24 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-slate-300">{character.kina.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(character.id!)}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded transition-all"
                              title="Lưu"
                            >
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-all"
                              title="Hủy"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(character)}
                              className="p-1.5 bg-slate-500/20 hover:bg-slate-500/30 rounded transition-all"
                              title="Sửa nhanh"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onEdit(character)}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-all"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => character.id && onDelete(character.id)}
                              className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded transition-all"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedCharacters.length)} trong tổng số {filteredAndSortedCharacters.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded transition-all ${
                      currentPage === pageNum
                        ? 'bg-slate-600 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

