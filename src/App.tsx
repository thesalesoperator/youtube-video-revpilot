import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useGameStore } from './stores/gameStore';
import AuthScreen from './components/auth/AuthScreen';
import MainMenu from './components/ui/MainMenu';
import LevelSelect from './components/ui/LevelSelect';
import GameCanvas from './components/game/GameCanvas';
import HUD from './components/ui/HUD';
import PauseMenu from './components/ui/PauseMenu';
import GameOver from './components/ui/GameOver';
import LevelComplete from './components/ui/LevelComplete';
import Leaderboard from './components/ui/Leaderboard';
import EasterEggNotification from './components/ui/EasterEggNotification';

export default function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const { gameState, screenShake } = useGameStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-revpilot-navy-dark">
        <div className="text-center">
          <h1 className="text-2xl font-arcade gradient-text animate-pulse">
            REVPILOT PONG
          </h1>
          <p className="text-xs font-arcade text-gray-500 mt-4">LOADING...</p>
        </div>
      </div>
    );
  }

  // Show auth if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Game container
  return (
    <div className="min-h-screen flex items-center justify-center bg-revpilot-navy-dark p-2">
      <div
        className={`relative w-full max-w-4xl ${screenShake ? 'animate-shake' : ''}`}
      >
        {/* Main Menu */}
        {gameState.status === 'menu' && (
          <div className="w-full" style={{ aspectRatio: '800/500' }}>
            <MainMenu />
          </div>
        )}

        {/* Level Select */}
        {gameState.status === 'level_select' && (
          <LevelSelect />
        )}

        {/* Leaderboard */}
        {gameState.status === 'leaderboard' && (
          <Leaderboard />
        )}

        {/* Game Playing */}
        {(gameState.status === 'playing' || gameState.status === 'paused' || gameState.status === 'game_over' || gameState.status === 'level_complete') && (
          <div className="relative">
            <GameCanvas />

            {/* HUD overlay */}
            <HUD />

            {/* Pause overlay */}
            {gameState.status === 'paused' && <PauseMenu />}

            {/* Game over overlay */}
            {gameState.status === 'game_over' && <GameOver />}

            {/* Level complete overlay */}
            {gameState.status === 'level_complete' && <LevelComplete />}
          </div>
        )}
      </div>

      {/* Easter egg notifications */}
      <EasterEggNotification />

      {/* Scanline overlay for retro feel */}
      <div className="scanline" />
    </div>
  );
}
