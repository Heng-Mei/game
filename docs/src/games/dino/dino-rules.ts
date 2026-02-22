export type DinoObstacle = {
  x: number;
  width: number;
  height: number;
};

export type DinoState = {
  playerY: number;
  playerVy: number;
  obstacles: DinoObstacle[];
  score: number;
  elapsedMs: number;
  spawnTimerMs: number;
  running: boolean;
  gameOver: boolean;
};

export const DINO_VIEW = {
  width: 960,
  height: 640,
  floorY: 560,
  playerX: 170,
  playerW: 44,
  playerH: 48
};

const GRAVITY = 1600;
const JUMP_VELOCITY = -620;
const SPEED = 310;
const SPAWN_MS = 1250;

function createObstacle(seed: number): DinoObstacle {
  const variants = [
    { width: 28, height: 52 },
    { width: 36, height: 64 },
    { width: 52, height: 42 }
  ];
  return {
    x: DINO_VIEW.width + 20,
    ...variants[seed % variants.length]
  };
}

export function createDinoState(): DinoState {
  return {
    playerY: DINO_VIEW.floorY - DINO_VIEW.playerH,
    playerVy: 0,
    obstacles: [createObstacle(0)],
    score: 0,
    elapsedMs: 0,
    spawnTimerMs: 0,
    running: true,
    gameOver: false
  };
}

export function jump(state: DinoState): DinoState {
  if (state.gameOver) {
    return state;
  }
  const onGround = state.playerY >= DINO_VIEW.floorY - DINO_VIEW.playerH - 1;
  if (!onGround) {
    return state;
  }
  return {
    ...state,
    playerVy: JUMP_VELOCITY
  };
}

function collided(state: DinoState): boolean {
  const playerLeft = DINO_VIEW.playerX;
  const playerRight = playerLeft + DINO_VIEW.playerW;
  const playerTop = state.playerY;
  const playerBottom = playerTop + DINO_VIEW.playerH;
  return state.obstacles.some((obs) => {
    const obsLeft = obs.x;
    const obsRight = obs.x + obs.width;
    const obsTop = DINO_VIEW.floorY - obs.height;
    const obsBottom = DINO_VIEW.floorY;
    return playerRight > obsLeft
      && playerLeft < obsRight
      && playerBottom > obsTop
      && playerTop < obsBottom;
  });
}

export function stepDino(state: DinoState, deltaMs: number): DinoState {
  if (!state.running || state.gameOver) {
    return state;
  }
  const dt = deltaMs / 1000;
  const playerVy = state.playerVy + GRAVITY * dt;
  let playerY = state.playerY + playerVy * dt;
  let clampedVy = playerVy;
  if (playerY >= DINO_VIEW.floorY - DINO_VIEW.playerH) {
    playerY = DINO_VIEW.floorY - DINO_VIEW.playerH;
    clampedVy = 0;
  }

  const obstacles = state.obstacles
    .map((obs) => ({ ...obs, x: obs.x - SPEED * dt }))
    .filter((obs) => obs.x + obs.width > -40);

  let spawnTimerMs = state.spawnTimerMs + deltaMs;
  if (spawnTimerMs >= SPAWN_MS) {
    spawnTimerMs -= SPAWN_MS;
    obstacles.push(createObstacle((state.score + obstacles.length) % 3));
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const score = Math.floor(elapsedMs / 120);
  const next: DinoState = {
    ...state,
    playerY,
    playerVy: clampedVy,
    obstacles,
    score,
    elapsedMs,
    spawnTimerMs
  };

  if (collided(next)) {
    return {
      ...next,
      running: false,
      gameOver: true
    };
  }

  return next;
}
