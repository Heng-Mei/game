import type Phaser from 'phaser';
import { BaseScene } from '../../game-core/base-scene';
import type { GameOutgoingEvent } from '../../game-core/events';
import {
  canMoveRun,
  createSpiderState,
  dealFromStock,
  difficultyLabel,
  moveRun,
  suitSymbol,
  type SpiderCard,
  type SpiderDifficulty,
  type SpiderState
} from './spider-rules';

type Selection = {
  fromCol: number;
  startIndex: number;
};

const cardRanks = ['?', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class SpiderScene extends BaseScene {
  private readonly theme: 'day' | 'night';
  private difficulty: SpiderDifficulty = 1;
  private state: SpiderState = createSpiderState(1);
  private selected: Selection | null = null;
  private graphics!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private labelPool: Phaser.GameObjects.Text[] = [];
  private labelCursor = 0;
  private cardWidth = 68;
  private cardHeight = 88;
  private cardGapX = 90;
  private cardGapY = 22;
  private boardX = 20;
  private boardY = 92;
  private stockX = 20;
  private stockY = 30;

  constructor(theme: 'day' | 'night', emitEvent?: (event: GameOutgoingEvent) => void) {
    super('spider-scene', 'spider', emitEvent);
    this.theme = theme;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.theme === 'night' ? '#0f1b18' : '#f4fbf8');
    this.graphics = this.add.graphics();
    this.titleText = this.add.text(24, 20, '', {
      color: this.theme === 'night' ? '#eef3ff' : '#101727',
      fontFamily: 'sans-serif',
      fontSize: '18px'
    });
    this.dispatch({ type: 'GAME_READY', gameId: 'spider' });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'spider', state: 'running' });
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'spider', score: 0 });

    this.bindInput();
    this.render();
  }

  private bindInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyR') {
        this.reset(this.difficulty);
        return;
      }
      if (event.code === 'KeyM') {
        this.cycleDifficulty();
        return;
      }
      if (event.code === 'KeyD') {
        this.state = dealFromStock(this.state);
        this.render();
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const stockHit = this.hitStock(pointer.x, pointer.y);
      if (stockHit) {
        this.state = dealFromStock(this.state);
        this.selected = null;
        this.render();
        return;
      }

      const picked = this.hitCard(pointer.x, pointer.y);
      if (picked && canMoveRun(this.state, picked.col, picked.index)) {
        this.selected = { fromCol: picked.col, startIndex: picked.index };
      } else {
        this.selected = null;
      }
      this.render();
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.selected) {
        return;
      }
      const target = this.hitColumn(pointer.x, pointer.y);
      if (target !== null) {
        this.state = moveRun(this.state, this.selected.fromCol, this.selected.startIndex, target);
      }
      this.selected = null;
      this.render();
    });
  }

  private cycleDifficulty() {
    const next: SpiderDifficulty = this.difficulty === 1 ? 2 : this.difficulty === 2 ? 4 : 1;
    this.reset(next);
  }

  private reset(difficulty: SpiderDifficulty) {
    this.difficulty = difficulty;
    this.state = createSpiderState(difficulty);
    this.selected = null;
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'spider', score: this.state.foundations.length });
    this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'spider', state: 'running' });
    this.render();
  }

  private hitStock(x: number, y: number): boolean {
    const width = 60;
    const height = 44;
    return x >= this.stockX && x <= this.stockX + width && y >= this.stockY && y <= this.stockY + height;
  }

  private hitColumn(x: number, y: number): number | null {
    if (y < this.boardY - 20) {
      return null;
    }
    const relX = x - this.boardX;
    if (relX < 0) {
      return null;
    }
    const col = Math.floor(relX / this.cardGapX);
    if (col < 0 || col >= 10) {
      return null;
    }
    return col;
  }

  private hitCard(x: number, y: number): { col: number; index: number } | null {
    const col = this.hitColumn(x, y);
    if (col === null) {
      return null;
    }
    const column = this.state.tableau[col];
    if (!column.length) {
      return { col, index: 0 };
    }
    for (let i = column.length - 1; i >= 0; i -= 1) {
      const cx = this.boardX + col * this.cardGapX;
      const cy = this.boardY + i * this.cardGapY;
      const height = i === column.length - 1 ? this.cardHeight : this.cardGapY + 6;
      if (x >= cx && x <= cx + this.cardWidth && y >= cy && y <= cy + height) {
        return { col, index: i };
      }
    }
    return null;
  }

  private render() {
    this.graphics.clear();
    this.labelCursor = 0;

    this.graphics.fillStyle(this.theme === 'night' ? 0x203126 : 0xdcefe6, 1);
    this.graphics.fillRect(this.stockX, this.stockY, 60, 44);
    this.graphics.lineStyle(1, this.theme === 'night' ? 0x3f5b4b : 0x94b7a6, 1);
    this.graphics.strokeRect(this.stockX, this.stockY, 60, 44);
    this.drawLabel(this.stockX + 6, this.stockY + 12, `发牌 ${Math.floor(this.state.stock.length / 10)}`, '#1e293b');

    for (let col = 0; col < 10; col += 1) {
      const column = this.state.tableau[col];
      if (!column.length) {
        const x = this.boardX + col * this.cardGapX;
        this.graphics.lineStyle(1, this.theme === 'night' ? 0x2c3c50 : 0xc7d2e6, 1);
        this.graphics.strokeRect(x, this.boardY, this.cardWidth, this.cardHeight);
        continue;
      }
      column.forEach((card, index) => {
        const x = this.boardX + col * this.cardGapX;
        const y = this.boardY + index * this.cardGapY;
        const selected = this.selected
          && this.selected.fromCol === col
          && index >= this.selected.startIndex;
        this.drawCard(x, y, card, selected ? '#4ea8ff' : null);
      });
    }

    for (let i = this.labelCursor; i < this.labelPool.length; i += 1) {
      this.labelPool[i].setVisible(false);
    }

    const statusLabel = this.state.won ? '胜利' : '进行中';
    this.titleText.setText(
      `Spider ${difficultyLabel(this.difficulty)} | 完成 ${this.state.foundations.length}/8 | ${statusLabel}\n` +
        `拖动移动序列，左上角发牌；M 切难度，D 发牌，R 重开`
    );
    this.dispatch({ type: 'SCORE_CHANGED', gameId: 'spider', score: this.state.foundations.length });
    if (this.state.won) {
      this.dispatch({ type: 'GAME_STATE_CHANGED', gameId: 'spider', state: 'over' });
    }
  }

  private drawCard(x: number, y: number, card: SpiderCard, outlineColor: string | null) {
    if (!card.faceUp) {
      this.graphics.fillStyle(this.theme === 'night' ? 0x25334a : 0x9cb4da, 1);
      this.graphics.fillRect(x, y, this.cardWidth, this.cardHeight);
      this.graphics.lineStyle(1, this.theme === 'night' ? 0x4b648f : 0x6d88b7, 1);
      this.graphics.strokeRect(x, y, this.cardWidth, this.cardHeight);
      return;
    }

    this.graphics.fillStyle(this.theme === 'night' ? 0xf2f4f8 : 0xffffff, 1);
    this.graphics.fillRect(x, y, this.cardWidth, this.cardHeight);
    this.graphics.lineStyle(1, outlineColor ? parseInt(outlineColor.slice(1), 16) : 0xb8c4d8, 1);
    this.graphics.strokeRect(x, y, this.cardWidth, this.cardHeight);

    const redSuit = card.suit === 'H' || card.suit === 'D';
    const textColor = redSuit ? '#d14343' : '#2a3242';
    const label = `${cardRanks[card.rank]}${suitSymbol(card.suit)}`;
    this.drawLabel(x + 8, y + 6, label, textColor);
  }

  private drawLabel(x: number, y: number, text: string, color: string) {
    const index = this.labelCursor;
    let label = this.labelPool[index];
    if (!label) {
      label = this.add.text(x, y, text, {
        color,
        fontFamily: 'sans-serif',
        fontSize: '14px'
      });
      this.labelPool.push(label);
    }
    label.setPosition(x, y);
    label.setText(text);
    label.setColor(color);
    label.setVisible(true);
    this.labelCursor += 1;
  }
}
