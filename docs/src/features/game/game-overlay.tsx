type GameOverlayProps = {
  status: 'idle' | 'running' | 'paused' | 'over';
};

export function GameOverlay({ status }: GameOverlayProps) {
  if (status === 'running') {
    return null;
  }

  return (
    <div className="game-overlay" role="status">
      <p>{status === 'paused' ? '已暂停' : status === 'over' ? '游戏结束' : '准备开始'}</p>
    </div>
  );
}
