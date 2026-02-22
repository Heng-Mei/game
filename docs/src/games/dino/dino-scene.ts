import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { DINO_VIEW, createDinoState, jump, stepDino, type DinoState } from './dino-rules';

export class DinoScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private state: DinoState = createDinoState();
  private graphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('dino-scene', 'dino', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#1a1711' : '#fffaf1');
    this.graphics = this.add.graphics();
    this.infoText = this.add.text(24, 24, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'dino' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'dino', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'dino', score: this.state.score });

    this.input.on('pointerdown', () => {
      if (this.state.gameOver) {
        this.restart();
        return;
      }
      this.state = jump(this.state);
    });
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (this.state.gameOver) {
          this.restart();
          return;
        }
        this.state = jump(this.state);
      }
      if (event.code === 'KeyR') {
        this.restart();
      }
    });

    this.render();
  }

  private restart() {
    this.state = createDinoState();
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'dino', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'dino', score: 0 });
    this.render();
  }

  update(_time: number, delta: number): void {
    const prev = this.state;
    this.state = stepDino(this.state, delta);
    if (this.state.score !== prev.score) {
      this.dispatch({ type: 'SCORE_CHANGED', gameId: 'dino', score: this.state.score });
    }
    if (!prev.gameOver && this.state.gameOver) {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'dino', state: 'over' });
    }
    this.render();
  }

  private render() {
    this.graphics.clear();
    this.graphics.fillStyle(this.theme === 'night' ? 0x292218 : 0xfff6df, 1);
    this.graphics.fillRect(0, 0, DINO_VIEW.width, DINO_VIEW.height);

    this.graphics.lineStyle(2, this.theme === 'night' ? 0xcab694 : 0x7d6440, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, DINO_VIEW.floorY);
    this.graphics.lineTo(DINO_VIEW.width, DINO_VIEW.floorY);
    this.graphics.strokePath();

    this.graphics.fillStyle(this.theme === 'night' ? 0x9bd59a : 0x4e8a4d, 1);
    this.graphics.fillRect(DINO_VIEW.playerX, this.state.playerY, DINO_VIEW.playerW, DINO_VIEW.playerH);

    this.state.obstacles.forEach((obs) => {
      this.graphics.fillStyle(this.theme === 'night' ? 0xf49b6b : 0xb35f2c, 1);
      this.graphics.fillRect(obs.x, DINO_VIEW.floorY - obs.height, obs.width, obs.height);
    });

    const status = this.state.gameOver ? '结束，点击重开 (tap / click)' : '点击跳跃 (tap / click)';
    this.infoText.setText(`Dino 分数 ${this.state.score} | ${status}`);
  }
}
