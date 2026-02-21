import type { PropsWithChildren } from 'react';
import { ThemeProvider, useTheme } from '../../theme/theme-provider';
import { ThemeSwitcher } from '../../features/settings/theme-switcher';

function AppShellContent({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();

  return (
    <main className="app-shell">
      <header className="topbar">
        <strong className="brand">GameHub</strong>
        <div className="topbar-right">
          <ThemeSwitcher />
          <span className="badge">{resolvedTheme === 'day' ? '日间主题' : '夜间主题'}</span>
        </div>
      </header>
      {children}
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
