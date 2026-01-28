-- RevPilot Pong Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player progress
CREATE TABLE IF NOT EXISTS player_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER DEFAULT 1,
  highest_level_unlocked INTEGER DEFAULT 1,
  total_score BIGINT DEFAULT 0,
  total_play_time INTEGER DEFAULT 0,
  easter_eggs_found TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level completions
CREATE TABLE IF NOT EXISTS level_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  stars_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  username TEXT NOT NULL,
  total_score BIGINT NOT NULL,
  highest_level INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Easter eggs reference
CREATE TABLE IF NOT EXISTS easter_eggs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  hint TEXT,
  points_bonus INTEGER DEFAULT 100
);

-- Seed easter eggs
INSERT INTO easter_eggs (name, description, hint, points_bonus) VALUES
  ('konami', 'Retro 8-bit mode with CRT filter', 'The classic code...', 500),
  ('disco', 'Rainbow ball trail and disco effects', 'Lucky number 7', 300),
  ('matrix', 'Green code rain background', 'Click while paused...', 250),
  ('tiny', 'Everything shrinks 50%', 'Type something small', 200),
  ('revpilot_pride', 'Auto-scoring miracle', 'Sometimes doing nothing works', 1000),
  ('speedrunner', 'Flame trail on ball', 'Be fast. Very fast.', 400),
  ('perfect', 'Fireworks and golden paddle', 'Flawless victory', 500),
  ('neon', 'Neon glow mode', 'Burning the midnight oil', 150),
  ('persistence', 'Never Give Up badge', 'Keep trying...', 100),
  ('secret_menu', 'Developer credits and stats', 'The logo hides secrets', 50)
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE easter_eggs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Player Progress: Users can only access their own
CREATE POLICY "Users can view own progress" ON player_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON player_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON player_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Level Completions: Users can only access their own
CREATE POLICY "Users can view own completions" ON level_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON level_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard: Everyone can read, users can manage their own
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own leaderboard entry" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry" ON leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- Easter Eggs: Everyone can read
CREATE POLICY "Easter eggs are viewable by everyone" ON easter_eggs
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_progress_user_id ON player_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level_completions_user_id ON level_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_score ON leaderboard(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
