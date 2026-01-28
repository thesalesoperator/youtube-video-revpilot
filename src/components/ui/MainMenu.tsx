import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { audio } from '../../lib/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../../lib/gameEngine';

export default function MainMenu() {
  const { setGameStatus, incrementLogoClicks, isEasterEggActive, activateEasterEgg, saveEasterEgg } = useGameStore();
  const { user, logout } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    const balls = Array.from({ length: 5 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 4 + Math.random() * 4,
    }));

    const animate = () => {
      frame++;
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Dashed center line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating balls
      balls.forEach((ball) => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x < 0 || ball.x > CANVAS_WIDTH) ball.vx *= -1;
        if (ball.y < 0 || ball.y > CANVAS_HEIGHT) ball.vy *= -1;

        const alpha = 0.2 + Math.sin(frame * 0.02) * 0.1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.gold;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.gold;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      // Ghost paddles
      ctx.fillStyle = `rgba(228, 78, 111, 0.15)`;
      ctx.fillRect(20, CANVAS_HEIGHT / 2 - 40 + Math.sin(frame * 0.03) * 30, 12, 80);
      ctx.fillStyle = `rgba(247, 219, 90, 0.15)`;
      ctx.fillRect(CANVAS_WIDTH - 32, CANVAS_HEIGHT / 2 - 40 + Math.cos(frame * 0.03) * 30, 12, 80);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handlePlay = useCallback(() => {
    audio.playMenuSelect();
    setGameStatus('level_select');
  }, [setGameStatus]);

  const handleLeaderboard = useCallback(() => {
    audio.playMenuSelect();
    setGameStatus('leaderboard');
  }, [setGameStatus]);

  const handleLogoClick = useCallback(() => {
    const count = incrementLogoClicks();
    if (count >= 5 && !isEasterEggActive('secret_menu')) {
      activateEasterEgg({ name: 'secret_menu', active: true });
      audio.playEasterEggFound();
      if (user) saveEasterEgg(user.id, 'secret_menu');
    }
  }, [incrementLogoClicks, isEasterEggActive, activateEasterEgg, saveEasterEgg, user]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute inset-0 w-full h-full rounded-lg"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />

      {/* Overlay content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <button onClick={handleLogoClick} className="focus:outline-none mb-2">
          <h1 className="text-4xl md:text-5xl font-arcade gradient-text animate-glow-pulse tracking-wider">
            REVPILOT
          </h1>
        </button>
        <h2 className="text-2xl md:text-3xl font-arcade text-white mb-2 tracking-[0.3em]">
          P O N G
        </h2>
        <div className="w-40 h-1 gradient-bg mx-auto rounded-full mb-8" />

        {/* Player info */}
        <p className="text-xs font-arcade text-revpilot-gold mb-8">
          WELCOME, {user?.username?.toUpperCase() || 'PILOT'}
        </p>

        {/* Menu buttons */}
        <div className="space-y-4">
          <button onClick={handlePlay} className="btn-primary rounded-lg block w-64 mx-auto">
            PLAY
          </button>
          <button onClick={handleLeaderboard} className="btn-secondary rounded-lg block w-64 mx-auto">
            LEADERBOARD
          </button>
          <button
            onClick={() => { audio.playMenuSelect(); logout(); }}
            className="text-xs font-arcade text-gray-500 hover:text-revpilot-pink transition-colors mt-4 block mx-auto"
          >
            LOGOUT
          </button>
        </div>

        {/* Secret menu display */}
        {isEasterEggActive('secret_menu') && (
          <div className="mt-6 p-4 gradient-border rounded-lg">
            <p className="text-xs font-arcade text-revpilot-gold mb-2">SECRET MENU UNLOCKED!</p>
            <p className="text-xs font-arcade text-gray-400">
              Built with love for RevPilot
            </p>
            <p className="text-xs font-arcade text-gray-500 mt-1">
              v1.0.0 | 10 Levels | 10 Easter Eggs
            </p>
          </div>
        )}

        {/* Controls hint */}
        <div className="mt-8">
          <p className="text-xs font-arcade text-gray-600">
            ↑↓ OR W/S TO MOVE • MOUSE SUPPORTED
          </p>
          <p className="text-xs font-arcade text-gray-700 mt-1">
            ESC TO PAUSE
          </p>
        </div>
      </div>
    </div>
  );
}
