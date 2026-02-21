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

export function createEmptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
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
