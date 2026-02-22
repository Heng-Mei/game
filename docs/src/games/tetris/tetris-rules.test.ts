import { describe, expect, it } from 'vitest';
import {
  START_LEVEL,
  canUseHold,
  createInitialTetrisState,
  reduceTetrisState
} from './tetris-rules';

describe('tetris-rules', () => {
  it('starts at level 1 with empty hold and first active piece', () => {
    const state = createInitialTetrisState();
    expect(START_LEVEL).toBe(1);
    expect(state.level).toBe(1);
    expect(state.hold).toBeNull();
    expect(state.active).toBeTruthy();
  });

  it('supports hold only once per lock cycle', () => {
    const state = createInitialTetrisState();
    const afterFirstHold = reduceTetrisState(state, { type: 'hold' });
    const afterSecondHold = reduceTetrisState(afterFirstHold, { type: 'hold' });

    expect(canUseHold(state)).toBe(true);
    expect(canUseHold(afterFirstHold)).toBe(false);
    expect(afterSecondHold).toEqual(afterFirstHold);
  });
});
