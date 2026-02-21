import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { GameHost } from '../../game-core/game-host';
import type { GameOutgoingEvent } from '../../game-core/events';
import { useGameSessionStore } from '../../stores/game-session-store';
import { useTheme } from '../../theme/theme-provider';
import { useUiStore } from '../../stores/ui-store';
import { Button } from '../../ui/button';
import { Drawer } from '../../ui/drawer';
import { GameOverlay } from './game-overlay';
import { TetrisSettingsModal } from '../../games/tetris/tetris-settings-modal';

export function GamePage() {
  const { gameId = 'unknown' } = useParams();
  const [tetrisSettingsOpen, setTetrisSettingsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const score = useGameSessionStore((state) => state.score);
  const status = useGameSessionStore((state) => state.status);
  const setActiveGame = useGameSessionStore((state) => state.setActiveGame);
  const setScore = useGameSessionStore((state) => state.setScore);
  const setStatus = useGameSessionStore((state) => state.setStatus);
  const infoDrawerOpen = useUiStore((state) => state.isInfoDrawerOpen);
  const setInfoDrawerOpen = useUiStore((state) => state.setInfoDrawerOpen);

  useEffect(() => {
    setActiveGame(gameId);
  }, [gameId, setActiveGame]);

  const onEvent = useCallback(
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
      <div className="game-page-head">
        <h1>{gameId}</h1>
        <div className="game-page-actions">
          <span>状态：{status}</span>
          <span>分数：{score}</span>
          {gameId === 'tetris' ? (
            <Button onClick={() => setTetrisSettingsOpen(true)}>键位设置</Button>
          ) : null}
          <Button onClick={() => setInfoDrawerOpen(!infoDrawerOpen)}>
            {infoDrawerOpen ? '收起信息' : '展开信息'}
          </Button>
          <Link to="/">返回菜单</Link>
        </div>
      </div>
      <div className="game-host-wrap">
        <GameHost gameId={gameId} theme={resolvedTheme} onEvent={onEvent} />
        <GameOverlay status={status} />
      </div>
      <Drawer open={infoDrawerOpen} title="游戏信息" onClose={() => setInfoDrawerOpen(false)}>
        <p>当前游戏：{gameId}</p>
        <p>当前状态：{status}</p>
        <p>当前分数：{score}</p>
      </Drawer>
      {gameId === 'tetris' ? (
        <TetrisSettingsModal open={tetrisSettingsOpen} onClose={() => setTetrisSettingsOpen(false)} />
      ) : null}
    </section>
  );
}
