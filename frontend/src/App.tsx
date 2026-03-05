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
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchCharacters, 60000);
    return () => clearInterval(interval);
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

