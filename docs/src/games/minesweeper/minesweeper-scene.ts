import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { MINESWEEPER_PRESETS } from './minesweeper-rules';

export class MinesweeperScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('minesweeper-scene', 'minesweeper', emitEvent);
    this.theme = theme;
  }

  create() {
    const beginner = MINESWEEPER_PRESETS.BEGINNER;
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#101827' : '#f8fbff');
    this.add.text(24, 24, 'Minesweeper Phaser 场景（经典规则迁移）', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 60, `默认难度 BEGINNER ${beginner.width}x${beginner.height} 雷数 ${beginner.mines}`, {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'minesweeper' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'minesweeper', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'minesweeper', score: 0 });
  }
}
