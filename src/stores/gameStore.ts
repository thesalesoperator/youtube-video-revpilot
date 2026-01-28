import { create } from 'zustand';
import type { GameState, ActiveEasterEgg, PlayerProgress } from '../types';
import { supabase } from '../lib/supabase';

interface GameStore {
  gameState: GameState;
  progress: PlayerProgress | null;
  activeEasterEggs: ActiveEasterEgg[];
  screenShake: boolean;
  konamiBuffer: string[];
  secretClickCount: number;
  logoClickCount: number;

  setGameStatus: (status: GameState['status']) => void;
  setCurrentLevel: (level: number) => void;
  incrementPlayerScore: () => void;
  incrementAiScore: () => void;
  incrementMissedShots: () => void;
  incrementTotalHits: () => void;
  resetScores: () => void;
  setTimeElapsed: (time: number) => void;
  triggerScreenShake: () => void;

  // Easter egg actions
  addKonamiKey: (key: string) => boolean;
  incrementSecretClicks: () => number;
  incrementLogoClicks: () => number;
  activateEasterEgg: (egg: ActiveEasterEgg) => void;
  deactivateEasterEgg: (name: string) => void;
  isEasterEggActive: (name: string) => boolean;

  // Progress actions
  loadProgress: (userId: string) => Promise<void>;
  saveProgress: (userId: string, levelCompleted: number, score: number, stars: number, timeSeconds: number) => Promise<void>;
  unlockNextLevel: (userId: string, currentLevel: number) => Promise<void>;
  saveEasterEgg: (userId: string, eggName: string) => Promise<void>;
}

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: {
    status: 'menu',
    currentLevel: 1,
    playerScore: 0,
    aiScore: 0,
    timeElapsed: 0,
    missedShots: 0,
    totalHits: 0,
  },
  progress: null,
  activeEasterEggs: [],
  screenShake: false,
  konamiBuffer: [],
  secretClickCount: 0,
  logoClickCount: 0,

  setGameStatus: (status) =>
    set((state) => ({ gameState: { ...state.gameState, status } })),

  setCurrentLevel: (level) =>
    set((state) => ({ gameState: { ...state.gameState, currentLevel: level } })),

  incrementPlayerScore: () =>
    set((state) => ({ gameState: { ...state.gameState, playerScore: state.gameState.playerScore + 1 } })),

  incrementAiScore: () =>
    set((state) => ({ gameState: { ...state.gameState, aiScore: state.gameState.aiScore + 1 } })),

  incrementMissedShots: () =>
    set((state) => ({ gameState: { ...state.gameState, missedShots: state.gameState.missedShots + 1 } })),

  incrementTotalHits: () =>
    set((state) => ({ gameState: { ...state.gameState, totalHits: state.gameState.totalHits + 1 } })),

  resetScores: () =>
    set((state) => ({
      gameState: { ...state.gameState, playerScore: 0, aiScore: 0, timeElapsed: 0, missedShots: 0, totalHits: 0 },
    })),

  setTimeElapsed: (time) =>
    set((state) => ({ gameState: { ...state.gameState, timeElapsed: time } })),

  triggerScreenShake: () => {
    set({ screenShake: true });
    setTimeout(() => set({ screenShake: false }), 300);
  },

  // Easter eggs
  addKonamiKey: (key: string) => {
    const buffer = [...get().konamiBuffer, key].slice(-10);
    set({ konamiBuffer: buffer });
    return buffer.length === 10 && buffer.every((k, i) => k === KONAMI_CODE[i]);
  },

  incrementSecretClicks: () => {
    const count = get().secretClickCount + 1;
    set({ secretClickCount: count });
    return count;
  },

  incrementLogoClicks: () => {
    const count = get().logoClickCount + 1;
    set({ logoClickCount: count });
    return count;
  },

  activateEasterEgg: (egg) =>
    set((state) => ({
      activeEasterEggs: [...state.activeEasterEggs.filter((e) => e.name !== egg.name), egg],
    })),

  deactivateEasterEgg: (name) =>
    set((state) => ({
      activeEasterEggs: state.activeEasterEggs.filter((e) => e.name !== name),
    })),

  isEasterEggActive: (name) => get().activeEasterEggs.some((e) => e.name === name && e.active),

  // Progress
  loadProgress: async (userId: string) => {
    const { data } = await supabase
      .from('player_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      set({ progress: data as PlayerProgress });
    }
  },

  saveProgress: async (userId: string, levelCompleted: number, score: number, stars: number, timeSeconds: number) => {
    try {
      // Save level completion
      await supabase.from('level_completions').insert({
        user_id: userId,
        level_number: levelCompleted,
        score,
        time_seconds: timeSeconds,
        stars_earned: stars,
      });

      // Update player progress
      const progress = get().progress;
      const newTotalScore = (progress?.total_score || 0) + score;
      const newHighestLevel = Math.max(progress?.highest_level_unlocked || 1, levelCompleted + 1);

      await supabase
        .from('player_progress')
        .upsert({
          user_id: userId,
          current_level: levelCompleted,
          highest_level_unlocked: Math.min(newHighestLevel, 10),
          total_score: newTotalScore,
          total_play_time: (progress?.total_play_time || 0) + timeSeconds,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Update leaderboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profile) {
        await supabase
          .from('leaderboard')
          .upsert({
            user_id: userId,
            username: profile.username,
            total_score: newTotalScore,
            highest_level: Math.min(newHighestLevel, 10),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }

      // Reload progress
      await get().loadProgress(userId);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  },

  unlockNextLevel: async (userId: string, currentLevel: number) => {
    const nextLevel = Math.min(currentLevel + 1, 10);
    const progress = get().progress;
    if (progress && nextLevel > progress.highest_level_unlocked) {
      await supabase
        .from('player_progress')
        .update({ highest_level_unlocked: nextLevel })
        .eq('user_id', userId);
      await get().loadProgress(userId);
    }
  },

  saveEasterEgg: async (userId: string, eggName: string) => {
    const progress = get().progress;
    if (progress && !progress.easter_eggs_found.includes(eggName)) {
      const updated = [...progress.easter_eggs_found, eggName];
      await supabase
        .from('player_progress')
        .update({ easter_eggs_found: updated })
        .eq('user_id', userId);
      await get().loadProgress(userId);
    }
  },
}));
