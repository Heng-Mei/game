import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';

export class SnakeScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('snake-scene', 'snake', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0e1a14' : '#f5fbf6');
    this.add.text(24, 24, 'Snake Phaser 场景', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 56, 'direction move: ArrowUp ArrowDown ArrowLeft ArrowRight', {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'snake' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'snake', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'snake', score: 0 });
  }
}
