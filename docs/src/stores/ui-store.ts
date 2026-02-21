import { create } from 'zustand';
import { readStorage, writeStorage } from '../shared/storage';
import type { ThemeMode } from '../theme/tokens';

const THEME_STORAGE_KEY = 'gamehub.theme.mode';

function loadInitialThemeMode(): ThemeMode {
  const stored = readStorage(THEME_STORAGE_KEY);
  if (stored === 'day' || stored === 'night' || stored === 'system') {
    return stored;
  }
  return 'system';
}

type UiState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useUiStore = create<UiState>((set) => ({
  themeMode: loadInitialThemeMode(),
  setThemeMode: (mode) => {
    writeStorage(THEME_STORAGE_KEY, mode);
    set({ themeMode: mode });
  }
}));
