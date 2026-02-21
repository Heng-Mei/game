(function initGame2048() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};

  const { mainCanvas, mainCtx } = window.GameHub.refs;

  class Game2048 {
    constructor(uiRef) {
      this.ui = uiRef;
      this.SIZE = 4;
      this.CELL = 108;
      this.GAP = 12;
      this.PADDING = 16;
      this.SWIPE_THRESHOLD = 10;
      this.boardPx = this.PADDING * 2 + this.SIZE * this.CELL + (this.SIZE - 1) * this.GAP;

      this.bestScoreStorageKey = 'gamehub.2048.best_score';
      this.winTipStorageKey = 'gamehub.2048.win_tip';

      this.bestScore = this.loadBestScore();
      this.winTipEnabled = this.loadWinTipEnabled();
      this.reset();
    }

    loadBestScore() {
      try {
        const raw = window.localStorage.getItem(this.bestScoreStorageKey);
        const parsed = Number.parseInt(raw || '0', 10);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      } catch (error) {
        return 0;
      }
    }

    saveBestScore() {
      try {
        window.localStorage.setItem(this.bestScoreStorageKey, String(this.bestScore));
      } catch (error) {
        // Ignore storage failures.
      }
    }

    loadWinTipEnabled() {
      try {
        return window.localStorage.getItem(this.winTipStorageKey) !== '0';
      } catch (error) {
        return true;
      }
    }

    saveWinTipEnabled() {
      try {
        window.localStorage.setItem(this.winTipStorageKey, this.winTipEnabled ? '1' : '0');
      } catch (error) {
        // Ignore storage failures.
      }
    }

    enter() {
      this.ui.setCanvasSize(this.boardPx, this.boardPx);
      this.ui.showNextCanvas(false);
      if (typeof this.ui.showHoldCanvas === 'function') {
        this.ui.showHoldCanvas(false);
      }
      this.ui.setControls([
        '电脑端：方向键 / WASD 移动，R 重开',
        '手机端：在画布上滑动（上/下/左/右）',
        '规则：仅有效移动才会新增数字，2/4 生成概率为 90%/10%',
        '达成 2048 后可继续挑战更高分'
      ]);
      this.renderSettings();
      this.reset();
    }

    exit() {
      this.ui.setSettings([]);
      this.swipeStart = null;
    }

    renderSettings() {
      this.ui.setSettings([
        {
          label: '2048达成提示',
          enabled: this.winTipEnabled,
          onToggle: () => {
            this.winTipEnabled = !this.winTipEnabled;
            this.saveWinTipEnabled();
            this.renderSettings();
          }
        }
      ]);
    }

    reset() {
      this.grid = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
      this.score = 0;
      this.moves = 0;
      this.reached2048 = false;
      this.gameOver = false;
      this.swipeStart = null;

      this.addRandomTile();
      this.addRandomTile();
      this.updateHUD();
      this.ui.setState('方向键或滑动操作开始游戏');
      this.draw();
    }

    getMaxTile() {
      let max = 0;
      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          if (this.grid[y][x] > max) {
            max = this.grid[y][x];
          }
        }
      }
      return max;
    }

    updateHUD() {
      this.ui.setStatus([
        { label: '分数', value: this.score },
        { label: '最高分', value: this.bestScore },
        { label: '步数', value: this.moves },
        { label: '最大砖块', value: this.getMaxTile() }
      ]);
    }

    addRandomTile() {
      const empties = [];
      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          if (this.grid[y][x] === 0) {
            empties.push({ x: x, y: y });
          }
        }
      }

      if (!empties.length) {
        return false;
      }

      const target = empties[Math.floor(Math.random() * empties.length)];
      this.grid[target.y][target.x] = Math.random() < 0.9 ? 2 : 4;
      return true;
    }

    hasAvailableMoves() {
      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          const value = this.grid[y][x];
          if (value === 0) {
            return true;
          }

          if (x + 1 < this.SIZE && this.grid[y][x + 1] === value) {
            return true;
          }
          if (y + 1 < this.SIZE && this.grid[y + 1][x] === value) {
            return true;
          }
        }
      }

      return false;
    }

    compressAndMerge(line) {
      const compact = line.filter((value) => value !== 0);
      const merged = [];
      let scoreGain = 0;

      for (let i = 0; i < compact.length; i += 1) {
        const current = compact[i];
        const next = compact[i + 1];

        if (next !== undefined && current === next) {
          const combined = current * 2;
          merged.push(combined);
          scoreGain += combined;
          i += 1;
        } else {
          merged.push(current);
        }
      }

      while (merged.length < this.SIZE) {
        merged.push(0);
      }

      const moved = merged.some((value, idx) => value !== line[idx]);
      return { merged: merged, scoreGain: scoreGain, moved: moved };
    }

    getLine(index, direction) {
      if (direction === 'move_left' || direction === 'move_right') {
        return this.grid[index].slice();
      }

      const column = [];
      for (let y = 0; y < this.SIZE; y += 1) {
        column.push(this.grid[y][index]);
      }
      return column;
    }

    setLine(index, direction, values) {
      if (direction === 'move_left' || direction === 'move_right') {
        this.grid[index] = values.slice();
        return;
      }

      for (let y = 0; y < this.SIZE; y += 1) {
        this.grid[y][index] = values[y];
      }
    }

    applyMove(direction) {
      if (this.gameOver) {
        return false;
      }

      let movedAny = false;
      let gainTotal = 0;

      for (let i = 0; i < this.SIZE; i += 1) {
        const original = this.getLine(i, direction);
        const working = (direction === 'move_right' || direction === 'move_down')
          ? original.slice().reverse()
          : original.slice();

        const { merged, scoreGain, moved } = this.compressAndMerge(working);
        const restored = (direction === 'move_right' || direction === 'move_down')
          ? merged.slice().reverse()
          : merged;

        this.setLine(i, direction, restored);

        if (moved) {
          movedAny = true;
        }
        gainTotal += scoreGain;
      }

      if (!movedAny) {
        return false;
      }

      this.score += gainTotal;
      this.moves += 1;
      this.addRandomTile();

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.saveBestScore();
      }

      const maxTile = this.getMaxTile();
      let keepStateMessage = false;
      if (!this.reached2048 && maxTile >= 2048) {
        this.reached2048 = true;
        if (this.winTipEnabled) {
          this.ui.setState('恭喜达到 2048！可继续挑战');
          keepStateMessage = true;
        }
      }

      if (!this.hasAvailableMoves()) {
        this.gameOver = true;
        this.ui.setState('无法继续移动，按 R 重新开始');
      } else if (!keepStateMessage) {
        this.ui.setState('进行中');
      }

      this.updateHUD();
      return true;
    }

    onAction(action) {
      switch (action) {
        case 'restart':
        case 'double_tap_restart':
          this.reset();
          break;
        case 'move_left':
        case 'move_right':
        case 'move_up':
        case 'move_down':
          this.applyMove(action);
          break;
        case 'primary_tap':
          break;
        default:
          break;
      }
    }

    onKeyDown(event) {
      const map = {
        ArrowLeft: 'move_left',
        ArrowRight: 'move_right',
        ArrowUp: 'move_up',
        ArrowDown: 'move_down',
        KeyA: 'move_left',
        KeyD: 'move_right',
        KeyW: 'move_up',
        KeyS: 'move_down',
        KeyR: 'restart'
      };

      const action = map[event.code];
      if (!action) {
        return;
      }

      event.preventDefault();
      this.onAction(action);
    }

    onPointerDown(event) {
      if (event.pointerType === 'mouse' || event.button !== 0) {
        return;
      }

      this.swipeStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
    }

    onPointerUp(event) {
      if (!this.swipeStart || event.pointerType === 'mouse') {
        return;
      }

      if (event.pointerId !== undefined && this.swipeStart.pointerId !== undefined
        && event.pointerId !== this.swipeStart.pointerId) {
        return;
      }

      const dx = event.clientX - this.swipeStart.x;
      const dy = event.clientY - this.swipeStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      this.swipeStart = null;

      if (Math.max(absX, absY) < this.SWIPE_THRESHOLD) {
        return;
      }

      if (absX > absY) {
        this.onAction(dx > 0 ? 'move_right' : 'move_left');
      } else {
        this.onAction(dy > 0 ? 'move_down' : 'move_up');
      }
    }

    onPointerCancel() {
      this.swipeStart = null;
    }

    onContextMenu(event) {
      event.preventDefault();
    }

    tileColor(value) {
      const palette = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
      };
      return palette[value] || '#3c3a32';
    }

    tileTextColor(value) {
      return value <= 4 ? '#776e65' : '#f9f6f2';
    }

    tileFontSize(value) {
      const digits = String(value).length;
      if (digits <= 2) {
        return 44;
      }
      if (digits === 3) {
        return 38;
      }
      if (digits === 4) {
        return 30;
      }
      return 24;
    }

    draw() {
      mainCtx.fillStyle = '#bbada0';
      mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          const value = this.grid[y][x];
          const px = this.PADDING + x * (this.CELL + this.GAP);
          const py = this.PADDING + y * (this.CELL + this.GAP);

          mainCtx.fillStyle = this.tileColor(value);
          mainCtx.fillRect(px, py, this.CELL, this.CELL);

          if (!value) {
            continue;
          }

          mainCtx.fillStyle = this.tileTextColor(value);
          mainCtx.font = `bold ${this.tileFontSize(value)}px sans-serif`;
          mainCtx.textAlign = 'center';
          mainCtx.textBaseline = 'middle';
          mainCtx.fillText(String(value), px + this.CELL / 2, py + this.CELL / 2 + 1);
        }
      }
    }

    update() {
      this.draw();
    }
  }

  window.GameHub.games.Game2048 = Game2048;
})();
