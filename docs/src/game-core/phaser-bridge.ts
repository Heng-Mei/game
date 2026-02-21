import Phaser from 'phaser';
import { BaseScene } from './base-scene';
import type { GameIncomingEvent, GameOutgoingEvent } from './events';

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

export class PhaserBridge {
  private game: Phaser.Game | null = null;

  mount(options: BridgeMountOptions): void {
    this.destroy();

    const scene = new PlaceholderScene(options.gameId, options.theme, options.onEvent);
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
    if (!this.game) {
      return;
    }
    this.game.destroy(true);
    this.game = null;
  }
}
