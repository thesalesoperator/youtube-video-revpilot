import { useGameStore } from '../../stores/gameStore';
import { getLevelConfig } from '../../lib/levels';
import { audio } from '../../lib/audio';

export default function HUD() {
  const { gameState } = useGameStore();
  const config = getLevelConfig(gameState.currentLevel);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 pointer-events-none"
      style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Level info */}
      <div className="text-xs font-arcade text-revpilot-gold">
        LVL {gameState.currentLevel}
      </div>

      {/* Level name */}
      <div className="text-xs font-arcade text-gray-400">
        {config.name.toUpperCase()}
      </div>

      {/* Timer */}
      <div className="text-xs font-arcade text-gray-400">
        {formatTime(gameState.timeElapsed)}
      </div>

      {/* Mute button */}
      <button
        className="text-xs font-arcade text-gray-500 hover:text-white transition-colors pointer-events-auto"
        onClick={() => audio.toggleMute()}
      >
        {audio.muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
