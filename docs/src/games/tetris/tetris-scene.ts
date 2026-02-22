import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import { useTetrisSettingsStore } from '../../stores/tetris-settings-store';
import {
  TETRIS_COLS,
  TETRIS_ROWS,
  createInitialTetrisState,
  getPieceCells,
  reduceTetrisState,
  type TetrisRuntimeState
} from './tetris-rules';
import { resolveTetrisActionFromCode } from './tetris-input';

const PIECE_COLORS: Record<string, number> = {
  I: 0x44d6ff,
  O: 0xffd64d,
  T: 0xaf8dff,
  S: 0x57d27a,
  Z: 0xff6e6e,
  J: 0x6ea8ff,
  L: 0xffb66a
};

type HeldKey = {
  code: string;
  action: 'moveLeft' | 'moveRight' | 'softDrop';
  pressedAt: number;
  lastRepeatAt: number;
};

export class TetrisScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private state: TetrisRuntimeState = createInitialTetrisState();
  private boardGraphics!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;
  private auxText!: Phaser.GameObjects.Text;
  private cellSize = 26;
  private boardX = 220;
  private boardY = 48;
  private dropAccumulatorMs = 0;
  private paused = false;
  private heldKeys = new Map<string, HeldKey>();

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('tetris-scene', 'tetris', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0f1728' : '#f5f8ff');
    this.boardGraphics = this.add.graphics();

    this.infoText = this.add.text(24, 24, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });
    this.auxText = this.add.text(24, 64, '', {
      color: this.theme === 'night' ? '#a9b7cf' : '#516179',
      fontFamily: 'sans-serif',
      fontSize: '14px'
    });

    this.dispatch({ type: 'GAME_READY', gameId: 'tetris' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'tetris', score: this.state.score });

    this.bindInput();
    this.render();
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        this.restartGame();
        return;
      }
      const keybinds = useTetrisSettingsStore.getState().keybinds;
      const action = resolveTetrisActionFromCode(event.code || '', keybinds);
      if (!action) {
        return;
      }
      if (action === 'pause') {
        this.paused = !this.paused;
        this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: this.paused ? 'paused' : 'running' });
        this.render();
        return;
      }
      if (action === 'moveLeft' || action === 'moveRight' || action === 'softDrop') {
        if (!this.heldKeys.has(event.code)) {
          this.heldKeys.set(event.code, {
            code: event.code,
            action,
            pressedAt: this.time.now,
            lastRepeatAt: this.time.now
          });
        }
      }
      this.applyAction(action);
    });

    this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      this.heldKeys.delete(event.code);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.paused || this.state.gameOver) {
        return;
      }
      const x = pointer.x;
      const y = pointer.y;
      const boardRight = this.boardX + TETRIS_COLS * this.cellSize;
      const boardBottom = this.boardY + TETRIS_ROWS * this.cellSize;
      if (x < this.boardX || x > boardRight || y < this.boardY || y > boardBottom) {
        return;
      }
      if (y < this.boardY + this.cellSize * 4) {
        this.applyAction('rotateRight');
      } else if (x < this.boardX + (TETRIS_COLS * this.cellSize) / 3) {
        this.applyAction('moveLeft');
      } else if (x > this.boardX + ((TETRIS_COLS * this.cellSize) / 3) * 2) {
        this.applyAction('moveRight');
      } else {
        this.applyAction('hardDrop');
      }
    });
  }

  private restartGame() {
    this.state = createInitialTetrisState();
    this.paused = false;
    this.heldKeys.clear();
    this.dropAccumulatorMs = 0;
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'tetris', score: this.state.score });
    this.render();
  }

  private applyAction(action: 'moveLeft' | 'moveRight' | 'softDrop' | 'hardDrop' | 'rotateRight' | 'rotateLeft' | 'hold') {
    const prev = this.state;
    this.state = reduceTetrisState(this.state, { type: action });
    if (this.state !== prev) {
      if (this.state.score !== prev.score) {
        this.dispatch({ type: 'SCORE_CHANGED', gameId: 'tetris', score: this.state.score });
      }
      if (this.state.gameOver && !prev.gameOver) {
        this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: 'over' });
      }
      this.render();
    }
  }

  private handleHeldInput(now: number) {
    if (this.paused || this.state.gameOver) {
      return;
    }
    const settings = useTetrisSettingsStore.getState();
    const dasMs = Math.max(1, settings.dasFrames) * 16;
    const arrMs = Math.max(1, settings.arrFrames) * 16;
    const dssMs = Math.max(1, settings.dssFrames) * 16;

    this.heldKeys.forEach((held) => {
      if (now - held.pressedAt < dasMs) {
        return;
      }
      const interval = held.action === 'softDrop' ? dssMs : arrMs;
      if (now - held.lastRepeatAt < interval) {
        return;
      }
      held.lastRepeatAt = now;
      this.applyAction(held.action);
    });
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.state.gameOver) {
      return;
    }

    this.handleHeldInput(this.time.now);

    const gravityMs = Math.max(140, 950 - (this.state.level - 1) * 70);
    this.dropAccumulatorMs += delta;
    while (this.dropAccumulatorMs >= gravityMs) {
      this.dropAccumulatorMs -= gravityMs;
      const prev = this.state;
      this.state = reduceTetrisState(this.state, { type: 'tick' });
      if (this.state !== prev) {
        if (this.state.score !== prev.score) {
          this.dispatch({ type: 'SCORE_CHANGED', gameId: 'tetris', score: this.state.score });
        }
        if (this.state.gameOver && !prev.gameOver) {
          this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'tetris', state: 'over' });
        }
        this.render();
      }
    }
  }

  private drawCell(x: number, y: number, fillColor: number) {
    this.boardGraphics.fillStyle(fillColor, 1);
    this.boardGraphics.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
  }

  private render() {
    this.boardGraphics.clear();
    const boardPixelWidth = TETRIS_COLS * this.cellSize;
    const boardPixelHeight = TETRIS_ROWS * this.cellSize;
    this.boardGraphics.fillStyle(this.theme === 'night' ? 0x121b31 : 0xffffff, 1);
    this.boardGraphics.fillRect(this.boardX, this.boardY, boardPixelWidth, boardPixelHeight);
    this.boardGraphics.lineStyle(1, this.theme === 'night' ? 0x2d3850 : 0xd7deea, 1);
    this.boardGraphics.strokeRect(this.boardX, this.boardY, boardPixelWidth, boardPixelHeight);

    for (let row = 0; row < TETRIS_ROWS; row += 1) {
      for (let col = 0; col < TETRIS_COLS; col += 1) {
        const cell = this.state.board[row][col];
        if (!cell) {
          continue;
        }
        this.drawCell(
          this.boardX + col * this.cellSize,
          this.boardY + row * this.cellSize,
          PIECE_COLORS[cell] ?? 0xcccccc
        );
      }
    }

    const blockColor = PIECE_COLORS[this.state.active.type] ?? 0xffffff;
    const activeRender = getPieceCells(this.state.active).map(([x, y]) => [
      x + this.state.active.x,
      y + this.state.active.y
    ]);
    activeRender.forEach(([x, y]) => {
      if (y < 0) {
        return;
      }
      this.drawCell(this.boardX + x * this.cellSize, this.boardY + y * this.cellSize, blockColor);
    });

    const stateLabel = this.state.gameOver ? '结束 (R 重开)' : this.paused ? '暂停' : '进行中';
    const next = this.state.queue[0] ?? '-';
    this.infoText.setText(
      `Tetris  分数 ${this.state.score}  行 ${this.state.lines}  级别 ${this.state.level}`
    );
    this.auxText.setText(
      `Next ${next}   Hold ${this.state.hold ?? '-'}   ${stateLabel}\n` +
        `移动/旋转/硬降/暂存可用，支持自定义键位与 DAS ARR DSS`
    );
  }
}
