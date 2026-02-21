import { describe, expect, it } from 'vitest';
import { START_LEVEL, canUseHold, createInitialTetrisState } from './tetris-rules';

describe('tetris-rules', () => {
  it('starts at level 1 with empty hold', () => {
    const state = createInitialTetrisState();
    expect(START_LEVEL).toBe(1);
    expect(state.level).toBe(1);
    expect(state.hold).toBeNull();
  });

  it('allows hold in initial runtime', () => {
    const state = createInitialTetrisState();
    expect(canUseHold(state)).toBe(true);
  });

  it('blocks hold when below level threshold and hold already occupied', () => {
    expect(
      canUseHold({
        score: 0,
        lines: 0,
        level: 0,
        hold: 'T'
      })
    ).toBe(false);
  });
});
