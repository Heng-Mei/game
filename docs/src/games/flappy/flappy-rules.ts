export type FlappyPipe = {
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
};

export type FlappyState = {
  birdY: number;
  birdVy: number;
  pipes: FlappyPipe[];
  score: number;
  elapsedMs: number;
  running: boolean;
  gameOver: boolean;
  spawnTimerMs: number;
};

export const FLAPPY_VIEW = {
  width: 960,
  height: 640,
  birdX: 180,
  birdRadius: 16,
  floorY: 610,
  ceilingY: 20
};

const GRAVITY = 820;
const FLAP_VELOCITY = -280;
const PIPE_SPEED = 210;
const PIPE_SPAWN_MS = 1450;

function initialPipe(): FlappyPipe {
  return {
    x: 380,
    gapY: 300,
    gapSize: 170,
    width: 74,
    passed: false
  };
}

export function createFlappyState(): FlappyState {
  return {
    birdY: 300,
    birdVy: 0,
    pipes: [initialPipe()],
    score: 0,
    elapsedMs: 0,
    running: true,
    gameOver: false,
    spawnTimerMs: 0
  };
}

export function flap(state: FlappyState): FlappyState {
  if (state.gameOver) {
    return state;
  }
  return {
    ...state,
    birdVy: FLAP_VELOCITY
  };
}

function collides(state: FlappyState): boolean {
  if (state.birdY + FLAPPY_VIEW.birdRadius >= FLAPPY_VIEW.floorY) {
    return true;
  }
  if (state.birdY - FLAPPY_VIEW.birdRadius <= FLAPPY_VIEW.ceilingY) {
    return true;
  }
  return state.pipes.some((pipe) => {
    const inPipeX = FLAPPY_VIEW.birdX + FLAPPY_VIEW.birdRadius > pipe.x
      && FLAPPY_VIEW.birdX - FLAPPY_VIEW.birdRadius < pipe.x + pipe.width;
    if (!inPipeX) {
      return false;
    }
    const gapTop = pipe.gapY - pipe.gapSize / 2;
    const gapBottom = pipe.gapY + pipe.gapSize / 2;
    return state.birdY - FLAPPY_VIEW.birdRadius < gapTop
      || state.birdY + FLAPPY_VIEW.birdRadius > gapBottom;
  });
}

export function stepFlappy(state: FlappyState, deltaMs: number): FlappyState {
  if (!state.running || state.gameOver) {
    return state;
  }

  const dt = deltaMs / 1000;
  const birdVy = state.birdVy + GRAVITY * dt;
  const birdY = state.birdY + birdVy * dt;

  let spawnTimerMs = state.spawnTimerMs + deltaMs;
  const pipes = state.pipes
    .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED * dt }))
    .filter((pipe) => pipe.x + pipe.width > -20);

  if (spawnTimerMs >= PIPE_SPAWN_MS) {
    spawnTimerMs -= PIPE_SPAWN_MS;
    const offset = Math.sin((state.score + pipes.length) * 1.3) * 120;
    pipes.push({
      x: FLAPPY_VIEW.width + 30,
      gapY: 300 + offset,
      gapSize: 170,
      width: 74,
      passed: false
    });
  }

  let score = state.score;
  const elapsedMs = state.elapsedMs + deltaMs;
  pipes.forEach((pipe) => {
    if (!pipe.passed && pipe.x + pipe.width < FLAPPY_VIEW.birdX) {
      pipe.passed = true;
      score += 1;
    }
  });
  score = Math.max(score, Math.floor(elapsedMs / 900));

  const next: FlappyState = {
    ...state,
    birdVy,
    birdY,
    pipes,
    score,
    elapsedMs,
    spawnTimerMs
  };

  if (collides(next)) {
    return {
      ...next,
      running: false,
      gameOver: true
    };
  }

  return next;
}
