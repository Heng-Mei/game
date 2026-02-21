import { useUiStore } from '../../stores/ui-store';
import type { ThemeMode } from '../../theme/tokens';

const options: Array<{ label: string; value: ThemeMode }> = [
  { label: '跟随系统', value: 'system' },
  { label: '日间', value: 'day' },
  { label: '夜间', value: 'night' }
];

export function ThemeSwitcher() {
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  return (
    <div className="theme-switcher" role="group" aria-label="主题切换">
      {options.map((option) => {
        const active = option.value === themeMode;
        return (
          <button
            key={option.value}
            type="button"
            className="theme-chip"
            aria-pressed={active}
            onClick={() => setThemeMode(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
