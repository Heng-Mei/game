import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { useUiStore } from '../stores/ui-store';
import type { ResolvedTheme } from './tokens';

function resolveTheme(mode: 'system' | 'day' | 'night', systemIsDark: boolean): ResolvedTheme {
  if (mode === 'day' || mode === 'night') {
    return mode;
  }
  return systemIsDark ? 'night' : 'day';
}

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue>({ resolvedTheme: 'day' });

export function ThemeProvider({ children }: PropsWithChildren) {
  const themeMode = useUiStore((state) => state.themeMode);
  const [systemIsDark, setSystemIsDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemIsDark(event.matches);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = useMemo(
    () => resolveTheme(themeMode, systemIsDark),
    [themeMode, systemIsDark]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
