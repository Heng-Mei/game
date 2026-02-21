import { create } from 'zustand';
import { defaultTetrisKeybinds, type TetrisAction, type TetrisKeybinds } from '../games/tetris/tetris-input';

type TetrisSettingsState = {
  keybinds: TetrisKeybinds;
  dasFrames: number;
  arrFrames: number;
  dssFrames: number;
  setKeybind: (action: TetrisAction, code: string) => void;
  setDasFrames: (value: number) => void;
  setArrFrames: (value: number) => void;
  setDssFrames: (value: number) => void;
  reset: () => void;
};

const defaultSettings = {
  keybinds: defaultTetrisKeybinds,
  dasFrames: 10,
  arrFrames: 2,
  dssFrames: 1
};

export const useTetrisSettingsStore = create<TetrisSettingsState>((set) => ({
  ...defaultSettings,
  setKeybind: (action, code) =>
    set((state) => ({
      keybinds: {
        ...state.keybinds,
        [action]: code
      }
    })),
  setDasFrames: (value) => set({ dasFrames: value }),
  setArrFrames: (value) => set({ arrFrames: value }),
  setDssFrames: (value) => set({ dssFrames: value }),
  reset: () => set(defaultSettings)
}));
