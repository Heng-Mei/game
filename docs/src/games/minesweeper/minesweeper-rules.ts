export type MinesweeperDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export const MINESWEEPER_PRESETS = {
  BEGINNER: { width: 9, height: 9, mines: 10 },
  INTERMEDIATE: { width: 16, height: 16, mines: 40 },
  EXPERT: { width: 30, height: 16, mines: 99 }
} as const;

export type CellMark = 'none' | 'flag' | 'question';

export const MINESWEEPER_CLASSIC_RULES = {
  firstClickSafe: true,
  supportsQuestionMark: true,
  supportsQuickOpen: true,
  supportsChord: true
};
