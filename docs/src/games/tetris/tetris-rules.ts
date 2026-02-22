export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export const START_LEVEL = 1;
export const TETRIS_COLS = 10;
export const TETRIS_ROWS = 20;

export const TETROMINO_SEQUENCE: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export type ActivePiece = {
  type: TetrominoType;
  rotation: number;
  x: number;
  y: number;
};

export type TetrisRuntimeState = {
  board: Array<Array<TetrominoType | null>>;
  active: ActivePiece;
  queue: TetrominoType[];
  hold: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
};

export type TetrisRuleAction =
  | { type: 'moveLeft' }
  | { type: 'moveRight' }
  | { type: 'softDrop' }
  | { type: 'hardDrop' }
  | { type: 'rotateRight' }
  | { type: 'rotateLeft' }
  | { type: 'hold' }
  | { type: 'tick' };

type Cells = Array<[number, number]>;

const ROTATIONS: Record<TetrominoType, Cells[]> = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]]
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]]
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]]
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]]
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]]
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]]
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]]
  ]
};

function createEmptyBoard() {
  return Array.from({ length: TETRIS_ROWS }, () => Array<TetrominoType | null>(TETRIS_COLS).fill(null));
}

function shuffleBag(randomValue: () => number): TetrominoType[] {
  const bag = [...TETROMINO_SEQUENCE];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomValue() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function withQueue(queue: TetrominoType[], randomValue: () => number): TetrominoType[] {
  const next = [...queue];
  while (next.length < TETROMINO_SEQUENCE.length + 1) {
    next.push(...shuffleBag(randomValue));
  }
  return next;
}

function spawnPiece(type: TetrominoType): ActivePiece {
  return {
    type,
    rotation: 0,
    x: 3,
    y: -1
  };
}

function firstActiveFromQueue(queue: TetrominoType[]): { active: ActivePiece; queue: TetrominoType[] } {
  const [head, ...rest] = queue;
  return {
    active: spawnPiece(head ?? 'T'),
    queue: rest
  };
}

function cellsForPiece(piece: ActivePiece): Cells {
  return ROTATIONS[piece.type][piece.rotation % 4];
}

export function getPieceCells(piece: ActivePiece): Cells {
  return cellsForPiece(piece);
}

function collides(board: TetrisRuntimeState['board'], piece: ActivePiece): boolean {
  const cells = cellsForPiece(piece);
  return cells.some(([cx, cy]) => {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (x < 0 || x >= TETRIS_COLS || y >= TETRIS_ROWS) {
      return true;
    }
    if (y < 0) {
      return false;
    }
    return board[y][x] !== null;
  });
}

function withMovedPiece(
  state: TetrisRuntimeState,
  move: Partial<Pick<ActivePiece, 'x' | 'y' | 'rotation'>>
): TetrisRuntimeState {
  const piece: ActivePiece = {
    ...state.active,
    ...move
  };
  if (collides(state.board, piece)) {
    return state;
  }
  return {
    ...state,
    active: piece
  };
}

function withRotatedPiece(state: TetrisRuntimeState, delta: number): TetrisRuntimeState {
  const rotated: ActivePiece = {
    ...state.active,
    rotation: (state.active.rotation + delta + 4) % 4
  };

  if (!collides(state.board, rotated)) {
    return {
      ...state,
      active: rotated
    };
  }

  // Basic kick tests keep the game smooth enough for casual play.
  const kickX = [-1, 1, -2, 2];
  for (const dx of kickX) {
    const kicked = { ...rotated, x: rotated.x + dx };
    if (!collides(state.board, kicked)) {
      return {
        ...state,
        active: kicked
      };
    }
  }
  return state;
}

function clearLines(board: TetrisRuntimeState['board']) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = TETRIS_ROWS - remaining.length;
  while (remaining.length < TETRIS_ROWS) {
    remaining.unshift(Array<TetrominoType | null>(TETRIS_COLS).fill(null));
  }
  return { board: remaining, cleared };
}

