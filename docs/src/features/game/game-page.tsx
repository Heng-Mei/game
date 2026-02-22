import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useGameSessionStore } from '../../stores/game-session-store';
import { useUiStore } from '../../stores/ui-store';
import { Button } from '../../ui/button';
import { Drawer } from '../../ui/drawer';
import { gameCatalog } from '../../shared/game-catalog';

const legacyGameMap: Record<string, string> = {
  tetris: 'tetris',
  snake: 'snake',
  minesweeper: 'minesweeper',
  spider: 'spider',
  flappy: 'flappy',
  dino: 'dino',
  g2048: 'game2048'
};

export function GamePage() {
  const { gameId = 'unknown' } = useParams();
  const setActiveGame = useGameSessionStore((state) => state.setActiveGame);
  const infoDrawerOpen = useUiStore((state) => state.isInfoDrawerOpen);
  const setInfoDrawerOpen = useUiStore((state) => state.setInfoDrawerOpen);
  const item = gameCatalog.find((game) => game.id === gameId);
  const title = item ? item.name : gameId;
  const legacyGame = legacyGameMap[gameId];

  useEffect(() => {
    setActiveGame(gameId);
    setInfoDrawerOpen(false);
  }, [gameId, setActiveGame, setInfoDrawerOpen]);

  return (
    <section className="panel-card game-page">
      <div className="game-page-head" data-testid="game-hud">
        <h1>{title}</h1>
        <div className="game-page-actions">
          <Button onClick={() => setInfoDrawerOpen(!infoDrawerOpen)}>
            {infoDrawerOpen ? '收起信息' : '展开信息'}
          </Button>
          <Link to="/">返回菜单</Link>
        </div>
      </div>
      {legacyGame ? (
        <iframe
          title={title}
          className="legacy-game-frame"
          src={`./legacy/index.html?game=${legacyGame}&embedded=1`}
        />
      ) : (
        <p>未找到该游戏。</p>
      )}
      <Drawer open={infoDrawerOpen} title="游戏信息" onClose={() => setInfoDrawerOpen(false)}>
        <p>{item ? item.summary : '请选择大厅中的游戏开始。'}</p>
        <p>支持桌面端与手机端游玩，可随时返回大厅切换游戏。</p>
      </Drawer>
    </section>
  );
}
