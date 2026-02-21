import type { PropsWithChildren } from 'react';
import { ThemeProvider, useTheme } from '../../theme/theme-provider';
import { ThemeSwitcher } from '../../features/settings/theme-switcher';
import { useUiStore } from '../../stores/ui-store';
import { SettingsModal } from '../../features/settings/settings-modal';
import { Button } from '../../ui/button';

function AppShellContent({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen);

  return (
    <main className="app-shell">
      <header className="topbar">
        <strong className="brand">GameHub</strong>
        <div className="topbar-right">
          <ThemeSwitcher />
          <Button onClick={() => setSettingsOpen(true)}>设置</Button>
          <span className="badge">{resolvedTheme === 'day' ? '日间主题' : '夜间主题'}</span>
        </div>
      </header>
      {children}
      <SettingsModal />
    </main>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AppShellContent>{children}</AppShellContent>
    </ThemeProvider>
  );
}
