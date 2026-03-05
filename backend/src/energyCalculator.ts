import { ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL, MAX_ENERGY } from './types';

/**
 * Calculate current energy based on last update time
 */
export const calculateCurrentEnergy = (
  lastEnergy: number,
  lastUpdateTimestamp: number
): number => {
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - lastUpdateTimestamp;
  
  // Calculate how many intervals have passed
  const intervalsPassed = Math.floor(timePassed / ENERGY_REGEN_INTERVAL);
  
  // Calculate energy gained
  const energyGained = intervalsPassed * ENERGY_REGEN_RATE;
  
  // Calculate current energy (capped at MAX_ENERGY)
  const currentEnergy = Math.min(lastEnergy + energyGained, MAX_ENERGY);
  
  return currentEnergy;
};

/**
 * Calculate time to full energy
 */
export const calculateTimeToFull = (currentEnergy: number): number => {
  if (currentEnergy >= MAX_ENERGY) {
    return 0;
  }
  
  const energyNeeded = MAX_ENERGY - currentEnergy;
  const intervalsNeeded = Math.ceil(energyNeeded / ENERGY_REGEN_RATE);
  const timeNeeded = intervalsNeeded * ENERGY_REGEN_INTERVAL;
  
  return timeNeeded;
};

/**
 * Format time in seconds to readable format
 */
export const formatTime = (seconds: number): string => {
  if (seconds === 0) {
    return 'Đã đầy';
  }
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} ngày`);
  }
  if (hours > 0) {
    parts.push(`${hours} giờ`);
  }
  if (minutes > 0 && days === 0) {
    parts.push(`${minutes} phút`);
  }
  
  return parts.join(' ') || '< 1 phút';
};

/**
 * Get the actual timestamp when energy was last at the calculated current value
 */
export const getEffectiveUpdateTimestamp = (
  lastEnergy: number,
  lastUpdateTimestamp: number
): number => {
  const currentEnergy = calculateCurrentEnergy(lastEnergy, lastUpdateTimestamp);
  
  if (currentEnergy >= MAX_ENERGY) {
    // Calculate when it reached max
    const energyNeeded = MAX_ENERGY - lastEnergy;
    const intervalsNeeded = Math.ceil(energyNeeded / ENERGY_REGEN_RATE);
    const timeToMax = intervalsNeeded * ENERGY_REGEN_INTERVAL;
    return lastUpdateTimestamp + timeToMax;
  }
  
  // Calculate the timestamp of the last complete interval
  const now = Math.floor(Date.now() / 1000);
  const timePassed = now - lastUpdateTimestamp;
  const intervalsPassed = Math.floor(timePassed / ENERGY_REGEN_INTERVAL);
  
  return lastUpdateTimestamp + (intervalsPassed * ENERGY_REGEN_INTERVAL);
};

