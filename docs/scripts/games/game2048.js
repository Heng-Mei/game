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

      this.SLIDE_DURATION_MS = 90;
      this.POP_DURATION_MS = 70;

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
        '动画：滑动 90ms，合并回弹+新砖块弹入 70ms'
      ]);
      this.renderSettings();
      this.reset();
    }

    exit() {
      this.ui.setSettings([]);
      this.swipeStart = null;
      this.animation = null;
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

    cloneGrid(grid) {
      return grid.map((row) => row.slice());
    }

    reset() {
      this.grid = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
      this.score = 0;
      this.moves = 0;
      this.reached2048 = false;
      this.gameOver = false;
      this.swipeStart = null;
      this.animation = null;

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
        return null;
      }

      const target = empties[Math.floor(Math.random() * empties.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.grid[target.y][target.x] = value;
      return {
        x: target.x,
        y: target.y,
        value: value
      };
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

    coordFromNormalized(lineIndex, pos, direction) {
      switch (direction) {
        case 'move_left':
          return { x: pos, y: lineIndex };
        case 'move_right':
          return { x: this.SIZE - 1 - pos, y: lineIndex };
        case 'move_up':
          return { x: lineIndex, y: pos };
        case 'move_down':
          return { x: lineIndex, y: this.SIZE - 1 - pos };
        default:
          return { x: 0, y: 0 };
      }
    }

    resolveLineWithMoves(line, lineIndex, direction) {
      const nonZero = [];
      line.forEach((value, idx) => {
        if (value !== 0) {
          nonZero.push({ value: value, idx: idx });
        }
      });

      const merged = Array(this.SIZE).fill(0);
      const movingTiles = [];
      const mergePops = [];

      let scoreGain = 0;
      let write = 0;

      for (let i = 0; i < nonZero.length; i += 1) {
        const current = nonZero[i];
        const next = nonZero[i + 1];

        if (next && current.value === next.value) {
          const combined = current.value * 2;
          merged[write] = combined;
          scoreGain += combined;

          const fromA = this.coordFromNormalized(lineIndex, current.idx, direction);
          const fromB = this.coordFromNormalized(lineIndex, next.idx, direction);
          const to = this.coordFromNormalized(lineIndex, write, direction);

          movingTiles.push({ value: current.value, fromX: fromA.x, fromY: fromA.y, toX: to.x, toY: to.y });
          movingTiles.push({ value: next.value, fromX: fromB.x, fromY: fromB.y, toX: to.x, toY: to.y });
          mergePops.push({ x: to.x, y: to.y });

          i += 1;
          write += 1;
          continue;
        }

        merged[write] = current.value;
        const from = this.coordFromNormalized(lineIndex, current.idx, direction);
        const to = this.coordFromNormalized(lineIndex, write, direction);
        movingTiles.push({ value: current.value, fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
        write += 1;
      }

      const moved = merged.some((value, idx) => value !== line[idx]);

      return {
        merged: merged,
        moved: moved,
        scoreGain: scoreGain,
        movingTiles: movingTiles,
        mergePops: mergePops
      };
    }

    applyMove(direction) {
      if (this.gameOver || this.animation) {
        return false;
      }

      let movedAny = false;
      let gainTotal = 0;
      const movingTiles = [];
      const mergePops = [];

      for (let i = 0; i < this.SIZE; i += 1) {
        const original = this.getLine(i, direction);
        const normalized = (direction === 'move_right' || direction === 'move_down')
          ? original.slice().reverse()
          : original.slice();

        const result = this.resolveLineWithMoves(normalized, i, direction);
        const restored = (direction === 'move_right' || direction === 'move_down')
          ? result.merged.slice().reverse()
          : result.merged;

        this.setLine(i, direction, restored);

        if (result.moved) {
          movedAny = true;
        }
        gainTotal += result.scoreGain;
        movingTiles.push(...result.movingTiles);
        mergePops.push(...result.mergePops);
      }

      if (!movedAny) {
        return false;
      }

      this.score += gainTotal;
      this.moves += 1;
      const spawnPop = this.addRandomTile();

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

      this.animation = {
        phase: 'slide',
        elapsed: 0,
        movingTiles: movingTiles,
        mergePops: mergePops,
        spawnPop: spawnPop,
        finalGrid: this.cloneGrid(this.grid)
      };

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
      if (event.pointerType === 'mouse' || event.button !== 0 || this.animation) {
        return;
      }

      this.swipeStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
    }

    onPointerUp(event) {
      if (!this.swipeStart || event.pointerType === 'mouse' || this.animation) {
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

    easeOutCubic(t) {
      const p = Math.max(0, Math.min(1, t));
      return 1 - ((1 - p) ** 3);
    }

    easeOutBack(t) {
      const p = Math.max(0, Math.min(1, t));
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * ((p - 1) ** 3) + c1 * ((p - 1) ** 2);
    }

    drawBaseBoard() {
      mainCtx.fillStyle = '#bbada0';
      mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          this.drawTileAt(x, y, 0, 1);
        }
      }
    }

    drawTileAt(x, y, value, scale = 1) {
      const baseX = this.PADDING + x * (this.CELL + this.GAP);
      const baseY = this.PADDING + y * (this.CELL + this.GAP);

      const drawSize = this.CELL * scale;
      const px = baseX + (this.CELL - drawSize) / 2;
      const py = baseY + (this.CELL - drawSize) / 2;

      mainCtx.fillStyle = this.tileColor(value);
      mainCtx.fillRect(px, py, drawSize, drawSize);

      if (!value) {
        return;
      }

      mainCtx.fillStyle = this.tileTextColor(value);
      mainCtx.font = `bold ${this.tileFontSize(value) * scale}px sans-serif`;
      mainCtx.textAlign = 'center';
      mainCtx.textBaseline = 'middle';
      mainCtx.fillText(String(value), px + drawSize / 2, py + drawSize / 2 + 1);
    }

    drawStaticGrid(grid) {
      this.drawBaseBoard();
      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          const value = grid[y][x];
          if (value) {
            this.drawTileAt(x, y, value, 1);
          }
        }
      }
    }

    popScaleAt(x, y, progress) {
      if (!this.animation || this.animation.phase !== 'pop') {
        return 1;
      }

      let scale = 1;

      const mergeHit = this.animation.mergePops
        .some((tile) => tile.x === x && tile.y === y);
      if (mergeHit) {
        scale = Math.max(scale, 1 + 0.16 * Math.sin(progress * Math.PI));
      }

      const spawn = this.animation.spawnPop;
      if (spawn && spawn.x === x && spawn.y === y) {
        scale = Math.max(scale, 0.72 + 0.28 * this.easeOutBack(progress));
      }

      return scale;
    }

    drawPopFrame(progress) {
      this.drawBaseBoard();

      for (let y = 0; y < this.SIZE; y += 1) {
        for (let x = 0; x < this.SIZE; x += 1) {
          const value = this.grid[y][x];
          if (!value) {
            continue;
          }
          const scale = this.popScaleAt(x, y, progress);
          this.drawTileAt(x, y, value, scale);
        }
      }
    }

    drawSlideFrame(progress) {
      this.drawBaseBoard();

      this.animation.movingTiles.forEach((tile) => {
        const x = tile.fromX + (tile.toX - tile.fromX) * progress;
        const y = tile.fromY + (tile.toY - tile.fromY) * progress;
        this.drawTileAt(x, y, tile.value, 1);
      });
    }

    draw() {
      if (!this.animation) {
        this.drawStaticGrid(this.grid);
        return;
      }

      if (this.animation.phase === 'slide') {
        const progress = this.easeOutCubic(this.animation.elapsed / this.SLIDE_DURATION_MS);
        this.drawSlideFrame(progress);
        return;
      }

      const popProgress = this.animation.elapsed / this.POP_DURATION_MS;
      this.drawPopFrame(popProgress);
    }

    update(delta) {
      if (this.animation) {
        this.animation.elapsed += delta;

        if (this.animation.phase === 'slide' && this.animation.elapsed >= this.SLIDE_DURATION_MS) {
          this.animation.phase = 'pop';
          this.animation.elapsed = 0;
        } else if (this.animation.phase === 'pop' && this.animation.elapsed >= this.POP_DURATION_MS) {
          this.animation = null;
        }
      }

      this.draw();
    }
  }

  window.GameHub.games.Game2048 = Game2048;
})();
