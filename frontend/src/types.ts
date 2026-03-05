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
  energy_calculation?: EnergyCalculation;
}

export interface EnergyCalculation {
  current_energy: number;
  time_to_full: number;
  time_to_full_formatted: string;
  is_full: boolean;
}

export const ENERGY_REGEN_RATE = 15;
export const ENERGY_REGEN_INTERVAL = 3 * 60 * 60;
export const MAX_ENERGY = 840;

