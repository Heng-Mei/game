export type SpiderDifficulty = 1 | 2 | 4;

export const SPIDER_CLASSIC_CONFIG = {
  deckCount: 2,
  columns: 10,
  completeSequenceLength: 13
};

export const SPIDER_RULES = {
  requiresSameSuitSequence: true,
  allowsDealWhenEachColumnHasCard: true,
  supportsDifficultyCycle: true
};

export function difficultyLabel(value: SpiderDifficulty): string {
  if (value === 1) {
    return '单花色';
  }
  if (value === 2) {
    return '双花色';
  }
  return '四花色';
}
