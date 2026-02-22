import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { useGameSessionStore } from '../../stores/game-session-store';
import { useUiStore } from '../../stores/ui-store';
import { Button } from '../../ui/button';
import { Drawer } from '../../ui/drawer';
import { gameCatalog } from '../../shared/game-catalog';
import { useTheme } from '../../theme/theme-provider';
import { GameHost } from '../../platform/game-host';
import type { GameOutgoingEvent } from '../../game-core/events';
import { GameOverlay } from './game-overlay';

export function GamePage() {
  const { gameId = 'unknown' } = useParams();
  const { resolvedTheme } = useTheme();
  const setActiveGame = useGameSessionStore((state) => state.setActiveGame);
  const score = useGameSessionStore((state) => state.score);
  const status = useGameSessionStore((state) => state.status);
  const setScore = useGameSessionStore((state) => state.setScore);
  const setStatus = useGameSessionStore((state) => state.setStatus);
  const infoDrawerOpen = useUiStore((state) => state.isInfoDrawerOpen);
  const setInfoDrawerOpen = useUiStore((state) => state.setInfoDrawerOpen);
  const item = gameCatalog.find((game) => game.id === gameId);
  const title = item ? item.name : gameId;

  useEffect(() => {
    setActiveGame(gameId);
    setScore(0);
    setStatus('idle');
    setInfoDrawerOpen(false);
  }, [gameId, setActiveGame, setScore, setStatus, setInfoDrawerOpen]);

  const onGameEvent = useCallback(
    (event: GameOutgoingEvent) => {
      if (event.type === 'SCORE_CHANGED') {
        setScore(event.score);
      }
      if (event.type === 'GAME_STATE_CHANGED') {
        setStatus(event.state);
      }
    },
    [setScore, setStatus]
  );

  return (
    <section className="panel-card game-page">
      <div className="game-page-head" data-testid="game-hud">
        <h1>{title}</h1>
        <div className="game-page-actions">
          <Button onClick={() => setInfoDrawerOpen(!infoDrawerOpen)}>
            {infoDrawerOpen ? '收起信息' : '展开信息'}
          </Button>
          <span>分数 {score}</span>
          <Link to="/">返回菜单</Link>
        </div>
      </div>
      {item ? (
        <div className="game-host-wrap">
          <GameHost gameId={item.id} theme={resolvedTheme} onEvent={onGameEvent} />
          <GameOverlay status={status} />
        </div>
      ) : <p>未找到该游戏。</p>}
      <Drawer open={infoDrawerOpen} title="游戏信息" onClose={() => setInfoDrawerOpen(false)}>
        <p>{item ? item.summary : '请选择大厅中的游戏开始。'}</p>
        <p>支持桌面端与手机端游玩，可随时返回大厅切换游戏。</p>
      </Drawer>
    </section>
  );
}
