import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { detectSwipe } from '../../platform/input/gesture-detector';
import {
  SNAKE_COLS,
  SNAKE_ROWS,
  changeDirection,
  createSnakeState,
  stepSnake,
  type SnakeDirection,
  type SnakeState
} from './snake-rules';

export class SnakeScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private state: SnakeState = createSnakeState();
  private boardGraphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private cellSize = 24;
  private boardX = 240;
  private boardY = 68;
  private stepAccumulatorMs = 0;
  private pointerStart: { x: number; y: number } | null = null;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('snake-scene', 'snake', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0e1a14' : '#f5fbf6');
    this.boardGraphics = this.add.graphics();
    this.infoText = this.add.text(24, 22, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'snake' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'snake', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'snake', score: this.state.score });

    this.bindInput();
    this.render();
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        this.restart();
        return;
      }
      const direction = this.mapCodeToDirection(event.code);
      if (!direction) {
        return;
      }
      this.state = changeDirection(this.state, direction);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStart = { x: pointer.x, y: pointer.y };
      if (this.state.gameOver) {
        this.restart();
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerStart) {
        return;
      }
      const action = detectSwipe(this.pointerStart, { x: pointer.x, y: pointer.y });
      this.pointerStart = null;
      if (action === 'move_left') {
        this.state = changeDirection(this.state, 'left');
      } else if (action === 'move_right') {
        this.state = changeDirection(this.state, 'right');
      } else if (action === 'move_up') {
        this.state = changeDirection(this.state, 'up');
      } else if (action === 'move_down') {
        this.state = changeDirection(this.state, 'down');
      }
    });
  }

  private mapCodeToDirection(code: string): SnakeDirection | null {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      return 'left';
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      return 'right';
    }
    if (code === 'ArrowUp' || code === 'KeyW') {
      return 'up';
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      return 'down';
    }
    return null;
  }

  private restart() {
    this.state = createSnakeState();
    this.stepAccumulatorMs = 0;
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'snake', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'snake', score: this.state.score });
    this.render();
  }

  update(_time: number, delta: number): void {
    const interval = 130;
    this.stepAccumulatorMs += delta;
    if (this.stepAccumulatorMs < interval) {
      return;
    }
    this.stepAccumulatorMs = 0;

    const prev = this.state;
    this.state = stepSnake(this.state);
    if (this.state.score !== prev.score) {
      this.dispatch({ type: 'SCORE_CHANGED', gameId: 'snake', score: this.state.score });
    }
    if (!prev.gameOver && this.state.gameOver) {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'snake', state: 'over' });
    }
    this.render();
  }

  private render() {
    this.boardGraphics.clear();
    const boardWidth = SNAKE_COLS * this.cellSize;
    const boardHeight = SNAKE_ROWS * this.cellSize;
    this.boardGraphics.fillStyle(this.theme === 'night' ? 0x13241d : 0xffffff, 1);
    this.boardGraphics.fillRect(this.boardX, this.boardY, boardWidth, boardHeight);
    this.boardGraphics.lineStyle(1, this.theme === 'night' ? 0x305041 : 0xcde3d2, 1);
    this.boardGraphics.strokeRect(this.boardX, this.boardY, boardWidth, boardHeight);

    this.boardGraphics.fillStyle(0xe15b5b, 1);
    this.boardGraphics.fillRect(
      this.boardX + this.state.food.x * this.cellSize + 3,
      this.boardY + this.state.food.y * this.cellSize + 3,
      this.cellSize - 6,
      this.cellSize - 6
    );

    this.state.snake.forEach((node, index) => {
      this.boardGraphics.fillStyle(index === 0 ? 0x4fbf78 : 0x57d27a, 1);
      this.boardGraphics.fillRect(
        this.boardX + node.x * this.cellSize + 2,
        this.boardY + node.y * this.cellSize + 2,
        this.cellSize - 4,
        this.cellSize - 4
      );
    });

    const stateLabel = this.state.gameOver ? '游戏结束，点击或按 R 重开' : '滑动或方向键移动';
    this.infoText.setText(`Snake  分数 ${this.state.score}   ${stateLabel}`);
  }
}
