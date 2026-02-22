export const SNAKE_COLS = 20;
export const SNAKE_ROWS = 20;

export type SnakeDirection = 'up' | 'down' | 'left' | 'right';

export type SnakePoint = {
  x: number;
  y: number;
};

export type SnakeState = {
  snake: SnakePoint[];
  dir: SnakeDirection;
  pendingDir: SnakeDirection;
  food: SnakePoint;
  score: number;
  gameOver: boolean;
};

type CreateSnakeOptions = Partial<Pick<SnakeState, 'snake' | 'dir' | 'pendingDir' | 'food' | 'score'>>;

const directionDelta: Record<SnakeDirection, SnakePoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

function isOpposite(a: SnakeDirection, b: SnakeDirection): boolean {
  return (a === 'up' && b === 'down')
    || (a === 'down' && b === 'up')
    || (a === 'left' && b === 'right')
    || (a === 'right' && b === 'left');
}

function findFood(snake: SnakePoint[]): SnakePoint {
  for (let y = 0; y < SNAKE_ROWS; y += 1) {
    for (let x = 0; x < SNAKE_COLS; x += 1) {
      if (!snake.some((cell) => cell.x === x && cell.y === y)) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

export function createSnakeState(options: CreateSnakeOptions = {}): SnakeState {
  const snake = options.snake ?? [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  return {
    snake,
    dir: options.dir ?? 'right',
    pendingDir: options.pendingDir ?? options.dir ?? 'right',
    food: options.food ?? findFood(snake),
    score: options.score ?? 0,
    gameOver: false
  };
}

export function changeDirection(state: SnakeState, next: SnakeDirection): SnakeState {
  if (isOpposite(state.dir, next)) {
    return state;
  }
  return {
    ...state,
    pendingDir: next
  };
}

export function stepSnake(state: SnakeState): SnakeState {
  if (state.gameOver) {
    return state;
  }

  const dir = isOpposite(state.dir, state.pendingDir) ? state.dir : state.pendingDir;
  const head = state.snake[0];
  const delta = directionDelta[dir];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };
  const eatsFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextBody = eatsFood ? state.snake : state.snake.slice(0, state.snake.length - 1);

  const hitWall = nextHead.x < 0 || nextHead.x >= SNAKE_COLS || nextHead.y < 0 || nextHead.y >= SNAKE_ROWS;
  const hitBody = nextBody.some((node) => node.x === nextHead.x && node.y === nextHead.y);
  if (hitWall || hitBody) {
    return {
      ...state,
      dir,
      pendingDir: dir,
      gameOver: true
    };
  }

  const snake = [nextHead, ...nextBody];
  return {
    snake,
    dir,
    pendingDir: dir,
    food: eatsFood ? findFood(snake) : state.food,
    score: eatsFood ? state.score + 1 : state.score,
    gameOver: false
  };
}
