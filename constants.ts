import { GameConfig, MoleType } from './types';

export const GAME_CONFIG: GameConfig = {
  initialTime: 30, // seconds
  minInterval: 600, // ms between mole spawns (fastest)
  maxInterval: 1200, // ms between mole spawns (slowest)
  moleStayDuration: 1300, // ms a mole stays visible
};

export const MOLE_TYPES_ARRAY = [
  MoleType.HAMSTER,
  MoleType.BUNNY,
  MoleType.FROG,
  MoleType.BEAR,
  MoleType.PIG,
];

// Determine hole count only once per session or reload
export const MIN_HOLES = 6;
export const MAX_HOLES = 8;