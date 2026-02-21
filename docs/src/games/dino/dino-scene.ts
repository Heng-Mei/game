import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';

export class DinoScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('dino-scene', 'dino', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#1a1711' : '#fffaf1');
    this.add.text(24, 24, 'Dino Phaser 场景', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 56, 'primary tap / click / space to jump', {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'dino' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'dino', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'dino', score: 0 });

    this.input.on('pointerdown', () => {});
  }
}
