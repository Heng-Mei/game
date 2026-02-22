import type { GameId } from '../contracts/game-contracts';
import type { GameOutgoingEvent } from '../game-core/events';
import { BaseScene } from '../game-core/base-scene';
import { TetrisScene } from '../games/tetris/tetris-scene';
import { MinesweeperScene } from '../games/minesweeper/minesweeper-scene';
import { SpiderScene } from '../games/spider/spider-scene';
import { G2048Scene } from '../games/g2048/g2048-scene';
import { SnakeScene } from '../games/snake/snake-scene';
import { FlappyScene } from '../games/flappy/flappy-scene';
import { DinoScene } from '../games/dino/dino-scene';

type Theme = 'day' | 'night';

class PlaceholderScene extends BaseScene {
  private readonly theme: Theme;

  constructor(gameId: GameId, theme: Theme, emitEvent?: (event: GameOutgoingEvent) => void) {
    super(`placeholder-${gameId}`, gameId, emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0c111b' : '#eef3ff');
    this.add.text(24, 24, `${this.gameId}`, {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '24px'
    });
    this.dispatch({ type: 'GAME_READY', gameId: this.gameId });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: this.gameId, state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: this.gameId, score: 0 });
  }
}

export function createSceneForGame(
  gameId: GameId,
  theme: Theme,
  onEvent?: (event: GameOutgoingEvent) => void
): BaseScene {
  if (gameId === 'tetris') {
    return new TetrisScene(theme, onEvent);
  }
  if (gameId === 'minesweeper') {
    return new MinesweeperScene(theme, onEvent);
  }
  if (gameId === 'spider') {
    return new SpiderScene(theme, onEvent);
  }
  if (gameId === 'g2048') {
    return new G2048Scene(theme, onEvent);
  }
  if (gameId === 'snake') {
    return new SnakeScene(theme, onEvent);
  }
  if (gameId === 'flappy') {
    return new FlappyScene(theme, onEvent);
  }
  if (gameId === 'dino') {
    return new DinoScene(theme, onEvent);
  }
  return new PlaceholderScene(gameId, theme, onEvent);
}
