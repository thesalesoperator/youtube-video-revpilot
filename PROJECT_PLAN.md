# RevPilot Pong - Project Plan

## Overview
An arcade-style Pong game featuring RevPilot brand colors with 10 progressive levels, user authentication, progress saving, and hidden easter eggs. Hosted on Netlify with Supabase backend.

---

## Brand Colors (RevPilot Palette)

| Color | Hex Code | Usage |
|-------|----------|-------|
| Gold/Yellow | `#f7db5a` | Primary accent, ball, UI highlights |
| Orange/Yellow | `#ffbd57` | Gradient transitions, power-ups |
| Pink/Coral | `#e44e6f` | Player paddle, alerts, active states |
| Dark Navy | `#1a1a2e` | Background |
| White | `#ffffff` | Text, UI elements |
| Black | `#000000` | Deep backgrounds, shadows |

**Signature Gradient:** `linear-gradient(135deg, #f7db5a, #ffbd57, #e44e6f)`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| Game Engine | HTML5 Canvas API |
| Styling | Tailwind CSS |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Hosting | Netlify |
| State Management | React Context + Zustand |

---

## Project Structure

```
revpilot-pong/
├── public/
│   ├── sounds/              # Game sound effects
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Canvas.tsx       # Main game canvas
│   │   │   ├── Paddle.ts        # Paddle logic
│   │   │   ├── Ball.ts          # Ball physics
│   │   │   ├── PowerUp.ts       # Power-up system
│   │   │   └── Particles.ts     # Particle effects
│   │   ├── ui/
│   │   │   ├── MainMenu.tsx     # Start screen
│   │   │   ├── LevelSelect.tsx  # Level selection
│   │   │   ├── HUD.tsx          # In-game UI
│   │   │   ├── PauseMenu.tsx    # Pause overlay
│   │   │   ├── GameOver.tsx     # Game over screen
│   │   │   └── Leaderboard.tsx  # High scores
│   │   └── auth/
│   │       ├── LoginForm.tsx    # Login component
│   │       ├── SignupForm.tsx   # Registration
│   │       └── AuthGuard.tsx    # Route protection
│   ├── hooks/
│   │   ├── useGameLoop.ts       # Game loop logic
│   │   ├── useControls.ts       # Keyboard/touch input
│   │   ├── useAudio.ts          # Sound management
│   │   └── useSupabase.ts       # Database hooks
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── gameEngine.ts        # Core game logic
│   │   └── levels.ts            # Level configurations
│   ├── stores/
│   │   ├── gameStore.ts         # Game state
│   │   └── authStore.ts         # Auth state
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── styles/
│   │   └── globals.css          # Global styles
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/              # Database migrations
├── .env.example
├── netlify.toml
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Database Schema (Supabase)

### Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player progress
CREATE TABLE player_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  highest_level_unlocked INTEGER DEFAULT 1,
  total_score BIGINT DEFAULT 0,
  total_play_time INTEGER DEFAULT 0, -- in seconds
  easter_eggs_found TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Level completions
CREATE TABLE level_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  stars_earned INTEGER DEFAULT 0, -- 1-3 stars
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global leaderboard
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_score BIGINT NOT NULL,
  highest_level INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Easter eggs tracking
CREATE TABLE easter_eggs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  hint TEXT,
  points_bonus INTEGER DEFAULT 100
);
```

---

## Level Design (10 Levels)

| Level | Name | Ball Speed | AI Difficulty | Special Mechanic | Points to Win |
|-------|------|------------|---------------|------------------|---------------|
| 1 | **Rookie Rally** | Slow | Easy | None - Tutorial | 5 |
| 2 | **Warm Up** | Slow | Easy | Ball size increases | 7 |
| 3 | **Getting Hot** | Medium | Medium | Paddle shrinks over time | 7 |
| 4 | **Speed Demon** | Fast | Medium | Ball accelerates each hit | 10 |
| 5 | **Dual Threat** | Medium | Medium | 2 balls in play | 10 |
| 6 | **Gravity Well** | Medium | Hard | Ball curves mid-flight | 12 |
| 7 | **Portal Madness** | Fast | Hard | Portals on sides teleport ball | 12 |
| 8 | **Invisible Ink** | Fast | Hard | Ball turns invisible briefly | 15 |
| 9 | **Boss Battle** | Very Fast | Expert | AI paddle is 50% larger | 15 |
| 10 | **RevPilot Master** | Extreme | Expert | All mechanics combined | 20 |

### Star Rating System
- **1 Star:** Complete the level
- **2 Stars:** Complete with 50%+ accuracy (hits vs misses)
- **3 Stars:** Complete without losing a point

---

## Easter Eggs

| Easter Egg | Trigger | Effect | Points |
|------------|---------|--------|--------|
| **Konami Code** | ↑↑↓↓←→←→BA on menu | Retro 8-bit mode + CRT filter | 500 |
| **Disco Mode** | Score exactly 777 | Rainbow ball trail + disco music | 300 |
| **Matrix Mode** | Click ball 10x rapidly during pause | Green code rain background | 250 |
| **Tiny Mode** | Type "smol" during gameplay | Everything shrinks 50% | 200 |
| **RevPilot Pride** | Complete level without moving | Ball auto-scores (1 in 1000 chance) | 1000 |
| **Speed Runner** | Complete any level in <30 seconds | Flame trail on ball | 400 |
| **Perfect Game** | Win 5-0 (or max score-0) | Fireworks + golden paddle skin | 500 |
| **Night Owl** | Play between 2-4 AM local time | Neon glow mode | 150 |
| **Persistence** | Lose 10 times on same level | "Never Give Up" badge + hint | 100 |
| **Secret Menu** | Click logo 5 times on main menu | Developer credits + stats | 50 |

