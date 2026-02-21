import { createHashRouter } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';

function MenuPlaceholder() {
  return (
    <section className="panel-card">
      <h1>小游戏大厅</h1>
      <p>React + Phaser 重构进行中。下一步会迁移全部游戏与交互面板。</p>
    </section>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: (
      <AppShell>
        <MenuPlaceholder />
      </AppShell>
    )
  }
]);
