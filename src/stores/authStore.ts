import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Player } from '../types';

interface AuthState {
  user: Player | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({ user: { id: profile.id, username: profile.username, avatar_url: profile.avatar_url }, initialized: true });
        } else {
          set({ initialized: true });
        }
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null });
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({ user: { id: profile.id, username: profile.username, avatar_url: profile.avatar_url } });
        }
      }
    });
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        set({ user: { id: profile.id, username: profile.username, avatar_url: profile.avatar_url }, loading: false });
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, loading: false });
      return false;
    }
  },

  signup: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username });

      if (profileError) throw profileError;

      // Initialize player progress
      await supabase
        .from('player_progress')
        .insert({ user_id: data.user.id, current_level: 1, highest_level_unlocked: 1, total_score: 0, total_play_time: 0, easter_eggs_found: [] });

      set({
        user: { id: data.user.id, username },
        loading: false,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      set({ error: message, loading: false });
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
