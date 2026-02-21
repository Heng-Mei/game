import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';

export class FlappyScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('flappy-scene', 'flappy', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#101629' : '#eef6ff');
    this.add.text(24, 24, 'Flappy Phaser 场景', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 56, 'primary tap / click / space to fly', {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'flappy' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'flappy', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'flappy', score: 0 });

    this.input.on('pointerdown', () => {});
  }
}
