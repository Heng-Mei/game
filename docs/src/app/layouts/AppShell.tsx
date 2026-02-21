import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <strong className="brand">GameHub</strong>
        <span className="badge">React + TypeScript + Phaser</span>
      </header>
      {children}
    </main>
  );
}