function lineScore(cleared: number): number {
  if (cleared === 1) {
    return 100;
  }
  if (cleared === 2) {
    return 300;
  }
  if (cleared === 3) {
    return 500;
  }
  if (cleared >= 4) {
    return 800;
  }
  return 0;
}

function spawnNextAfterLock(state: TetrisRuntimeState, randomValue: () => number): TetrisRuntimeState {
  const queue = withQueue(state.queue, randomValue);
  const [next, ...rest] = queue;
  const active = spawnPiece(next ?? 'T');
  const nextState: TetrisRuntimeState = {
    ...state,
    active,
    queue: rest,
    canHold: true
  };
  if (collides(nextState.board, active)) {
    return {
      ...nextState,
      gameOver: true
    };
  }
  return nextState;
}

function lockPiece(state: TetrisRuntimeState, randomValue: () => number): TetrisRuntimeState {
  const board = state.board.map((row) => [...row]);
  let toppedOut = false;
  cellsForPiece(state.active).forEach(([cx, cy]) => {
    const x = state.active.x + cx;
    const y = state.active.y + cy;
    if (y < 0) {
      toppedOut = true;
      return;
    }
    if (y < TETRIS_ROWS && x >= 0 && x < TETRIS_COLS) {
      board[y][x] = state.active.type;
    }
  });

  if (toppedOut) {
    return {
      ...state,
      board,
      gameOver: true
    };
  }

  const { board: clearedBoard, cleared } = clearLines(board);
  const lines = state.lines + cleared;
  const level = START_LEVEL + Math.floor(lines / 10);
  const score = state.score + lineScore(cleared) * state.level;

  return spawnNextAfterLock(
    {
      ...state,
      board: clearedBoard,
      score,
      lines,
      level
    },
    randomValue
  );
}

export function createInitialTetrisState(randomValue: () => number = Math.random): TetrisRuntimeState {
  const queued = withQueue([], randomValue);
  const { active, queue } = firstActiveFromQueue(queued);
  return {
    board: createEmptyBoard(),
    active,
    queue,
    hold: null,
    canHold: true,
    score: 0,
    level: START_LEVEL,
    lines: 0,
    gameOver: false
  };
}

export function canUseHold(state: TetrisRuntimeState): boolean {
  return state.canHold && !state.gameOver;
}

export function reduceTetrisState(
  state: TetrisRuntimeState,
  action: TetrisRuleAction,
  randomValue: () => number = Math.random
): TetrisRuntimeState {
  if (state.gameOver) {
    return state;
  }

  if (action.type === 'moveLeft') {
    return withMovedPiece(state, { x: state.active.x - 1 });
  }
  if (action.type === 'moveRight') {
    return withMovedPiece(state, { x: state.active.x + 1 });
  }
  if (action.type === 'rotateRight') {
    return withRotatedPiece(state, 1);
  }
  if (action.type === 'rotateLeft') {
    return withRotatedPiece(state, -1);
  }
  if (action.type === 'hardDrop') {
    let dropped = state;
    while (true) {
      const next = withMovedPiece(dropped, { y: dropped.active.y + 1 });
      if (next === dropped) {
        return lockPiece(dropped, randomValue);
      }
      dropped = next;
    }
  }
  if (action.type === 'softDrop' || action.type === 'tick') {
    const moved = withMovedPiece(state, { y: state.active.y + 1 });
    if (moved === state) {
      return lockPiece(state, randomValue);
    }
    return moved;
  }
  if (action.type === 'hold') {
    if (!state.canHold) {
      return state;
    }

    if (state.hold === null) {
      const nextState = spawnNextAfterLock(
        {
          ...state,
          hold: state.active.type,
          canHold: false
        },
        randomValue
      );
      return {
        ...nextState,
        canHold: false
      };
    }

    const swapped = spawnPiece(state.hold);
    if (collides(state.board, swapped)) {
      return {
        ...state,
        gameOver: true
      };
    }

    return {
      ...state,
      hold: state.active.type,
      active: swapped,
      canHold: false
    };
  }

  return state;
}
