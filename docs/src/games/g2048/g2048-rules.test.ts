import { describe, expect, it } from 'vitest';
import { GAME_TARGET, SIZE, createEmptyGrid, mergeLine, spawnValue } from './g2048-rules';

describe('g2048-rules', () => {
  it('uses 4x4 grid', () => {
    const grid = createEmptyGrid();
    expect(SIZE).toBe(4);
    expect(grid).toHaveLength(4);
    expect(grid[0]).toHaveLength(4);
  });

  it('spawns 2 on 90% threshold', () => {
    expect(spawnValue(0.1)).toBe(2);
    expect(spawnValue(0.95)).toBe(4);
  });

  it('merges compacted line with score gain', () => {
    expect(mergeLine([2, 0, 2, 4])).toEqual({ merged: [4, 4, 0, 0], scoreGain: 4 });
    expect(mergeLine([2, 2, 2, 2])).toEqual({ merged: [4, 4, 0, 0], scoreGain: 8 });
  });

  it('keeps classic target tile', () => {
    expect(GAME_TARGET).toBe(2048);
  });
});
