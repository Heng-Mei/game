import { Link } from 'react-router-dom';
import type { GameCatalogItem } from '../../shared/game-catalog';
import { Card } from '../../ui/card';

type GameCardProps = {
  game: GameCatalogItem;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="game-card">
      <h3>{game.name}</h3>
      <p>{game.summary}</p>
      <Link to={`/game/${game.id}`}>开始游戏</Link>
    </Card>
  );
}
