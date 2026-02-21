export type TetrisAction =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateRight'
  | 'rotateLeft'
  | 'hold'
  | 'pause';

export type TetrisKeybinds = Record<TetrisAction, string>;

export const defaultTetrisKeybinds: TetrisKeybinds = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: 'Space',
  rotateRight: 'ArrowUp',
  rotateLeft: 'KeyZ',
  hold: 'ShiftLeft',
  pause: 'KeyP'
};

export function resolveTetrisActionFromCode(
  code: string,
  keybinds: TetrisKeybinds = defaultTetrisKeybinds
): TetrisAction | null {
  const found = Object.entries(keybinds).find(([, value]) => value === code);
  return found ? (found[0] as TetrisAction) : null;
}
