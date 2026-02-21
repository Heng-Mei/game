import { gameCatalog } from '../../shared/game-catalog';
import { GameCard } from './game-card';

export function MenuPage() {
  return (
    <section className="panel-card">
      <h1>小游戏大厅 · Arcade Hub</h1>
      <p>从下面挑一款开始，支持电脑与手机游玩。</p>
      <div className="game-grid">
        {gameCatalog.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
