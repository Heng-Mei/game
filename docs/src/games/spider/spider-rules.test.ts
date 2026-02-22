import { describe, expect, it } from 'vitest';
import {
  SPIDER_CLASSIC_CONFIG,
  SPIDER_RULES,
  createSpiderState,
  difficultyLabel,
  resolveCompletedRuns
} from './spider-rules';

describe('spider-rules', () => {
  it('keeps classic deck and column config', () => {
    expect(SPIDER_CLASSIC_CONFIG.deckCount).toBe(2);
    expect(SPIDER_CLASSIC_CONFIG.columns).toBe(10);
    expect(SPIDER_CLASSIC_CONFIG.completeSequenceLength).toBe(13);
  });

  it('supports classic same-suit sequence and deal rules', () => {
    expect(SPIDER_RULES.requiresSameSuitSequence).toBe(true);
    expect(SPIDER_RULES.allowsDealWhenEachColumnHasCard).toBe(true);
  });

  it('returns localized difficulty label', () => {
    expect(difficultyLabel(1)).toBe('单花色');
    expect(difficultyLabel(2)).toBe('双花色');
    expect(difficultyLabel(4)).toBe('四花色');
  });

  it('moves complete descending K-A run to foundation', () => {
    let state = createSpiderState(1);
    const run = Array.from({ length: 13 }, (_, index) => ({
      suit: 'S' as const,
      rank: 13 - index,
      faceUp: true
    }));
    state = {
      ...state,
      tableau: [run, ...state.tableau.slice(1)],
      foundations: []
    };

    const next = resolveCompletedRuns(state);
    expect(next.foundations).toHaveLength(1);
  });
});
