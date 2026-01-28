import { useGameStore } from '../../stores/gameStore';
import { audio } from '../../lib/audio';

export default function PauseMenu() {
  const { setGameStatus, gameState } = useGameStore();

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 rounded-lg">
      <div className="text-center">
        <h2 className="text-3xl font-arcade gradient-text mb-8 animate-float">
          PAUSED
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => { audio.playMenuSelect(); setGameStatus('playing'); }}
            className="btn-primary rounded-lg block w-48 mx-auto"
          >
            RESUME
          </button>

          <button
            onClick={() => { audio.playMenuSelect(); setGameStatus('level_select'); }}
            className="btn-secondary rounded-lg block w-48 mx-auto"
          >
            LEVELS
          </button>

          <button
            onClick={() => { audio.playMenuSelect(); setGameStatus('menu'); }}
            className="btn-secondary rounded-lg block w-48 mx-auto"
          >
            MAIN MENU
          </button>
        </div>

        <div className="mt-8">
          <p className="text-xs font-arcade text-gray-500">
            LEVEL {gameState.currentLevel} • SCORE {gameState.playerScore}-{gameState.aiScore}
          </p>
          <p className="text-xs font-arcade text-gray-600 mt-2">
            TIP: CLICK THE CANVAS 10 TIMES WHILE PAUSED...
          </p>
        </div>
      </div>
    </div>
  );
}
