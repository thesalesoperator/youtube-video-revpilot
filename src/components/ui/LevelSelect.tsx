import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { LEVELS } from '../../lib/levels';
import { audio } from '../../lib/audio';

export default function LevelSelect() {
  const { setGameStatus, setCurrentLevel, resetScores, progress, loadProgress } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadProgress(user.id);
    }
  }, [user, loadProgress]);

  const highestUnlocked = progress?.highest_level_unlocked || 1;

  const handleSelectLevel = (level: number) => {
    if (level > highestUnlocked) return;
    audio.playMenuSelect();
    setCurrentLevel(level);
    resetScores();
    setGameStatus('playing');
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-arcade gradient-text mb-2">SELECT LEVEL</h2>
        <div className="w-24 h-1 gradient-bg mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {LEVELS.map((level) => {
          const isUnlocked = level.level <= highestUnlocked;
          const isCurrent = level.level === highestUnlocked;

          return (
            <button
              key={level.level}
              onClick={() => handleSelectLevel(level.level)}
              disabled={!isUnlocked}
              className={`
                relative p-4 rounded-lg font-arcade text-center transition-all duration-200
                ${isUnlocked
                  ? isCurrent
                    ? 'gradient-border bg-revpilot-navy animate-glow-pulse cursor-pointer hover:scale-105'
                    : 'gradient-border bg-revpilot-navy cursor-pointer hover:scale-105 hover:shadow-lg'
                  : 'border-2 border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Level number */}
              <div className={`text-2xl mb-2 ${isUnlocked ? 'gradient-text' : 'text-gray-600'}`}>
                {isUnlocked ? level.level : '🔒'}
              </div>

              {/* Level name */}
              <div className={`text-xs ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                {level.name}
              </div>

              {/* Points to win */}
              <div className={`text-xs mt-1 ${isUnlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                {level.pointsToWin} PTS
              </div>

              {/* Current level indicator */}
              {isCurrent && (
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full gradient-bg animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Level description */}
      <div className="text-center">
        <p className="text-xs font-arcade text-gray-400 mb-6">
          COMPLETE LEVELS TO UNLOCK THE NEXT
        </p>

        <button
          onClick={() => { audio.playMenuSelect(); setGameStatus('menu'); }}
          className="btn-secondary rounded-lg"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
