export type MinesweeperDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export const MINESWEEPER_PRESETS = {
  BEGINNER: { width: 9, height: 9, mines: 10 },
  INTERMEDIATE: { width: 16, height: 16, mines: 40 },
  EXPERT: { width: 30, height: 16, mines: 99 }
} as const;

export type CellMark = 'none' | 'flag' | 'question';
export type GameStatus = 'ready' | 'running' | 'won' | 'lost';

export type CellState = {
  mine: boolean;
  revealed: boolean;
  mark: CellMark;
  adjacent: number;
};

export type MinesweeperState = {
  width: number;
  height: number;
  mines: number;
  board: CellState[][];
  status: GameStatus;
  revealedCount: number;
  flagCount: number;
  minesPlaced: boolean;
};

export type Point = { x: number; y: number };

export const MINESWEEPER_CLASSIC_RULES = {
  firstClickSafe: true,
  supportsQuestionMark: true,
  supportsQuickOpen: true,
  supportsChord: true
};

function createCell(): CellState {
  return {
    mine: false,
    revealed: false,
    mark: 'none',
    adjacent: 0
  };
}

function cloneBoard(board: CellState[][]): CellState[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function neighbors(width: number, height: number, x: number, y: number): Point[] {
  const out: Point[] = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue;
      }
      out.push({ x: nx, y: ny });
    }
  }
  return out;
}

function recalcAdjacent(board: CellState[][], width: number, height: number): CellState[][] {
  const next = cloneBoard(board);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (next[y][x].mine) {
        next[y][x].adjacent = 0;
        continue;
      }
      next[y][x].adjacent = neighbors(width, height, x, y).reduce((count, p) => {
        return count + (next[p.y][p.x].mine ? 1 : 0);
      }, 0);
    }
  }
  return next;
}

function asStateWithBoard(state: MinesweeperState, board: CellState[][]): MinesweeperState {
  let revealedCount = 0;
  let flagCount = 0;
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      if (board[y][x].revealed) {
        revealedCount += 1;
      }
      if (board[y][x].mark === 'flag') {
        flagCount += 1;
      }
    }
  }
  return {
    ...state,
    board,
    revealedCount,
    flagCount
  };
}

function checkWin(state: MinesweeperState): MinesweeperState {
  const safeCells = state.width * state.height - state.mines;
  if (state.revealedCount >= safeCells) {
    return {
      ...state,
      status: 'won'
    };
  }
  return state;
}

function revealFlood(board: CellState[][], width: number, height: number, x: number, y: number) {
  const queue: Point[] = [{ x, y }];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) {
      continue;
    }
    const key = `${curr.x},${curr.y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    const cell = board[curr.y][curr.x];
    if (cell.revealed || cell.mark === 'flag') {
      continue;
    }
    cell.revealed = true;
    if (cell.adjacent !== 0 || cell.mine) {
      continue;
    }
    neighbors(width, height, curr.x, curr.y).forEach((point) => queue.push(point));
  }
}

function placeRandomMines(
  state: MinesweeperState,
  safeX: number,
  safeY: number,
  randomValue: () => number = Math.random
): MinesweeperState {
  const board = cloneBoard(state.board);
  const slots: Point[] = [];
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      if (x === safeX && y === safeY) {
        continue;
      }
      slots.push({ x, y });
    }
  }
  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomValue() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  for (let i = 0; i < state.mines && i < slots.length; i += 1) {
    const mine = slots[i];
    board[mine.y][mine.x].mine = true;
  }
  return {
    ...asStateWithBoard(state, recalcAdjacent(board, state.width, state.height)),
    minesPlaced: true
  };
}

function revealUnsafe(state: MinesweeperState, x: number, y: number): MinesweeperState {
  const board = cloneBoard(state.board);
  const target = board[y][x];
  if (target.revealed || target.mark === 'flag') {
    return state;
  }

  if (target.mine) {
    target.revealed = true;
    return {
      ...asStateWithBoard(state, board),
      status: 'lost'
    };
  }

  revealFlood(board, state.width, state.height, x, y);
  return checkWin({
    ...asStateWithBoard(state, board),
    status: state.status === 'ready' ? 'running' : state.status
  });
}

export function createMinesweeperState(difficulty: MinesweeperDifficulty): MinesweeperState {
  const preset = MINESWEEPER_PRESETS[difficulty];
  return {
    width: preset.width,
    height: preset.height,
    mines: preset.mines,
    board: Array.from({ length: preset.height }, () => Array.from({ length: preset.width }, () => createCell())),
    status: 'ready',
    revealedCount: 0,
    flagCount: 0,
    minesPlaced: false
  };
}

export function setMineMap(state: MinesweeperState, mines: Point[]): MinesweeperState {
  const board = cloneBoard(state.board);
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      board[y][x].mine = false;
      board[y][x].revealed = false;
      board[y][x].mark = 'none';
      board[y][x].adjacent = 0;
    }
  }
  mines.forEach((mine) => {
    if (mine.x >= 0 && mine.x < state.width && mine.y >= 0 && mine.y < state.height) {
      board[mine.y][mine.x].mine = true;
    }
  });
  return {
    ...asStateWithBoard(state, recalcAdjacent(board, state.width, state.height)),
    minesPlaced: true,
    status: 'running'
  };
}

export function revealCell(state: MinesweeperState, x: number, y: number): MinesweeperState {
  if (state.status === 'lost' || state.status === 'won') {
    return state;
  }
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return state;
  }
  const prepared = state.minesPlaced ? state : placeRandomMines(state, x, y);
  return revealUnsafe(prepared, x, y);
}

export function toggleMark(state: MinesweeperState, x: number, y: number): MinesweeperState {
  if (state.status === 'lost' || state.status === 'won') {
    return state;
  }
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return state;
  }
  const board = cloneBoard(state.board);
  const cell = board[y][x];
  if (cell.revealed) {
    return state;
  }
  if (cell.mark === 'none') {
    cell.mark = 'flag';
  } else if (cell.mark === 'flag') {
    cell.mark = 'question';
  } else {
    cell.mark = 'none';
  }
  return asStateWithBoard(state, board);
}

export function chordCell(state: MinesweeperState, x: number, y: number): MinesweeperState {
  if (state.status === 'lost' || state.status === 'won') {
    return state;
  }
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return state;
  }
  const cell = state.board[y][x];
  if (!cell.revealed || cell.adjacent === 0) {
    return state;
  }
  const around = neighbors(state.width, state.height, x, y);
  const flagCount = around.reduce((count, p) => count + (state.board[p.y][p.x].mark === 'flag' ? 1 : 0), 0);
  if (flagCount !== cell.adjacent) {
    return state;
  }
  return around.reduce((acc, point) => {
    if (acc.board[point.y][point.x].mark === 'flag') {
      return acc;
    }
    return revealUnsafe(acc, point.x, point.y);
  }, state);
}
