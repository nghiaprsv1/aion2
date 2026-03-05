import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_name TEXT NOT NULL,
      server_name TEXT NOT NULL,
      character_name TEXT NOT NULL,
      power INTEGER DEFAULT 0,
      main_energy INTEGER DEFAULT 0,
      secondary_energy INTEGER DEFAULT 0,
      last_energy_update INTEGER NOT NULL,
      kina INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(account_name, server_name, character_name)
    )
  `);

  console.log('Database tables created successfully');
};

// Initialize database
createTables();

export default db;

