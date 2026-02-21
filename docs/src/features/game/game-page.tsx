import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { GameHost } from '../../game-core/game-host';
import type { GameOutgoingEvent } from '../../game-core/events';
import { useGameSessionStore } from '../../stores/game-session-store';
import { useTheme } from '../../theme/theme-provider';

export function GamePage() {
  const { gameId = 'unknown' } = useParams();
  const { resolvedTheme } = useTheme();
  const score = useGameSessionStore((state) => state.score);
  const status = useGameSessionStore((state) => state.status);
  const setActiveGame = useGameSessionStore((state) => state.setActiveGame);
  const setScore = useGameSessionStore((state) => state.setScore);
  const setStatus = useGameSessionStore((state) => state.setStatus);

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
          <Link to="/">返回菜单</Link>
        </div>
      </div>
      <GameHost gameId={gameId} theme={resolvedTheme} onEvent={onEvent} />
    </section>
  );
}
