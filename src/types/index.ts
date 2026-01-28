export interface Player {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface PlayerProgress {
  id: string;
  user_id: string;
  current_level: number;
  highest_level_unlocked: number;
  total_score: number;
  total_play_time: number;
  easter_eggs_found: string[];
}

export interface LevelCompletion {
  id: string;
  user_id: string;
  level_number: number;
  score: number;
  time_seconds: number;
  stars_earned: number;
  completed_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  total_score: number;
  highest_level: number;
}

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  hint: string;
  points_bonus: number;
  found?: boolean;
}

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  ballSpeed: number;
  ballSpeedIncrement: number;
  aiSpeed: number;
  aiReactionDelay: number;
  pointsToWin: number;
  specialMechanic: SpecialMechanic;
  backgroundColor?: string;
}

export type SpecialMechanic =
  | 'none'
  | 'growing_ball'
  | 'shrinking_paddle'
  | 'accelerating_ball'
  | 'multi_ball'
  | 'gravity_well'
  | 'portals'
  | 'invisible_ball'
  | 'boss_battle'
  | 'chaos';

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'game_over' | 'level_complete' | 'level_select' | 'leaderboard';
  currentLevel: number;
  playerScore: number;
  aiScore: number;
  timeElapsed: number;
  missedShots: number;
  totalHits: number;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  visible: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface PaddleState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Portal {
  x: number;
  y1: number;
  y2: number;
  active: boolean;
}

export interface ActiveEasterEgg {
  name: string;
  active: boolean;
  duration?: number;
  startTime?: number;
}
