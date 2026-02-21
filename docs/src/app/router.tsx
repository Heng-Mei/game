import { Outlet, createHashRouter } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { GamePage } from '../features/game/game-page';
import { MenuPage } from '../features/menu/menu-page';

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
      { index: true, element: <MenuPage /> },
      { path: 'game/:gameId', element: <GamePage /> }
    ]
  }
]);
