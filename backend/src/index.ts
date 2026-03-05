import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database';
import { Character, EnergyCalculation } from './types';
import { calculateCurrentEnergy, calculateTimeToFull, formatTime, getEffectiveUpdateTimestamp } from './energyCalculator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get character with calculated energy
const getCharacterWithEnergy = (character: Character): Character & { energy_calculation: EnergyCalculation } => {
  const currentEnergy = calculateCurrentEnergy(character.main_energy, character.last_energy_update);
  const timeToFull = calculateTimeToFull(currentEnergy);
  
  return {
    ...character,
    energy_calculation: {
      current_energy: currentEnergy,
      time_to_full: timeToFull,
      time_to_full_formatted: formatTime(timeToFull),
      is_full: currentEnergy >= 840
    }
  };
};

// Routes

// Get all characters
app.get('/api/characters', (req: Request, res: Response) => {
  try {
    const characters = db.prepare('SELECT * FROM characters ORDER BY created_at DESC').all() as Character[];
    const charactersWithEnergy = characters.map(getCharacterWithEnergy);
    res.json(charactersWithEnergy);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get single character
app.get('/api/characters/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as Character | undefined;
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(getCharacterWithEnergy(character));
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create character
app.post('/api/characters', (req: Request, res: Response) => {
  try {
    const { account_name, server_name, character_name, power, main_energy, secondary_energy, kina } = req.body;
    
    if (!account_name || !server_name || !character_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    const stmt = db.prepare(`
      INSERT INTO characters (account_name, server_name, character_name, power, main_energy, secondary_energy, last_energy_update, kina)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      account_name,
      server_name,
      character_name,
      power || 0,
      main_energy || 0,
      secondary_energy || 0,
      now,
      kina || 0
    );
    
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(result.lastInsertRowid) as Character;
    res.status(201).json(getCharacterWithEnergy(character));
  } catch (error: any) {
    console.error('Error creating character:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Character already exists' });
    }
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character
app.put('/api/characters/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { account_name, server_name, character_name, power, main_energy, secondary_energy, kina } = req.body;
    
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as Character | undefined;
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const now = Math.floor(Date.now() / 1000);
    let updateTimestamp = character.last_energy_update;
    
    // If main_energy is being updated, update the timestamp
    if (main_energy !== undefined && main_energy !== character.main_energy) {
      updateTimestamp = now;
    }
    
    const stmt = db.prepare(`
      UPDATE characters 
      SET account_name = ?, server_name = ?, character_name = ?, power = ?, 
          main_energy = ?, secondary_energy = ?, last_energy_update = ?, kina = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      account_name ?? character.account_name,
      server_name ?? character.server_name,
      character_name ?? character.character_name,
      power ?? character.power,
      main_energy ?? character.main_energy,
      secondary_energy ?? character.secondary_energy,
      updateTimestamp,
      kina ?? character.kina,
      now,
      id
    );
    
    const updatedCharacter = db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as Character;
    res.json(getCharacterWithEnergy(updatedCharacter));
  } catch (error: any) {
    console.error('Error updating character:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Character name already exists' });
    }
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete character
app.delete('/api/characters/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

