export const SIZE = 4;
export const SPAWN_TWO_CHANCE = 0.9;
export const GAME_TARGET = 2048;

export const ANIMATION_CONFIG = {
  slideMs: 90,
  popMs: 70,
  movingTiles: true,
  mergePops: true,
  spawnPop: true
};

export type Grid = number[][];
export type MoveDirection = 'left' | 'right' | 'up' | 'down';

export type Game2048State = {
  grid: Grid;
  score: number;
  won: boolean;
  over: boolean;
  lastMove: MoveDirection | null;
  animationMs: number;
};

export function createEmptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function fromRows(rows: number[][], score = 0): Game2048State {
  return {
    grid: rows.map((row) => [...row]),
    score,
    won: rows.some((row) => row.some((value) => value >= GAME_TARGET)),
    over: false,
    lastMove: null,
    animationMs: 0
  };
}

export function spawnValue(randomValue: number): number {
  return randomValue < SPAWN_TWO_CHANCE ? 2 : 4;
}

export function mergeLine(line: number[]): { merged: number[]; scoreGain: number } {
  const compact = line.filter((value) => value !== 0);
  const merged: number[] = [];
  let scoreGain = 0;

  for (let i = 0; i < compact.length; i += 1) {
    const current = compact[i];
    const next = compact[i + 1];
    if (next !== undefined && next === current) {
      const combine = current * 2;
      merged.push(combine);
      scoreGain += combine;
      i += 1;
    } else {
      merged.push(current);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  return { merged, scoreGain };
}

function lineForDirection(grid: Grid, direction: MoveDirection, index: number): number[] {
  if (direction === 'left') {
    return [...grid[index]];
  }
  if (direction === 'right') {
    return [...grid[index]].reverse();
  }
  if (direction === 'up') {
    return grid.map((row) => row[index]);
  }
  return grid.map((row) => row[index]).reverse();
}

function applyLine(grid: Grid, direction: MoveDirection, index: number, merged: number[]) {
  if (direction === 'left') {
    grid[index] = [...merged];
    return;
  }
  if (direction === 'right') {
    grid[index] = [...merged].reverse();
    return;
  }
  if (direction === 'up') {
    for (let row = 0; row < SIZE; row += 1) {
      grid[row][index] = merged[row];
    }
    return;
  }
  const reversed = [...merged].reverse();
  for (let row = 0; row < SIZE; row += 1) {
    grid[row][index] = reversed[row];
  }
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (a[y][x] !== b[y][x]) {
        return false;
      }
    }
  }
  return true;
}

function addRandomTile(grid: Grid, randomValue: () => number): Grid {
  const empties: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (grid[y][x] === 0) {
        empties.push({ x, y });
      }
    }
  }
  if (!empties.length) {
    return grid;
  }
  const slot = empties[Math.floor(randomValue() * empties.length)];
  const next = grid.map((row) => [...row]);
  next[slot.y][slot.x] = spawnValue(randomValue());
  return next;
}

function hasMoves(grid: Grid): boolean {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const value = grid[y][x];
      if (value === 0) {
        return true;
      }
      if (x + 1 < SIZE && grid[y][x + 1] === value) {
        return true;
      }
      if (y + 1 < SIZE && grid[y + 1][x] === value) {
        return true;
      }
    }
  }
  return false;
}

export function moveGrid(
  state: Game2048State,
  direction: MoveDirection,
  randomValue: () => number = Math.random
): Game2048State {
  const original = state.grid.map((row) => [...row]);
  const nextGrid = state.grid.map((row) => [...row]);
  let scoreGain = 0;
  for (let i = 0; i < SIZE; i += 1) {
    const line = lineForDirection(original, direction, i);
    const merged = mergeLine(line);
    scoreGain += merged.scoreGain;
    applyLine(nextGrid, direction, i, merged.merged);
  }

  if (gridsEqual(original, nextGrid)) {
    return state;
  }

  const withSpawn = addRandomTile(nextGrid, randomValue);
  const won = withSpawn.some((row) => row.some((value) => value >= GAME_TARGET));
  return {
    grid: withSpawn,
    score: state.score + scoreGain,
    won,
    over: !hasMoves(withSpawn),
    lastMove: direction,
    animationMs: ANIMATION_CONFIG.slideMs
  };
}

export function createInitial2048State(randomValue: () => number = Math.random): Game2048State {
  const empty = createEmptyGrid();
  const one = addRandomTile(empty, randomValue);
  const two = addRandomTile(one, randomValue);
  return {
    grid: two,
    score: 0,
    won: false,
    over: false,
    lastMove: null,
    animationMs: 0
  };
}
