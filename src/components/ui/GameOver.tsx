import { useGameStore } from '../../stores/gameStore';
import { getLevelConfig } from '../../lib/levels';
import { audio } from '../../lib/audio';

export default function GameOver() {
  const { gameState, setGameStatus, resetScores, setCurrentLevel } = useGameStore();
  const config = getLevelConfig(gameState.currentLevel);

  const handleRetry = () => {
    audio.playMenuSelect();
    resetScores();
    setGameStatus('playing');
  };

  const handleLevels = () => {
    audio.playMenuSelect();
    setGameStatus('level_select');
  };

  const handleMenu = () => {
    audio.playMenuSelect();
    setGameStatus('menu');
  };

  return (
    <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-20 rounded-lg">
      <div className="text-center">
        <h2 className="text-3xl font-arcade text-revpilot-pink mb-4 animate-shake">
          GAME OVER
        </h2>

        <div className="gradient-border rounded-lg p-6 mb-6 bg-revpilot-navy-dark">
          <p className="text-xs font-arcade text-gray-400 mb-2">
            LEVEL {gameState.currentLevel} - {config.name.toUpperCase()}
          </p>

          <div className="flex justify-center gap-8 my-4">
            <div>
              <p className="text-2xl font-arcade text-revpilot-pink">{gameState.playerScore}</p>
              <p className="text-xs font-arcade text-gray-500">YOU</p>
            </div>
            <div className="text-xl font-arcade text-gray-600 self-center">-</div>
            <div>
              <p className="text-2xl font-arcade text-revpilot-gold">{gameState.aiScore}</p>
              <p className="text-xs font-arcade text-gray-500">CPU</p>
            </div>
          </div>

          <p className="text-xs font-arcade text-gray-500">
            TIME: {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={handleRetry} className="btn-primary rounded-lg block w-48 mx-auto">
            RETRY
          </button>
          <button onClick={handleLevels} className="btn-secondary rounded-lg block w-48 mx-auto">
            LEVELS
          </button>
          <button onClick={handleMenu} className="text-xs font-arcade text-gray-500 hover:text-white transition-colors block mx-auto mt-2">
            MAIN MENU
          </button>
        </div>

        <p className="text-xs font-arcade text-gray-700 mt-6">
          DON'T GIVE UP, PILOT!
        </p>
      </div>
    </div>
  );
}
