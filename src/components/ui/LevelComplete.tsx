import { useGameStore } from '../../stores/gameStore';
import { getLevelConfig, calculateStars } from '../../lib/levels';
import { audio } from '../../lib/audio';

export default function LevelComplete() {
  const { gameState, setGameStatus, setCurrentLevel, resetScores, isEasterEggActive } = useGameStore();
  const config = getLevelConfig(gameState.currentLevel);

  const stars = calculateStars(
    gameState.playerScore,
    gameState.aiScore,
    config.pointsToWin,
    gameState.totalHits,
    gameState.missedShots
  );

  const isLastLevel = gameState.currentLevel >= 10;
  const isPerfect = gameState.aiScore === 0;
  const isSpeedRun = gameState.timeElapsed < 30;

  const handleNextLevel = () => {
    audio.playMenuSelect();
    setCurrentLevel(gameState.currentLevel + 1);
    resetScores();
    setGameStatus('playing');
  };

  const handleRetry = () => {
    audio.playMenuSelect();
    resetScores();
    setGameStatus('playing');
  };

  return (
    <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-20 rounded-lg">
      <div className="text-center">
        <h2 className="text-3xl font-arcade gradient-text mb-4 animate-float">
          {isLastLevel ? 'YOU ARE THE MASTER!' : 'LEVEL COMPLETE!'}
        </h2>

        <div className="gradient-border rounded-lg p-6 mb-6 bg-revpilot-navy-dark">
          <p className="text-xs font-arcade text-gray-400 mb-3">
            LEVEL {gameState.currentLevel} - {config.name.toUpperCase()}
          </p>

          {/* Stars */}
          <div className="text-3xl mb-4">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`inline-block mx-1 ${s <= stars ? 'animate-float' : 'opacity-30'}`}
                style={{ animationDelay: `${s * 0.2}s` }}
              >
                {s <= stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          {/* Score */}
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

          <p className="text-xs font-arcade text-gray-500 mb-2">
            TIME: {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')}
          </p>

          {/* Easter egg badges */}
          {isPerfect && isEasterEggActive('perfect') && (
            <p className="text-xs font-arcade text-revpilot-gold mt-2 animate-pulse">
              PERFECT GAME! GOLDEN PADDLE EARNED!
            </p>
          )}
          {isSpeedRun && isEasterEggActive('speedrunner') && (
            <p className="text-xs font-arcade text-revpilot-orange mt-2 animate-pulse">
              SPEED RUNNER! FLAME TRAIL UNLOCKED!
            </p>
          )}
        </div>

        <div className="space-y-3">
          {!isLastLevel && (
            <button onClick={handleNextLevel} className="btn-primary rounded-lg block w-56 mx-auto">
              NEXT LEVEL →
            </button>
          )}
          <button onClick={handleRetry} className="btn-secondary rounded-lg block w-56 mx-auto">
            {stars < 3 ? 'RETRY FOR ⭐⭐⭐' : 'PLAY AGAIN'}
          </button>
          <button
            onClick={() => { audio.playMenuSelect(); setGameStatus('level_select'); }}
            className="text-xs font-arcade text-gray-500 hover:text-white transition-colors block mx-auto mt-2"
          >
            LEVEL SELECT
          </button>
        </div>

        {isLastLevel && (
          <div className="mt-6 gradient-border rounded-lg p-4 bg-revpilot-navy">
            <p className="text-xs font-arcade gradient-text">
              CONGRATULATIONS, PILOT!
            </p>
            <p className="text-xs font-arcade text-gray-400 mt-2">
              YOU HAVE MASTERED ALL 10 LEVELS!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
