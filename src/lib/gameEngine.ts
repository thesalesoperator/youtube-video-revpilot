import type { BallState, PaddleState, Particle, Portal, LevelConfig } from '../types';

// === CONSTANTS ===
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const PADDLE_WIDTH = 12;
export const PADDLE_HEIGHT = 80;
export const BALL_RADIUS = 8;
export const PADDLE_MARGIN = 20;

// === COLORS ===
export const COLORS = {
  gold: '#f7db5a',
  orange: '#ffbd57',
  pink: '#e44e6f',
  navy: '#1a1a2e',
  navyLight: '#16213e',
  navyDark: '#0f0f23',
  white: '#ffffff',
  dimWhite: 'rgba(255, 255, 255, 0.3)',
};

// === BALL ===
export function createBall(config: LevelConfig): BallState {
  const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
  const direction = Math.random() > 0.5 ? 1 : -1;
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: Math.cos(angle) * config.ballSpeed * direction,
    vy: Math.sin(angle) * config.ballSpeed,
    radius: BALL_RADIUS,
    visible: true,
    trail: [],
  };
}

export function updateBall(
  ball: BallState,
  config: LevelConfig,
  hitCount: number,
  _deltaTime: number
): BallState {
  const newBall = { ...ball };

  // Growing ball mechanic
  if (config.specialMechanic === 'growing_ball') {
    newBall.radius = BALL_RADIUS + hitCount * 1.5;
  }

  // Gravity well mechanic
  if (config.specialMechanic === 'gravity_well' || config.specialMechanic === 'chaos') {
    const centerY = CANVAS_HEIGHT / 2;
    const gravityStrength = 0.05;
    newBall.vy += (centerY - newBall.y) > 0 ? gravityStrength : -gravityStrength;
    // Also add slight horizontal wave
    newBall.vy += Math.sin(newBall.x / 50) * 0.02;
  }

  // Invisible ball mechanic
  if (config.specialMechanic === 'invisible_ball' || config.specialMechanic === 'chaos') {
    const midZone = CANVAS_WIDTH * 0.3;
    const centerX = CANVAS_WIDTH / 2;
    newBall.visible = Math.abs(newBall.x - centerX) > midZone / 2;
  } else {
    newBall.visible = true;
  }

  // Update position
  newBall.x += newBall.vx;
  newBall.y += newBall.vy;

  // Wall collision (top/bottom)
  if (newBall.y - newBall.radius <= 0) {
    newBall.y = newBall.radius;
    newBall.vy = Math.abs(newBall.vy);
  } else if (newBall.y + newBall.radius >= CANVAS_HEIGHT) {
    newBall.y = CANVAS_HEIGHT - newBall.radius;
    newBall.vy = -Math.abs(newBall.vy);
  }

  // Trail
  newBall.trail = [
    { x: newBall.x, y: newBall.y, alpha: 1 },
    ...ball.trail.map((t) => ({ ...t, alpha: t.alpha - 0.05 })).filter((t) => t.alpha > 0),
  ].slice(0, 20);

  return newBall;
}

export function checkPaddleCollision(
  ball: BallState,
  paddle: PaddleState,
  config: LevelConfig,
  hitCount: number,
  isPlayer: boolean
): { hit: boolean; ball: BallState } {
  const newBall = { ...ball };

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  if (
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom
  ) {
    // Calculate hit position on paddle (0 to 1)
    const hitPos = (ball.y - paddle.y) / paddle.height;
    const angle = (hitPos - 0.5) * (Math.PI / 3); // Max 60 degree angle

    const speedMultiplier = 1 + hitCount * (config.ballSpeedIncrement / config.ballSpeed);
    const speed = config.ballSpeed * speedMultiplier;

    if (isPlayer) {
      newBall.vx = Math.abs(Math.cos(angle) * speed);
      newBall.x = paddleRight + ball.radius;
    } else {
      newBall.vx = -Math.abs(Math.cos(angle) * speed);
      newBall.x = paddleLeft - ball.radius;
    }
    newBall.vy = Math.sin(angle) * speed;

    return { hit: true, ball: newBall };
  }

  return { hit: false, ball };
}

// === PADDLE ===
export function createPlayerPaddle(): PaddleState {
  return {
    x: PADDLE_MARGIN,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 6,
    color: COLORS.pink,
  };
}

export function createAiPaddle(config: LevelConfig): PaddleState {
  const height = config.specialMechanic === 'boss_battle' ? PADDLE_HEIGHT * 1.5 : PADDLE_HEIGHT;
  return {
    x: CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - height / 2,
    width: PADDLE_WIDTH,
    height,
    speed: config.aiSpeed,
    color: COLORS.gold,
  };
}

export function updateAiPaddle(
  paddle: PaddleState,
  ball: BallState,
  config: LevelConfig,
  frameCount: number
): PaddleState {
  const newPaddle = { ...paddle };
  // AI only reacts every N frames based on difficulty
  const reactionFrames = Math.max(1, Math.floor(config.aiReactionDelay / 16));
  if (frameCount % reactionFrames !== 0) return newPaddle;

  const paddleCenter = paddle.y + paddle.height / 2;
  const diff = ball.y - paddleCenter;
  const maxMove = config.aiSpeed;

  // Add slight imperfection
  const imperfection = (Math.random() - 0.5) * 2;

  if (Math.abs(diff) > 5) {
    newPaddle.y += Math.min(Math.abs(diff), maxMove) * Math.sign(diff) + imperfection;
  }

  // Clamp to canvas
  newPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, newPaddle.y));

  return newPaddle;
}

