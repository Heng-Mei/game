import { Link, Outlet, createHashRouter } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { GamePage } from '../features/game/game-page';

const games = [
  { id: 'tetris', name: '俄罗斯方块' },
  { id: 'snake', name: '贪吃蛇' },
  { id: 'minesweeper', name: '扫雷' },
  { id: 'spider', name: '蜘蛛纸牌' },
  { id: 'flappy', name: 'Flappy Bird' },
  { id: 'dino', name: '小恐龙' },
  { id: 'g2048', name: '2048' }
];

function MenuPlaceholder() {
  return (
    <section className="panel-card">
      <h1>小游戏大厅</h1>
      <p>React + Phaser 重构进行中，先用统一路由承载所有游戏入口。</p>
      <div className="menu-grid">
        {games.map((game) => (
          <Link key={game.id} className="menu-link" to={`/game/${game.id}`}>
            {game.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <MenuPlaceholder /> },
      { path: 'game/:gameId', element: <GamePage /> }
    ]
  }
]);
