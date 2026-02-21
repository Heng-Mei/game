import Phaser from 'phaser';
import { BaseScene } from './base-scene';
import type { GameIncomingEvent, GameOutgoingEvent } from './events';
import { TetrisScene } from '../games/tetris/tetris-scene';
import { MinesweeperScene } from '../games/minesweeper/minesweeper-scene';
import { SpiderScene } from '../games/spider/spider-scene';
import { G2048Scene } from '../games/g2048/g2048-scene';
import { SnakeScene } from '../games/snake/snake-scene';
import { FlappyScene } from '../games/flappy/flappy-scene';
import { DinoScene } from '../games/dino/dino-scene';

class PlaceholderScene extends BaseScene {
  private theme: 'day' | 'night';

  constructor(gameId: string, theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super(`placeholder-${gameId}`, gameId, emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0c111b' : '#eef3ff');
    this.add
      .text(24, 24, `${this.gameId} 正在迁移到 Phaser`, {
        color: this.theme === 'night' ? '#eef3ff' : '#101727',
        fontFamily: 'sans-serif',
        fontSize: '24px'
      })
      .setDepth(2);

    this.dispatch({ type: 'GAME_READY', gameId: this.gameId });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: this.gameId, state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: this.gameId, score: 0 });
  }
}

type BridgeMountOptions = {
  parent: HTMLElement;
  gameId: string;
  theme: 'day' | 'night';
  onEvent?: (event: GameOutgoingEvent) => void;
};

function createSceneForGame(
  gameId: string,
  theme: 'day' | 'night',
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

export class PhaserBridge {
  private game: Phaser.Game | null = null;
  private parent: HTMLElement | null = null;

  mount(options: BridgeMountOptions): void {
    this.parent = options.parent;
    this.destroy();
    options.parent.innerHTML = '';

    const scene = createSceneForGame(options.gameId, options.theme, options.onEvent);
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: options.parent,
      width: 900,
      height: 600,
      backgroundColor: options.theme === 'night' ? '#0c111b' : '#eef3ff',
      scene: [scene],
      fps: {
        target: 60,
        forceSetTimeOut: true
      }
    });
  }

  send(event: GameIncomingEvent): void {
    if (!this.game) {
      return;
    }

    if (event.type === 'RESTART') {
      this.game.scene.scenes[0]?.scene.restart();
    }
  }

  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    if (this.parent) {
      this.parent.innerHTML = '';
    }
  }
}
