import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { FLAPPY_VIEW, createFlappyState, flap, stepFlappy, type FlappyState } from './flappy-rules';

export class FlappyScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private state: FlappyState = createFlappyState();
  private graphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('flappy-scene', 'flappy', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#101629' : '#eef6ff');
    this.graphics = this.add.graphics();
    this.infoText = this.add.text(24, 24, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'flappy' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'flappy', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'flappy', score: this.state.score });

    this.input.on('pointerdown', () => {
      if (this.state.gameOver) {
        this.restart();
        return;
      }
      this.state = flap(this.state);
    });
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        if (this.state.gameOver) {
          this.restart();
          return;
        }
        this.state = flap(this.state);
      }
      if (event.code === 'KeyR') {
        this.restart();
      }
    });

    this.render();
  }

  private restart() {
    this.state = createFlappyState();
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'flappy', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'flappy', score: this.state.score });
    this.render();
  }

  update(_time: number, delta: number): void {
    const prev = this.state;
    this.state = stepFlappy(this.state, delta);
    if (this.state.score !== prev.score) {
      this.dispatch({ type: 'SCORE_CHANGED', gameId: 'flappy', score: this.state.score });
    }
    if (this.state.gameOver && !prev.gameOver) {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'flappy', state: 'over' });
    }
    this.render();
  }

  private render() {
    this.graphics.clear();
    this.graphics.fillStyle(this.theme === 'night' ? 0x1b2640 : 0xdcefff, 1);
    this.graphics.fillRect(0, 0, FLAPPY_VIEW.width, FLAPPY_VIEW.height);

    this.graphics.fillStyle(this.theme === 'night' ? 0x2f3a54 : 0x6dbf63, 1);
    this.graphics.fillRect(0, FLAPPY_VIEW.floorY, FLAPPY_VIEW.width, FLAPPY_VIEW.height - FLAPPY_VIEW.floorY);

    this.state.pipes.forEach((pipe) => {
      const topHeight = pipe.gapY - pipe.gapSize / 2;
      const bottomY = pipe.gapY + pipe.gapSize / 2;
      this.graphics.fillStyle(this.theme === 'night' ? 0x4ca56b : 0x3e9f5c, 1);
      this.graphics.fillRect(pipe.x, 0, pipe.width, topHeight);
      this.graphics.fillRect(pipe.x, bottomY, pipe.width, FLAPPY_VIEW.height - bottomY);
    });

    this.graphics.fillStyle(0xffde59, 1);
    this.graphics.fillCircle(FLAPPY_VIEW.birdX, this.state.birdY, FLAPPY_VIEW.birdRadius);
    this.graphics.fillStyle(0x2a2a2a, 1);
    this.graphics.fillCircle(FLAPPY_VIEW.birdX + 5, this.state.birdY - 4, 2);

    const status = this.state.gameOver ? '结束，点击重开' : '点击屏幕起飞';
    this.infoText.setText(`Flappy 分数 ${this.state.score} | ${status}`);
  }
}
