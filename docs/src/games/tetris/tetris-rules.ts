export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export const START_LEVEL = 1;

export const TETROMINO_SEQUENCE: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export type TetrisRuntimeState = {
  score: number;
  level: number;
  lines: number;
  hold: TetrominoType | null;
};

export function createInitialTetrisState(): TetrisRuntimeState {
  return {
    score: 0,
    level: START_LEVEL,
    lines: 0,
    hold: null
  };
}

export function canUseHold(state: TetrisRuntimeState): boolean {
  return state.hold === null || state.level >= 1;
}
