export interface Character {
  id?: number;
  account_name: string;
  server_name: string;
  character_name: string;
  power: number;
  main_energy: number;
  secondary_energy: number;
  last_energy_update: number;
  kina: number;
  created_at?: number;
  updated_at?: number;
}

export interface EnergyCalculation {
  current_energy: number;
  time_to_full: number; // in seconds
  time_to_full_formatted: string; // e.g., "3 ngày 18 giờ"
  is_full: boolean;
}

// Constants
export const ENERGY_REGEN_RATE = 15; // energy per interval
export const ENERGY_REGEN_INTERVAL = 3 * 60 * 60; // 3 hours in seconds (kept for reference, actual regen uses fixed hours)
export const MAX_ENERGY = 840;

