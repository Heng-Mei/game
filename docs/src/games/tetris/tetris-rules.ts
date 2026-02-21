export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

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
    level: 1,
    lines: 0,
    hold: null
  };
}

export function canUseHold(state: TetrisRuntimeState): boolean {
  return state.hold === null || state.level >= 1;
}