export function updatePlayerPaddleFromShrink(
  paddle: PaddleState,
  config: LevelConfig,
  timeElapsed: number
): PaddleState {
  if (config.specialMechanic === 'shrinking_paddle' || config.specialMechanic === 'chaos') {
    const minHeight = 30;
    const shrinkRate = 2; // pixels per second
    const newHeight = Math.max(minHeight, PADDLE_HEIGHT - timeElapsed * shrinkRate);
    return { ...paddle, height: newHeight };
  }
  return paddle;
}

// === PARTICLES ===
export function createScoreParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function createHitParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6,
      maxLife: 0.6,
      color: Math.random() > 0.5 ? COLORS.gold : COLORS.pink,
      size: 1 + Math.random() * 2,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt * 60,
      y: p.y + p.vy * dt * 60,
      life: p.life - dt,
      vx: p.vx * 0.98,
      vy: p.vy * 0.98,
    }))
    .filter((p) => p.life > 0);
}

// === PORTALS ===
export function createPortals(): Portal[] {
  return [
    { x: CANVAS_WIDTH * 0.35, y1: 50, y2: CANVAS_HEIGHT - 50, active: true },
    { x: CANVAS_WIDTH * 0.65, y1: CANVAS_HEIGHT - 50, y2: 50, active: true },
  ];
}

export function checkPortalCollision(ball: BallState, portals: Portal[]): BallState {
  for (const portal of portals) {
    if (!portal.active) continue;
    const dist = Math.abs(ball.x - portal.x);
    const yDist = Math.abs(ball.y - portal.y1);
    if (dist < 15 && yDist < 20) {
      return {
        ...ball,
        x: portal.x,
        y: portal.y2,
      };
    }
  }
  return ball;
}

// === RENDERING ===
export function drawBackground(ctx: CanvasRenderingContext2D, isRetroMode: boolean) {
  if (isRetroMode) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, COLORS.navyDark);
    gradient.addColorStop(1, COLORS.navy);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Center line
  ctx.strokeStyle = COLORS.dimWhite;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: BallState,
  isDiscoMode: boolean,
  isRetroMode: boolean
) {
  // Trail
  ball.trail.forEach((t) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, ball.radius * 0.6, 0, Math.PI * 2);
    if (isDiscoMode) {
      ctx.fillStyle = `hsla(${(t.x + t.y) % 360}, 100%, 50%, ${t.alpha * 0.3})`;
    } else {
      ctx.fillStyle = `rgba(247, 219, 90, ${t.alpha * 0.2})`;
    }
    ctx.fill();
  });

  if (!ball.visible) return;

  // Glow
  if (!isRetroMode) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = isDiscoMode
      ? `hsl(${Date.now() % 360}, 100%, 50%)`
      : COLORS.gold;
  }

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

  if (isDiscoMode) {
    const hue = (Date.now() / 5) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
  } else if (isRetroMode) {
    ctx.fillStyle = '#00ff00';
  } else {
    const gradient = ctx.createRadialGradient(
      ball.x, ball.y, 0,
      ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, COLORS.white);
    gradient.addColorStop(0.5, COLORS.gold);
    gradient.addColorStop(1, COLORS.orange);
    ctx.fillStyle = gradient;
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: PaddleState,
  isRetroMode: boolean
) {
  if (!isRetroMode) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
  }

  const gradient = ctx.createLinearGradient(
    paddle.x, paddle.y,
    paddle.x, paddle.y + paddle.height
  );

  if (isRetroMode) {
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, '#00cc00');
  } else {
    gradient.addColorStop(0, paddle.color);
    gradient.addColorStop(0.5, paddle.color === COLORS.pink ? COLORS.orange : COLORS.gold);
    gradient.addColorStop(1, paddle.color);
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function drawPortals(ctx: CanvasRenderingContext2D, portals: Portal[], frameCount: number) {
  portals.forEach((portal, i) => {
    const pulse = Math.sin(frameCount * 0.05 + i) * 5;
    const color = i === 0 ? COLORS.gold : COLORS.pink;

    ctx.shadowBlur = 15 + pulse;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(portal.x, portal.y1, 15 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    ctx.fillStyle = `${color}33`;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

export function drawScore(
  ctx: CanvasRenderingContext2D,
  playerScore: number,
  aiScore: number,
  isRetroMode: boolean
) {
  ctx.font = isRetroMode ? '24px "Press Start 2P"' : '28px "Press Start 2P"';
  ctx.textAlign = 'center';

  if (isRetroMode) {
    ctx.fillStyle = '#00ff00';
  } else {
    ctx.fillStyle = COLORS.pink;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.pink;
  }
  ctx.fillText(String(playerScore), CANVAS_WIDTH / 4, 45);

  if (isRetroMode) {
    ctx.fillStyle = '#00ff00';
  } else {
    ctx.fillStyle = COLORS.gold;
    ctx.shadowColor = COLORS.gold;
  }
  ctx.fillText(String(aiScore), (CANVAS_WIDTH * 3) / 4, 45);
  ctx.shadowBlur = 0;
}

// Matrix rain effect
export function drawMatrixRain(ctx: CanvasRenderingContext2D, drops: number[]) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#0f0';
  ctx.font = '10px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = String.fromCharCode(0x30A0 + Math.random() * 96);
    ctx.fillText(text, i * 14, drops[i] * 14);
    if (drops[i] * 14 > CANVAS_HEIGHT && Math.random() > 0.98) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

// CRT scanline overlay
export function drawCRTOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
    ctx.fillRect(0, i, CANVAS_WIDTH, 1);
  }
}

// Fireworks for perfect game
export function createFireworkParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = [COLORS.gold, COLORS.orange, COLORS.pink, COLORS.white, '#ff4444', '#44ff44', '#4444ff'];
  for (let i = 0; i < 50; i++) {
    const angle = (Math.PI * 2 * i) / 50;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.5,
      maxLife: 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
    });
  }
  return particles;
}
