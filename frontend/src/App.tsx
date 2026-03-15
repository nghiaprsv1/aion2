import { useState, useEffect } from 'react';
import { Character } from './types';
import { characterApi } from './api';
import CharacterList from './components/CharacterList';
import CharacterForm from './components/CharacterForm';
import BulkAddForm from './components/BulkAddForm';
import Header from './components/Header';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await characterApi.getAll();
      setCharacters(response.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();

    // Calculate time until next energy regen hour (0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h Vietnam time)
    const scheduleNextRefresh = () => {
      const ENERGY_REGEN_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
      const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

      const now = new Date();
      const vietnamTime = new Date(now.getTime() + VIETNAM_TIMEZONE_OFFSET);
      const currentHour = vietnamTime.getUTCHours();
      const currentMinute = vietnamTime.getUTCMinutes();
      const currentSecond = vietnamTime.getUTCSeconds();

      // Find next regen hour
      let nextRegenHour = ENERGY_REGEN_HOURS.find(h => h > currentHour);
      let hoursUntilNext;

      if (nextRegenHour === undefined) {
        // Next regen is tomorrow at 0h
        nextRegenHour = ENERGY_REGEN_HOURS[0];
        hoursUntilNext = (24 - currentHour) + nextRegenHour;
      } else {
        hoursUntilNext = nextRegenHour - currentHour;
      }

      // Calculate milliseconds until next regen (add 5 seconds buffer)
      const msUntilNext = (hoursUntilNext * 60 * 60 * 1000) - (currentMinute * 60 * 1000) - (currentSecond * 1000) + 5000;

      return setTimeout(() => {
        fetchCharacters();
        scheduleNextRefresh(); // Schedule the next one
      }, msUntilNext);
    };

    const timeoutId = scheduleNextRefresh();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleCreate = async (character: Omit<Character, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await characterApi.create(character);
      await fetchCharacters();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Không thể tạo nhân vật. Vui lòng thử lại.');
    }
  };

  const handleBulkCreate = async (characters: Omit<Character, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Create all characters in parallel
      await Promise.all(characters.map(char => characterApi.create(char)));
      await fetchCharacters();
      setShowBulkForm(false);
      alert(`Đã thêm thành công ${characters.length} nhân vật!`);
    } catch (error) {
      console.error('Error creating characters:', error);
      alert('Có lỗi xảy ra khi thêm nhân vật. Vui lòng thử lại.');
    }
  };

  const handleUpdate = async (id: number, character: Partial<Character>) => {
    try {
      await characterApi.update(id, character);
      await fetchCharacters();
      setEditingCharacter(null);
    } catch (error) {
      console.error('Error updating character:', error);
      alert('Không thể cập nhật nhân vật. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân vật này?')) {
      return;
    }
    
    try {
      await characterApi.delete(id);
      await fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('Không thể xóa nhân vật. Vui lòng thử lại.');
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };

  const handleOpenBulkForm = () => {
    setShowBulkForm(true);
    setShowForm(false);
  };

  const handleOpenSingleForm = () => {
    setShowForm(true);
    setShowBulkForm(false);
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        onAddClick={handleOpenSingleForm}
        onBulkAddClick={handleOpenBulkForm}
      />

      <div className="container mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-500"></div>
          </div>
        ) : (
          <CharacterList
            characters={characters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>

      {showForm && (
        <CharacterForm
          character={editingCharacter}
          onSubmit={editingCharacter ?
            (char) => handleUpdate(editingCharacter.id!, char) :
            handleCreate
          }
          onClose={handleCloseForm}
        />
      )}

      {showBulkForm && (
        <BulkAddForm
          onSubmit={handleBulkCreate}
          onClose={() => setShowBulkForm(false)}
        />
      )}
    </div>
  );
}

export default App;