---

## Implementation Steps

### Phase 1: Project Setup (Foundation)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with RevPilot color palette
- [ ] Set up ESLint + Prettier
- [ ] Create Supabase project and configure environment variables
- [ ] Set up Netlify deployment pipeline
- [ ] Create basic folder structure

### Phase 2: Authentication System
- [ ] Configure Supabase Auth client
- [ ] Create login form component
- [ ] Create signup form component
- [ ] Implement email/password authentication
- [ ] Add OAuth options (Google, GitHub)
- [ ] Create AuthGuard for protected routes
- [ ] Build profile management page
- [ ] Set up database tables and RLS policies

### Phase 3: Core Game Engine
- [ ] Create HTML5 Canvas game component
- [ ] Implement game loop with requestAnimationFrame
- [ ] Build paddle class with physics
- [ ] Build ball class with collision detection
- [ ] Implement wall collision physics
- [ ] Implement paddle-ball collision with angle calculation
- [ ] Add score tracking system
- [ ] Create keyboard controls (arrow keys / W-S)
- [ ] Add touch/mouse controls for mobile
- [ ] Implement AI opponent with difficulty levels

### Phase 4: Game UI & Menus
- [ ] Design main menu with RevPilot gradient styling
- [ ] Create level select screen with lock/unlock states
- [ ] Build in-game HUD (score, level, time)
- [ ] Create pause menu overlay
- [ ] Design game over screen with stats
- [ ] Add victory celebration animations
- [ ] Implement responsive design for all screen sizes

### Phase 5: Level System
- [ ] Create level configuration system
- [ ] Implement Level 1: Basic tutorial
- [ ] Implement Level 2: Ball size mechanic
- [ ] Implement Level 3: Shrinking paddle
- [ ] Implement Level 4: Ball acceleration
- [ ] Implement Level 5: Multi-ball
- [ ] Implement Level 6: Gravity/curve physics
- [ ] Implement Level 7: Portal system
- [ ] Implement Level 8: Invisible ball
- [ ] Implement Level 9: Boss AI
- [ ] Implement Level 10: Combined chaos mode
- [ ] Add star rating calculation

### Phase 6: Progress & Persistence
- [ ] Save level completion to Supabase
- [ ] Track and save player progress
- [ ] Implement level unlock system
- [ ] Create progress sync on login
- [ ] Handle offline play with local storage backup
- [ ] Build leaderboard queries and display

### Phase 7: Visual Effects & Polish
- [ ] Add particle system for ball trails
- [ ] Create hit impact effects
- [ ] Implement screen shake on score
- [ ] Add gradient glow effects on paddles
- [ ] Create level transition animations
- [ ] Add background visual effects per level
- [ ] Implement RevPilot signature gradient animations

### Phase 8: Audio System
- [ ] Add paddle hit sound effects
- [ ] Add wall bounce sounds
- [ ] Add score sounds (gain/lose)
- [ ] Create level complete fanfare
- [ ] Add background music tracks
- [ ] Implement volume controls
- [ ] Add mute toggle

### Phase 9: Easter Eggs Implementation
- [ ] Implement Konami code detection
- [ ] Create disco mode visuals/audio
- [ ] Build Matrix rain effect
- [ ] Add tiny mode transformation
- [ ] Implement time-based triggers
- [ ] Add secret click counters
- [ ] Create easter egg unlock notifications
- [ ] Save discovered easter eggs to database

### Phase 10: Testing & Optimization
- [ ] Performance optimization for 60fps
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Touch controls refinement
- [ ] Load testing Supabase connections
- [ ] Accessibility improvements (colorblind modes)
- [ ] Fix bugs and edge cases

### Phase 11: Deployment & Launch
- [ ] Configure Netlify production build
- [ ] Set up environment variables on Netlify
- [ ] Configure custom domain (if applicable)
- [ ] Set up Supabase production instance
- [ ] Create database backups schedule
- [ ] Final QA testing on production
- [ ] Soft launch and monitor
- [ ] Official launch

---

## API Endpoints (Supabase Functions if needed)

```typescript
// Save game progress
POST /api/save-progress
Body: { level, score, time, stars }

// Get leaderboard
GET /api/leaderboard?limit=100

// Unlock easter egg
POST /api/unlock-easter-egg
Body: { eggId }

// Get player stats
GET /api/player-stats/:userId
```

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# App
VITE_APP_URL=https://your-app.netlify.app
```

---

## Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Timeline Estimate

| Phase | Description |
|-------|-------------|
| Phase 1 | Project Setup |
| Phase 2 | Authentication |
| Phase 3 | Core Game Engine |
| Phase 4 | UI & Menus |
| Phase 5 | Level System |
| Phase 6 | Progress & Persistence |
| Phase 7 | Visual Effects |
| Phase 8 | Audio System |
| Phase 9 | Easter Eggs |
| Phase 10 | Testing |
| Phase 11 | Deployment |

---

## Success Metrics

- Game runs at 60fps on mid-range devices
- Authentication flow completion rate > 90%
- Average session length > 5 minutes
- Level 10 completion rate tracked
- Easter egg discovery rate tracked
- Leaderboard engagement

---

## Future Enhancements (Post-Launch)

- Multiplayer mode (real-time with Supabase Realtime)
- Daily/Weekly challenges
- Custom paddle skins
- Tournament mode
- Achievement badges
- Social sharing of scores
- Mobile app (React Native)

---

*Project Plan Created: January 2026*
*RevPilot Pong - Where Sales Meets Play*
