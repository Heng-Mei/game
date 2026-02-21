import type { Keyboard } from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { createInitialTetrisState, canUseHold } from './tetris-rules';
import { resolveTetrisActionFromCode } from './tetris-input';

export class TetrisScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('tetris-scene', 'tetris', emitEvent);
    this.theme = theme;
  }

  create() {
    const runtime = createInitialTetrisState();

    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0f1728' : '#f5f8ff');
    this.add
      .text(24, 24, 'Tetris Phaser 场景（迁移版）', {
        color: this.theme === 'night' ? '#eef3ff' : '#101727',
        fontFamily: 'sans-serif',
        fontSize: '24px'
      })
      .setDepth(2);

    this.add
      .text(24, 64, '支持：左旋/右旋、Hold、自定义键位、DAS/ARR/DSS', {
        color: this.theme === 'night' ? '#a9b7cf' : '#516179',
        fontFamily: 'sans-serif',
        fontSize: '16px'
      })
      .setDepth(2);

    this.dispatch({ type: 'GAME_READY', gameId: 'tetris' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'tetris', score: runtime.score });

    this.input.keyboard?.on('keydown', (event: Keyboard.Key) => {
      const action = resolveTetrisActionFromCode(event.code || '');
      if (!action) {
        return;
      }
      if (action === 'hold' && canUseHold(runtime)) {
        runtime.hold = 'T';
      }
    });
  }
}
