import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Rookie Rally',
    description: 'Learn the basics. Score 5 points to win!',
    ballSpeed: 3,
    ballSpeedIncrement: 0,
    aiSpeed: 2.5,
    aiReactionDelay: 150,
    pointsToWin: 5,
    specialMechanic: 'none',
  },
  {
    level: 2,
    name: 'Warm Up',
    description: 'The ball grows bigger with each rally!',
    ballSpeed: 3.5,
    ballSpeedIncrement: 0,
    aiSpeed: 3,
    aiReactionDelay: 120,
    pointsToWin: 7,
    specialMechanic: 'growing_ball',
  },
  {
    level: 3,
    name: 'Getting Hot',
    description: 'Your paddle shrinks over time. Stay sharp!',
    ballSpeed: 4,
    ballSpeedIncrement: 0,
    aiSpeed: 3.2,
    aiReactionDelay: 100,
    pointsToWin: 7,
    specialMechanic: 'shrinking_paddle',
  },
  {
    level: 4,
    name: 'Speed Demon',
    description: 'The ball gets faster with every hit!',
    ballSpeed: 3.5,
    ballSpeedIncrement: 0.3,
    aiSpeed: 3.5,
    aiReactionDelay: 80,
    pointsToWin: 10,
    specialMechanic: 'accelerating_ball',
  },
  {
    level: 5,
    name: 'Dual Threat',
    description: 'Two balls at once. Double the chaos!',
    ballSpeed: 3.5,
    ballSpeedIncrement: 0,
    aiSpeed: 3.5,
    aiReactionDelay: 70,
    pointsToWin: 10,
    specialMechanic: 'multi_ball',
  },
  {
    level: 6,
    name: 'Gravity Well',
    description: 'The ball curves mid-flight. Trust nothing!',
    ballSpeed: 4,
    ballSpeedIncrement: 0,
    aiSpeed: 3.8,
    aiReactionDelay: 60,
    pointsToWin: 12,
    specialMechanic: 'gravity_well',
  },
  {
    level: 7,
    name: 'Portal Madness',
    description: 'Portals teleport the ball. Mind bending!',
    ballSpeed: 4.5,
    ballSpeedIncrement: 0,
    aiSpeed: 4,
    aiReactionDelay: 50,
    pointsToWin: 12,
    specialMechanic: 'portals',
  },
  {
    level: 8,
    name: 'Invisible Ink',
    description: 'The ball vanishes mid-flight. Use the force!',
    ballSpeed: 4.5,
    ballSpeedIncrement: 0,
    aiSpeed: 4.2,
    aiReactionDelay: 45,
    pointsToWin: 15,
    specialMechanic: 'invisible_ball',
  },
  {
    level: 9,
    name: 'Boss Battle',
    description: 'The AI has a MASSIVE paddle. Good luck!',
    ballSpeed: 5,
    ballSpeedIncrement: 0.2,
    aiSpeed: 4.5,
    aiReactionDelay: 30,
    pointsToWin: 15,
    specialMechanic: 'boss_battle',
  },
  {
    level: 10,
    name: 'RevPilot Master',
    description: 'ALL mechanics combined. The ultimate test!',
    ballSpeed: 5,
    ballSpeedIncrement: 0.2,
    aiSpeed: 5,
    aiReactionDelay: 20,
    pointsToWin: 20,
    specialMechanic: 'chaos',
  },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[level - 1] || LEVELS[0];
}

export function calculateStars(
  playerScore: number,
  aiScore: number,
  pointsToWin: number,
  totalHits: number,
  missedShots: number
): number {
  if (playerScore < pointsToWin) return 0;
  if (aiScore === 0) return 3;
  const accuracy = totalHits / (totalHits + missedShots);
  if (accuracy >= 0.5) return 2;
  return 1;
}
