import { gameCatalog } from '../../shared/game-catalog';
import { GameCard } from './game-card';

export function MenuPage() {
  return (
    <section className="panel-card">
      <h1>小游戏大厅</h1>
      <p>统一主题与交互重构进行中，先提供新菜单骨架。</p>
      <div className="game-grid">
        {gameCatalog.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
