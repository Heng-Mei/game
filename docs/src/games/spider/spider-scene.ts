import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { difficultyLabel, type SpiderDifficulty } from './spider-rules';
import { getCardSuitTheme } from '../cards/card-theme';

export class SpiderScene extends BaseScene {
  private readonly theme: 'day' | 'night';

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('spider-scene', 'spider', emitEvent);
    this.theme = theme;
  }

  create() {
    const mode: SpiderDifficulty = 1;
    const suits = getCardSuitTheme(this.theme);

    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0f1b18' : '#f4fbf8');
    this.add.text(24, 24, `Spider Phaser 场景（${difficultyLabel(mode)}）`, {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '22px'
    });
    this.add.text(24, 60, `花色预览 ${suits.spade.symbol}${suits.heart.symbol}${suits.club.symbol}${suits.diamond.symbol}`, {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '16px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'spider' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'spider', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'spider', score: 0 });
  }
}
