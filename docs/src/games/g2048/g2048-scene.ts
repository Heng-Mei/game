import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { detectSwipe } from '../../platform/input/gesture-detector';
import {
  ANIMATION_CONFIG,
  GAME_TARGET,
  createInitial2048State,
  moveGrid,
  type Game2048State,
  type MoveDirection
} from './g2048-rules';

const TILE_COLORS: Record<number, number> = {
  0: 0xe8eef8,
  2: 0xf5f3e8,
  4: 0xf1e3c6,
  8: 0xf2bf8b,
  16: 0xf09b73,
  32: 0xec7f6f,
  64: 0xe0655f,
  128: 0xdac46b,
  256: 0xd4b45c,
  512: 0xcb9e46,
  1024: 0xc68836,
  2048: 0xbf7426
};

export class G2048Scene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private state: Game2048State = createInitial2048State();
  private graphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private numberPool: Phaser.GameObjects.Text[] = [];
  private numberCursor = 0;
  private pointerStart: { x: number; y: number } | null = null;
  private boardX = 300;
  private boardY = 96;
  private tileSize = 88;
  private tileGap = 10;
  private animationRemaining = 0;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('g2048-scene', 'g2048', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#111726' : '#f7f8fc');
    this.graphics = this.add.graphics();
    this.infoText = this.add.text(24, 24, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'g2048' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'g2048', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'g2048', score: this.state.score });

    this.bindInput();
    this.render();
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const direction = this.mapCode(event.code);
      if (direction) {
        this.applyMove(direction);
      }
      if (event.code === 'KeyR') {
        this.restart();
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStart = { x: pointer.x, y: pointer.y };
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerStart) {
        return;
      }
      const action = detectSwipe(this.pointerStart, { x: pointer.x, y: pointer.y });
      this.pointerStart = null;
      if (action === 'move_left') {
        this.applyMove('left');
      } else if (action === 'move_right') {
        this.applyMove('right');
      } else if (action === 'move_up') {
        this.applyMove('up');
      } else if (action === 'move_down') {
        this.applyMove('down');
      }
    });
  }

  private mapCode(code: string): MoveDirection | null {
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
    this.state = createInitial2048State();
    this.animationRemaining = 0;
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'g2048', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'g2048', score: this.state.score });
    this.render();
  }

  private applyMove(direction: MoveDirection) {
    if (this.state.over) {
      return;
    }
    const prev = this.state;
    this.state = moveGrid(this.state, direction);
    if (this.state === prev) {
      return;
    }
    this.animationRemaining = ANIMATION_CONFIG.slideMs;
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'g2048', score: this.state.score });
    if (this.state.over) {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'g2048', state: 'over' });
    }
    this.render();
  }

  update(_time: number, delta: number): void {
    if (this.animationRemaining > 0) {
      this.animationRemaining = Math.max(0, this.animationRemaining - delta);
      this.render();
    }
  }

  private render() {
    this.graphics.clear();
    this.numberCursor = 0;

    const boardSize = this.tileSize * 4 + this.tileGap * 5;
    this.graphics.fillStyle(this.theme === 'night' ? 0x202a40 : 0xd8dbe5, 1);
    this.graphics.fillRoundedRect(this.boardX, this.boardY, boardSize, boardSize, 14);

    let dx = 0;
    let dy = 0;
    if (this.animationRemaining > 0 && this.state.lastMove) {
      const ratio = this.animationRemaining / ANIMATION_CONFIG.slideMs;
      const distance = 10 * ratio;
      if (this.state.lastMove === 'left') {
        dx = -distance;
      } else if (this.state.lastMove === 'right') {
        dx = distance;
      } else if (this.state.lastMove === 'up') {
        dy = -distance;
      } else {
        dy = distance;
      }
    }

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const value = this.state.grid[row][col];
        const x = this.boardX + this.tileGap + col * (this.tileSize + this.tileGap) + dx;
        const y = this.boardY + this.tileGap + row * (this.tileSize + this.tileGap) + dy;
        const fill = TILE_COLORS[value] ?? 0xb86d30;
        this.graphics.fillStyle(fill, 1);
        this.graphics.fillRoundedRect(x, y, this.tileSize, this.tileSize, 10);

        if (value > 0) {
          this.drawNumber(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            String(value),
            value >= 8 ? '#fff5e9' : '#3f3522'
          );
        }
      }
    }

    for (let i = this.numberCursor; i < this.numberPool.length; i += 1) {
      this.numberPool[i].setVisible(false);
    }

    const status = this.state.over
      ? `结束，按 R 重开`
      : this.state.won
      ? `达成 ${GAME_TARGET}，继续挑战`
      : '方向键或滑动操作';
    this.infoText.setText(`2048 分数 ${this.state.score} | ${status}`);
  }

  private drawNumber(x: number, y: number, text: string, color: string) {
    const index = this.numberCursor;
    let node = this.numberPool[index];
    if (!node) {
      node = this.add.text(x, y, text, {
        color,
        fontFamily: 'sans-serif',
        fontSize: '28px',
        fontStyle: 'bold'
      });
      node.setOrigin(0.5, 0.5);
      this.numberPool.push(node);
    }
    node.setPosition(x, y);
    node.setText(text);
    node.setColor(color);
    node.setVisible(true);
    this.numberCursor += 1;
  }
}
