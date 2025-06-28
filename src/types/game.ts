export interface CatStats {
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
}

export interface GameState {
  stats: CatStats;
  lastInteractionTime: number;
  totalCareDays: number;
  dailyStreak: number;
  currentMood: CatMood;
  isEating: boolean;
  isPlaying: boolean;
  isSleeping: boolean;
  lastFeedTime: number;
  lastPlayTime: number;
  lastPetTime: number;
  lastSleepTime: number;
}

export type CatMood = 
  | 'sad'
  | 'mild_happy'
  | 'sitting_comfortable_purring'
  | 'sitting_happy'
  | 'very_happy'
  | 'eating';

export type ToyType = 'ball' | 'mouse';

export interface Interaction {
  type: 'feed' | 'play' | 'pet' | 'sleep';
  timestamp: number;
  toy?: ToyType;
}

export interface ParticleEffect {
  id: string;
  type: 'sparkle' | 'heart' | 'sleep';
  x: number;
  y: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  timestamp?: number;
}
