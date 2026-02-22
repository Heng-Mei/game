import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import {
  MINESWEEPER_PRESETS,
  chordCell,
  createMinesweeperState,
  revealCell,
  toggleMark,
  type MinesweeperDifficulty,
  type MinesweeperState
} from './minesweeper-rules';

const difficultyOrder: MinesweeperDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];

export class MinesweeperScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private difficulty: MinesweeperDifficulty = 'BEGINNER';
  private state: MinesweeperState = createMinesweeperState('BEGINNER');
  private mode: 'reveal' | 'flag' | 'chord' = 'reveal';
  private graphics!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private cellTexts: Phaser.GameObjects.Text[] = [];
  private cellTextCursor = 0;
  private cellSize = 28;
  private boardX = 56;
  private boardY = 90;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('minesweeper-scene', 'minesweeper', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#101827' : '#f8fbff');
    this.graphics = this.add.graphics();
    this.titleText = this.add.text(24, 20, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '20px'
    });
    this.dispatch({ type: 'GAME_READY', gameId: 'minesweeper' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'minesweeper', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'minesweeper', score: 0 });

    this.bindInput();
    this.render();
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        this.resetDifficulty(this.difficulty);
        return;
      }
      if (event.code === 'KeyM') {
        this.cycleDifficulty();
        return;
      }
      if (event.code === 'KeyF') {
        this.mode = 'flag';
        this.render();
        return;
      }
      if (event.code === 'KeyC') {
        this.mode = 'chord';
        this.render();
        return;
      }
      if (event.code === 'KeyV') {
        this.mode = 'reveal';
        this.render();
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const cell = this.hitCell(pointer.x, pointer.y);
      if (!cell) {
        return;
      }
      if (pointer.rightButtonDown()) {
        this.state = toggleMark(this.state, cell.x, cell.y);
      } else if (this.mode === 'flag') {
        this.state = toggleMark(this.state, cell.x, cell.y);
      } else if (this.mode === 'chord') {
        this.state = chordCell(this.state, cell.x, cell.y);
      } else {
        this.state = revealCell(this.state, cell.x, cell.y);
      }

      this.dispatchScoreAndStatus();
      this.render();
    });

    this.input.mouse?.disableContextMenu();
  }

  private cycleDifficulty() {
    const currentIndex = difficultyOrder.indexOf(this.difficulty);
    const next = difficultyOrder[(currentIndex + 1) % difficultyOrder.length];
    this.resetDifficulty(next);
  }

  private resetDifficulty(next: MinesweeperDifficulty) {
    this.difficulty = next;
    this.state = createMinesweeperState(this.difficulty);
    this.mode = 'reveal';
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'minesweeper', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'minesweeper', score: 0 });
    this.render();
  }

  private dispatchScoreAndStatus() {
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'minesweeper', score: this.state.revealedCount });
    if (this.state.status === 'lost' || this.state.status === 'won') {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'minesweeper', state: 'over' });
    }
  }

  private hitCell(x: number, y: number) {
    const relX = x - this.boardX;
    const relY = y - this.boardY;
    if (relX < 0 || relY < 0) {
      return null;
    }
    const cellX = Math.floor(relX / this.cellSize);
    const cellY = Math.floor(relY / this.cellSize);
    if (cellX < 0 || cellY < 0 || cellX >= this.state.width || cellY >= this.state.height) {
      return null;
    }
    return { x: cellX, y: cellY };
  }

  private render() {
    const boardWidth = this.state.width * this.cellSize;
    const boardHeight = this.state.height * this.cellSize;

    this.graphics.clear();
    this.graphics.fillStyle(this.theme === 'night' ? 0x172133 : 0xffffff, 1);
    this.graphics.fillRect(this.boardX, this.boardY, boardWidth, boardHeight);
    this.graphics.lineStyle(1, this.theme === 'night' ? 0x34405a : 0xc8d3e5, 1);
    this.graphics.strokeRect(this.boardX, this.boardY, boardWidth, boardHeight);
    this.cellTextCursor = 0;

    for (let y = 0; y < this.state.height; y += 1) {
      for (let x = 0; x < this.state.width; x += 1) {
        const cell = this.state.board[y][x];
        const px = this.boardX + x * this.cellSize;
        const py = this.boardY + y * this.cellSize;

        this.graphics.lineStyle(1, this.theme === 'night' ? 0x2b3850 : 0xd3deef, 1);
        this.graphics.strokeRect(px, py, this.cellSize, this.cellSize);

        if (!cell.revealed) {
          this.graphics.fillStyle(this.theme === 'night' ? 0x23314a : 0xe9eef7, 1);
          this.graphics.fillRect(px + 1, py + 1, this.cellSize - 2, this.cellSize - 2);
          if (cell.mark === 'flag') {
            this.drawCellText(px + 8, py + 4, '🚩', this.theme === 'night' ? '#ffd1d1' : '#a02121');
          } else if (cell.mark === 'question') {
            this.drawCellText(px + 10, py + 6, '?', this.theme === 'night' ? '#f4e8b2' : '#7a5f00');
          }
          continue;
        }

        this.graphics.fillStyle(this.theme === 'night' ? 0x121a2a : 0xf5f8fd, 1);
        this.graphics.fillRect(px + 1, py + 1, this.cellSize - 2, this.cellSize - 2);

        if (cell.mine) {
          this.drawCellText(px + 8, py + 4, '💣', this.theme === 'night' ? '#f5f5f5' : '#1d2533');
        } else if (cell.adjacent > 0) {
          this.drawCellText(
            px + 10,
            py + 6,
            String(cell.adjacent),
            this.theme === 'night' ? '#8bd3ff' : '#2a5ba7'
          );
        }
      }
    }

    for (let i = this.cellTextCursor; i < this.cellTexts.length; i += 1) {
      this.cellTexts[i].setVisible(false);
    }

    const preset = MINESWEEPER_PRESETS[this.difficulty];
    const statusLabel = this.state.status === 'won'
      ? '胜利'
      : this.state.status === 'lost'
      ? '失败'
      : '进行中';
    this.titleText.setText(
      `Minesweeper ${preset.width}x${preset.height} 雷${preset.mines} | 模式 ${this.mode} | ${statusLabel}\n` +
        `左键翻开 右键插旗 / F插旗 C快开 V翻开 / M切难度 R重开`
    );
  }

  private drawCellText(x: number, y: number, text: string, color: string) {
    const index = this.cellTextCursor;
    let node = this.cellTexts[index];
    if (!node) {
      node = this.add.text(x, y, text, {
        color,
        fontFamily: 'sans-serif',
        fontSize: '14px'
      });
      this.cellTexts.push(node);
    }
    node.setPosition(x, y);
    node.setText(text);
    node.setColor(color);
    node.setVisible(true);
    this.cellTextCursor += 1;
  }
}
