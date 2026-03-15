import { ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL, MAX_ENERGY } from './types';

// Energy regeneration times in Vietnam timezone (UTC+7): 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h
const ENERGY_REGEN_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
const VIETNAM_TIMEZONE_OFFSET = 7 * 60 * 60; // UTC+7 in seconds

/**
 * Get all energy regeneration timestamps between two timestamps
 */
const getEnergyRegenTimestamps = (startTimestamp: number, endTimestamp: number): number[] => {
  const timestamps: number[] = [];

  // Convert start timestamp to Vietnam time
  const startDate = new Date((startTimestamp + VIETNAM_TIMEZONE_OFFSET) * 1000);

  // Start from the next regen hour after startTimestamp
  let currentDate = new Date(startDate);
  currentDate.setUTCMinutes(0, 0, 0);

  // Find the next regen hour
  const currentHour = currentDate.getUTCHours();
  let nextRegenHour = ENERGY_REGEN_HOURS.find(h => h > currentHour);

  if (nextRegenHour === undefined) {
    // Move to next day's first regen hour
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    nextRegenHour = ENERGY_REGEN_HOURS[0];
  }

  currentDate.setUTCHours(nextRegenHour);

  // Collect all regen timestamps until endTimestamp
  while (true) {
    const timestamp = Math.floor(currentDate.getTime() / 1000) - VIETNAM_TIMEZONE_OFFSET;

    if (timestamp > endTimestamp) {
      break;
    }

    timestamps.push(timestamp);

    // Move to next regen hour
    const currentHour = currentDate.getUTCHours();
    const currentHourIndex = ENERGY_REGEN_HOURS.indexOf(currentHour);

    if (currentHourIndex === ENERGY_REGEN_HOURS.length - 1) {
      // Move to next day's first regen hour
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      currentDate.setUTCHours(ENERGY_REGEN_HOURS[0]);
    } else {
      // Move to next regen hour in the same day
      currentDate.setUTCHours(ENERGY_REGEN_HOURS[currentHourIndex + 1]);
    }
  }

  return timestamps;
};

/**
 * Calculate current energy based on last update time
 * Energy regenerates at fixed hours in Vietnam timezone: 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h
 */
export const calculateCurrentEnergy = (
  lastEnergy: number,
  lastUpdateTimestamp: number
): number => {
  const now = Math.floor(Date.now() / 1000);

  // Get all regen timestamps between last update and now
  const regenTimestamps = getEnergyRegenTimestamps(lastUpdateTimestamp, now);

  // Calculate energy gained
  const energyGained = regenTimestamps.length * ENERGY_REGEN_RATE;

  // Calculate current energy (capped at MAX_ENERGY)
  const currentEnergy = Math.min(lastEnergy + energyGained, MAX_ENERGY);

  return currentEnergy;
};

/**
 * Calculate time to full energy based on fixed regeneration hours
 */
export const calculateTimeToFull = (currentEnergy: number): number => {
  if (currentEnergy >= MAX_ENERGY) {
    return 0;
  }

  const energyNeeded = MAX_ENERGY - currentEnergy;
  const intervalsNeeded = Math.ceil(energyNeeded / ENERGY_REGEN_RATE);

  // Get future regen timestamps
  const now = Math.floor(Date.now() / 1000);
  const futureTimestamp = now + (365 * 24 * 60 * 60); // 1 year in the future (enough to get all needed intervals)
  const regenTimestamps = getEnergyRegenTimestamps(now, futureTimestamp);

  if (regenTimestamps.length === 0 || intervalsNeeded === 0) {
    return 0;
  }

  // Get the timestamp when energy will be full
  const fullEnergyTimestamp = regenTimestamps[Math.min(intervalsNeeded - 1, regenTimestamps.length - 1)];
  const timeNeeded = fullEnergyTimestamp - now;

  return Math.max(0, timeNeeded);
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

    // Get regen timestamps
    const futureTimestamp = lastUpdateTimestamp + (365 * 24 * 60 * 60);
    const regenTimestamps = getEnergyRegenTimestamps(lastUpdateTimestamp, futureTimestamp);

    if (regenTimestamps.length >= intervalsNeeded) {
      return regenTimestamps[intervalsNeeded - 1];
    }
  }

  // Get the last regen timestamp before now
  const now = Math.floor(Date.now() / 1000);
  const regenTimestamps = getEnergyRegenTimestamps(lastUpdateTimestamp, now);

  if (regenTimestamps.length > 0) {
    return regenTimestamps[regenTimestamps.length - 1];
  }

  return lastUpdateTimestamp;
};

