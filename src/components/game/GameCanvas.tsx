import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { useControls } from '../../hooks/useControls';
import { audio } from '../../lib/audio';
import { getLevelConfig, calculateStars } from '../../lib/levels';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  COLORS,
  createBall, updateBall, checkPaddleCollision,
  createPlayerPaddle, createAiPaddle, updateAiPaddle, updatePlayerPaddleFromShrink,
  createScoreParticles, createHitParticles, updateParticles, createFireworkParticles,
  createPortals, checkPortalCollision,
  drawBackground, drawBall, drawPaddle, drawParticles, drawPortals, drawScore,
  drawMatrixRain, drawCRTOverlay,
} from '../../lib/gameEngine';
import type { BallState, PaddleState, Particle, Portal, LevelConfig } from '../../types';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const gameData = useRef<{
    balls: BallState[];
    playerPaddle: PaddleState;
    aiPaddle: PaddleState;
    particles: Particle[];
    portals: Portal[];
    config: LevelConfig;
    hitCount: number;
    frameCount: number;
    lastTime: number;
    startTime: number;
    matrixDrops: number[];
    secondBallSpawned: boolean;
    chaosTimer: number;
    chaosMechanic: number;
  } | null>(null);

  const {
    gameState,
    setGameStatus,
    incrementPlayerScore,
    incrementAiScore,
    incrementTotalHits,
    incrementMissedShots,
    resetScores,
    setTimeElapsed,
    triggerScreenShake,
    isEasterEggActive,
    activateEasterEgg,
    saveEasterEgg,
    saveProgress,
    screenShake,
  } = useGameStore();

  const { user } = useAuthStore();

  const handleKeyDown = useCallback((key: string) => {
    if (key === 'Escape' || key === 'p') {
      if (gameState.status === 'playing') {
        setGameStatus('paused');
      } else if (gameState.status === 'paused') {
        setGameStatus('playing');
      }
    }

    // Konami code
    const isKonami = useGameStore.getState().addKonamiKey(key);
    if (isKonami && !isEasterEggActive('konami')) {
      activateEasterEgg({ name: 'konami', active: true });
      audio.playEasterEggFound();
      if (user) saveEasterEgg(user.id, 'konami');
    }
  }, [gameState.status, setGameStatus, isEasterEggActive, activateEasterEgg, saveEasterEgg, user]);

  const { keysPressed, typedBuffer } = useControls(handleKeyDown);

  // Initialize game
  const initGame = useCallback(() => {
    const config = getLevelConfig(gameState.currentLevel);
    const balls = [createBall(config)];
    const playerPaddle = createPlayerPaddle();
    const aiPaddle = createAiPaddle(config);
    const portals = config.specialMechanic === 'portals' || config.specialMechanic === 'chaos'
      ? createPortals()
      : [];

    gameData.current = {
      balls,
      playerPaddle,
      aiPaddle,
      particles: [],
      portals,
      config,
      hitCount: 0,
      frameCount: 0,
      lastTime: performance.now(),
      startTime: performance.now(),
      matrixDrops: Array.from({ length: Math.ceil(CANVAS_WIDTH / 14) }, () => Math.floor(Math.random() * CANVAS_HEIGHT / 14)),
      secondBallSpawned: false,
      chaosTimer: 0,
      chaosMechanic: 0,
    };

    resetScores();
  }, [gameState.currentLevel, resetScores]);

  // Reset ball after score
  const resetBall = useCallback((scoredByPlayer: boolean) => {
    if (!gameData.current) return;
    const { config } = gameData.current;
    const ball = createBall(config);
    // Direct ball toward the scorer
    if (scoredByPlayer) {
      ball.vx = -Math.abs(ball.vx);
    } else {
      ball.vx = Math.abs(ball.vx);
    }
    gameData.current.balls = [ball];
    gameData.current.hitCount = 0;
    gameData.current.secondBallSpawned = false;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const data = gameData.current;
    if (!canvas || !ctx || !data) return;

    const currentState = useGameStore.getState().gameState;
    if (currentState.status !== 'playing') {
      animRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - data.lastTime) / 1000, 0.05);
    data.lastTime = now;
    data.frameCount++;

    const timeElapsed = (now - data.startTime) / 1000;
    setTimeElapsed(Math.floor(timeElapsed));

    const isRetroMode = isEasterEggActive('konami');
    const isDiscoMode = isEasterEggActive('disco');
    const isMatrixMode = isEasterEggActive('matrix');
    const isTinyMode = isEasterEggActive('tiny');
    const isNeonMode = isEasterEggActive('neon');

    // === UPDATE ===

    // Player paddle input
    const keys = keysPressed.current;
    const moveSpeed = data.playerPaddle.speed * dt * 60;
    if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
      data.playerPaddle.y -= moveSpeed;
    }
    if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
      data.playerPaddle.y += moveSpeed;
    }
    data.playerPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - data.playerPaddle.height, data.playerPaddle.y));

    // Shrinking paddle
    data.playerPaddle = updatePlayerPaddleFromShrink(data.playerPaddle, data.config, timeElapsed);

    // Check typed buffer for easter eggs
    if (typedBuffer.current.endsWith('smol') && !isEasterEggActive('tiny')) {
      activateEasterEgg({ name: 'tiny', active: true, duration: 30000, startTime: now });
      audio.playEasterEggFound();
      if (user) saveEasterEgg(user.id, 'tiny');
    }

    // Night owl check
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4 && !isEasterEggActive('neon')) {
      activateEasterEgg({ name: 'neon', active: true });
      audio.playEasterEggFound();
      if (user) saveEasterEgg(user.id, 'neon');
    }

    // Chaos mode - cycle mechanics
    if (data.config.specialMechanic === 'chaos') {
      data.chaosTimer += dt;
      if (data.chaosTimer > 10) {
        data.chaosTimer = 0;
        data.chaosMechanic = (data.chaosMechanic + 1) % 5;
      }
    }

    // Multi-ball: spawn second ball
    if ((data.config.specialMechanic === 'multi_ball' || data.config.specialMechanic === 'chaos') &&
        !data.secondBallSpawned && data.hitCount >= 3) {
      const secondBall = createBall(data.config);
      data.balls.push(secondBall);
      data.secondBallSpawned = true;
    }

    // Update balls
    const ballsToRemove: number[] = [];
    data.balls = data.balls.map((ball, idx) => {
      let updatedBall = updateBall(ball, data.config, data.hitCount, dt);

      // Portal collision
      if (data.portals.length > 0) {
        const beforePortal = { ...updatedBall };
        updatedBall = checkPortalCollision(updatedBall, data.portals);
        if (beforePortal.x !== updatedBall.x || beforePortal.y !== updatedBall.y) {
          audio.playPortal();
        }
      }

      // Player paddle collision
      const playerResult = checkPaddleCollision(updatedBall, data.playerPaddle, data.config, data.hitCount, true);
      if (playerResult.hit) {
        updatedBall = playerResult.ball;
        data.hitCount++;
        data.particles.push(...createHitParticles(updatedBall.x, updatedBall.y));
        audio.playHit();
        incrementTotalHits();
      }

      // AI paddle collision
      const aiResult = checkPaddleCollision(updatedBall, data.aiPaddle, data.config, data.hitCount, false);
      if (aiResult.hit) {
        updatedBall = aiResult.ball;
        data.hitCount++;
        data.particles.push(...createHitParticles(updatedBall.x, updatedBall.y));
        audio.playBounce();
      }

      // Score detection
      if (updatedBall.x - updatedBall.radius < 0) {
        // AI scores
        incrementAiScore();
        incrementMissedShots();
        triggerScreenShake();
        audio.playScoreDown();
        data.particles.push(...createScoreParticles(0, updatedBall.y, COLORS.gold));

        const state = useGameStore.getState().gameState;
        if (state.aiScore + 1 >= data.config.pointsToWin) {
          setGameStatus('game_over');
          audio.playGameOver();

          // Persistence easter egg
          const store = useGameStore.getState();
          // Track losses for persistence
          if (user) {
            store.incrementSecretClicks(); // reuse counter for loss tracking
          }
          return updatedBall;
        }

        if (data.balls.length > 1) {
          ballsToRemove.push(idx);
        } else {
          resetBall(false);
          return data.balls[0];
        }
      } else if (updatedBall.x + updatedBall.radius > CANVAS_WIDTH) {
        // Player scores
        incrementPlayerScore();
        triggerScreenShake();
        audio.playScoreUp();
        data.particles.push(...createScoreParticles(CANVAS_WIDTH, updatedBall.y, COLORS.pink));

        const state = useGameStore.getState().gameState;
        const newScore = state.playerScore + 1;

        // Disco easter egg: score hits 7 on player side (777 approximation)
        if (newScore === 7 && !isEasterEggActive('disco')) {
          activateEasterEgg({ name: 'disco', active: true, duration: 20000, startTime: now });
          audio.playEasterEggFound();
          if (user) saveEasterEgg(user.id, 'disco');
        }

        if (newScore >= data.config.pointsToWin) {
          const stars = calculateStars(
            newScore,
            state.aiScore,
            data.config.pointsToWin,
            state.totalHits,
            state.missedShots
          );

          // Perfect game easter egg
          if (state.aiScore === 0) {
            activateEasterEgg({ name: 'perfect', active: true });
            audio.playEasterEggFound();
            data.particles.push(
              ...createFireworkParticles(CANVAS_WIDTH / 4, CANVAS_HEIGHT / 4),
              ...createFireworkParticles(CANVAS_WIDTH * 3 / 4, CANVAS_HEIGHT / 4),
              ...createFireworkParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            );
            if (user) saveEasterEgg(user.id, 'perfect');
          }

          // Speed runner easter egg
          if (timeElapsed < 30) {
            activateEasterEgg({ name: 'speedrunner', active: true });
            audio.playEasterEggFound();
            if (user) saveEasterEgg(user.id, 'speedrunner');
          }

          setGameStatus('level_complete');
          audio.playLevelComplete();

          if (user) {
            saveProgress(user.id, gameState.currentLevel, newScore, stars, Math.floor(timeElapsed));
          }
          return updatedBall;
        }

        if (data.balls.length > 1) {
          ballsToRemove.push(idx);
        } else {
          resetBall(true);
          return data.balls[0];
        }
      }

      return updatedBall;
    });

    // Remove scored balls
    if (ballsToRemove.length > 0) {
      data.balls = data.balls.filter((_, i) => !ballsToRemove.includes(i));
      if (data.balls.length === 0) {
        resetBall(true);
      }
    }

    // AI paddle follows first ball
    if (data.balls.length > 0) {
      data.aiPaddle = updateAiPaddle(data.aiPaddle, data.balls[0], data.config, data.frameCount);
    }

    // Update particles
    data.particles = updateParticles(data.particles, dt);

    // Deactivate timed easter eggs
    const activeEggs = useGameStore.getState().activeEasterEggs;
    activeEggs.forEach((egg) => {
      if (egg.duration && egg.startTime && now - egg.startTime > egg.duration) {
        useGameStore.getState().deactivateEasterEgg(egg.name);
      }
    });

    // === RENDER ===
    ctx.save();

    // Tiny mode scale
    if (isTinyMode) {
      ctx.translate(CANVAS_WIDTH / 4, CANVAS_HEIGHT / 4);
      ctx.scale(0.5, 0.5);
    }

    // Screen shake
    if (screenShake) {
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = (Math.random() - 0.5) * 8;
      ctx.translate(shakeX, shakeY);
    }

    // Background
    if (isMatrixMode) {
      drawMatrixRain(ctx, data.matrixDrops);
    } else {
      drawBackground(ctx, isRetroMode);
    }

    // Neon mode glow
    if (isNeonMode) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = COLORS.gold;
    }

    // Portals
    if (data.portals.length > 0) {
      drawPortals(ctx, data.portals, data.frameCount);
    }

    // Paddles
    drawPaddle(ctx, data.playerPaddle, isRetroMode);
    drawPaddle(ctx, data.aiPaddle, isRetroMode);

    // Balls
    data.balls.forEach((ball) => {
      drawBall(ctx, ball, isDiscoMode, isRetroMode);
    });

    // Particles
    drawParticles(ctx, data.particles);

    // Score
    const state = useGameStore.getState().gameState;
    drawScore(ctx, state.playerScore, state.aiScore, isRetroMode);

    // Level indicator
    ctx.font = '8px "Press Start 2P"';
    ctx.fillStyle = COLORS.dimWhite;
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${gameState.currentLevel} - ${data.config.name.toUpperCase()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

    // CRT overlay for retro mode
    if (isRetroMode) {
      drawCRTOverlay(ctx);
    }

    ctx.restore();

    animRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState.currentLevel,
    setTimeElapsed,
    isEasterEggActive,
    keysPressed,
    typedBuffer,
    incrementPlayerScore,
    incrementAiScore,
    incrementTotalHits,
    incrementMissedShots,
    triggerScreenShake,
    setGameStatus,
    resetBall,
    activateEasterEgg,
    saveEasterEgg,
    saveProgress,
    screenShake,
    user,
  ]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.status === 'playing' || gameState.status === 'paused') {
      if (!gameData.current) {
        initGame();
      }
      if (gameData.current) {
        gameData.current.lastTime = performance.now();
      }
      animRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [gameState.status, gameLoop, initGame]);

  // Reinitialize on level change
  useEffect(() => {
    if (gameState.status === 'playing') {
      initGame();
    }
  }, [gameState.currentLevel, initGame, gameState.status]);

  // Mouse/touch controls
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameData.current || gameState.status !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_HEIGHT / rect.height;
    const mouseY = (e.clientY - rect.top) * scaleY;
    gameData.current.playerPaddle.y = mouseY - gameData.current.playerPaddle.height / 2;
    gameData.current.playerPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - gameData.current.playerPaddle.height, gameData.current.playerPaddle.y));
  }, [gameState.status]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameData.current || gameState.status !== 'playing') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_HEIGHT / rect.height;
    const touchY = (e.touches[0].clientY - rect.top) * scaleY;
    gameData.current.playerPaddle.y = touchY - gameData.current.playerPaddle.height / 2;
    gameData.current.playerPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - gameData.current.playerPaddle.height, gameData.current.playerPaddle.y));
  }, [gameState.status]);

  // Canvas click for secret click counter (matrix easter egg)
  const handleCanvasClick = useCallback(() => {
    if (gameState.status === 'paused') {
      const count = useGameStore.getState().incrementSecretClicks();
      if (count >= 10 && !isEasterEggActive('matrix')) {
        activateEasterEgg({ name: 'matrix', active: true, duration: 30000, startTime: performance.now() });
        audio.playEasterEggFound();
        if (user) saveEasterEgg(user.id, 'matrix');
      }
    }
  }, [gameState.status, isEasterEggActive, activateEasterEgg, saveEasterEgg, user]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleCanvasClick}
      className="border-2 border-revpilot-navy-light rounded-lg shadow-2xl cursor-none"
      style={{
        maxWidth: '100%',
        maxHeight: '80vh',
        imageRendering: isEasterEggActive('konami') ? 'pixelated' : 'auto',
      }}
    />
  );
}
