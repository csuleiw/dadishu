export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

export enum MoleType {
  HAMSTER = '🐹',
  BUNNY = '🐰',
  FROG = '🐸',
  BEAR = '🐻',
  PIG = '🐷',
}

export interface Hole {
  id: number;
  status: 'empty' | 'active' | 'hit';
  moleType: MoleType;
  timeoutId?: number; // Internal timer reference for auto-hide
  // Visual randomization props
  x: number; // Random X offset
  y: number; // Random Y offset
  shape: string; // Random border-radius blob string
  rotation: number; // Slight rotation for the hole
}

export interface GameConfig {
  initialTime: number;
  minInterval: number;
  maxInterval: number;
  moleStayDuration: number;
}