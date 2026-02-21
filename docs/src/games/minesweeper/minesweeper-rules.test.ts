import { describe, expect, it } from 'vitest';
import { MINESWEEPER_CLASSIC_RULES, MINESWEEPER_PRESETS } from './minesweeper-rules';

describe('minesweeper-rules', () => {
  it('provides Win7 classic presets', () => {
    expect(MINESWEEPER_PRESETS.BEGINNER).toEqual({ width: 9, height: 9, mines: 10 });
    expect(MINESWEEPER_PRESETS.INTERMEDIATE).toEqual({ width: 16, height: 16, mines: 40 });
    expect(MINESWEEPER_PRESETS.EXPERT).toEqual({ width: 30, height: 16, mines: 99 });
  });

  it('enables question, chord and first click safe', () => {
    expect(MINESWEEPER_CLASSIC_RULES.supportsQuestionMark).toBe(true);
    expect(MINESWEEPER_CLASSIC_RULES.supportsQuickOpen).toBe(true);
    expect(MINESWEEPER_CLASSIC_RULES.supportsChord).toBe(true);
    expect(MINESWEEPER_CLASSIC_RULES.firstClickSafe).toBe(true);
  });
});
