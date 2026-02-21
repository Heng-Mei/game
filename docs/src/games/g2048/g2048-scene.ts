import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { ANIMATION_CONFIG, createEmptyGrid, spawnValue } from './g2048-rules';

export class G2048Scene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('g2048-scene', 'g2048', emitEvent);
    this.theme = theme;
  }

  create() {
    const grid = createEmptyGrid();
    grid[0][0] = spawnValue(Math.random());

    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#111726' : '#f7f8fc');
    this.add.text(24, 24, '2048 Phaser 场景（含 slide / pop 动画参数）', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 58, `ArrowLeft ArrowRight ArrowUp ArrowDown + swipe touch threshold`, {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });
    this.add.text(24, 84, `animation ${ANIMATION_CONFIG.slideMs}/${ANIMATION_CONFIG.popMs}`, {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'g2048' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'g2048', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'g2048', score: 0 });

    this.input.keyboard?.on('keydown-LEFT', () => {});
    this.input.keyboard?.on('keydown-RIGHT', () => {});
    this.input.keyboard?.on('keydown-UP', () => {});
    this.input.keyboard?.on('keydown-DOWN', () => {});
  }
}
