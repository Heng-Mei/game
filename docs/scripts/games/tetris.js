(function initTetrisGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};
  const { mainCanvas, mainCtx, nextCanvas, nextCtx } = window.GameHub.refs;
  const ui = window.GameHub.ui;
class TetrisGame {
  constructor(uiRef) {
    this.ui = uiRef;
    this.COLS = 10;
    this.ROWS = 20;
    this.BLOCK = 30;
    this.colors = {
      I: '#00c8ff',
      O: '#ffd400',
      T: '#b36cff',
      S: '#43d17a',
      Z: '#ff5a71',
      J: '#5f84ff',
      L: '#ff9f43'
    };
    this.shapes = {
      I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      O: [
        [1, 1],
        [1, 1]
      ],
      T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ]
    };

    this.lineAnimEnabled = true;
    this.ghostEnabled = true;
    this.reset();
  }

  enter() {
    this.ui.setCanvasSize(this.COLS * this.BLOCK, this.ROWS * this.BLOCK);
    this.ui.showNextCanvas(true);
    this.ui.setControls([
      '← / →：左右移动',
      '↑：旋转',
      '↓：加速下落',
      '空格：开始 / 硬降',
      'P：暂停/继续',
      'R：重新开始'
    ]);
    this.renderSettings();
    this.reset();
  }

  exit() {
    this.ui.showNextCanvas(false);
    this.ui.setSettings([]);
  }

  renderSettings() {
    this.ui.setSettings([
      {
        label: '消行动画',
        enabled: this.lineAnimEnabled,
        onToggle: () => {
          this.lineAnimEnabled = !this.lineAnimEnabled;
          if (!this.lineAnimEnabled && this.lineClearEffect) {
            this.applyLineClear(this.lineClearEffect.rows);
            this.lineClearEffect = null;
            this.spawnPiece();
          }
          this.renderSettings();
        }
      },
      {
        label: '落点提示',
        enabled: this.ghostEnabled,
        onToggle: () => {
          this.ghostEnabled = !this.ghostEnabled;
          this.renderSettings();
        }
      }
    ]);
  }

  reset() {
    this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    this.currentPiece = this.createPiece(this.randomType());
    this.nextPiece = this.createPiece(this.randomType());
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = 700;
    this.dropCounter = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.paused = false;
    this.lineClearEffect = null;
    this.updateHUD();
    this.ui.setState('按空格开始');
    this.draw();
  }

  updateHUD() {
    this.ui.setStatus([
      { label: '分数', value: this.score },
      { label: '消行', value: this.lines },
      { label: '等级', value: this.level }
    ]);
  }

  randomType() {
    const types = Object.keys(this.shapes);
    return types[Math.floor(Math.random() * types.length)];
  }

  createPiece(type) {
    const shape = this.shapes[type].map((row) => [...row]);
    return {
      type,
      shape,
      x: Math.floor(this.COLS / 2) - Math.ceil(shape[0].length / 2),
      y: -1
    };
  }

  collide(piece, offsetX = 0, offsetY = 0) {
    const { shape } = piece;
    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) {
          continue;
        }
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;

        if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
          return true;
        }
        if (newY >= 0 && this.board[newY][newX]) {
          return true;
        }
      }
    }
    return false;
  }

  mergePiece() {
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) {
          return;
        }
        const boardY = this.currentPiece.y + y;
        const boardX = this.currentPiece.x + x;
        if (boardY >= 0) {
          this.board[boardY][boardX] = this.currentPiece.type;
        }
      });
    });
  }

  getFullRows() {
    const fullRows = [];
    for (let y = 0; y < this.ROWS; y += 1) {
      if (this.board[y].every((cell) => cell !== 0)) {
        fullRows.push(y);
      }
    }
    return fullRows;
  }

  applyLineClear(fullRows) {
    if (!fullRows.length) {
      return;
    }

    const descending = [...fullRows].sort((a, b) => b - a);
    descending.forEach((rowIndex) => {
      this.board.splice(rowIndex, 1);
    });

    for (let i = 0; i < fullRows.length; i += 1) {
      this.board.unshift(Array(this.COLS).fill(0));
    }

    this.lines += fullRows.length;
    this.score += [0, 40, 100, 300, 1200][fullRows.length] * this.level;
    this.level = Math.floor(this.lines / 10) + 1;
    this.dropInterval = Math.max(100, 700 - (this.level - 1) * 55);
    this.updateHUD();
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.currentPiece.x = Math.floor(this.COLS / 2) - Math.ceil(this.currentPiece.shape[0].length / 2);
    this.currentPiece.y = -1;
    this.nextPiece = this.createPiece(this.randomType());

    if (this.collide(this.currentPiece)) {
      this.gameOver = true;
      this.gameStarted = false;
      this.ui.setState('游戏结束，按 R 重新开始');
    }
  }

  rotate(matrix) {
    const transposed = matrix[0].map((_, index) => matrix.map((row) => row[index]));
    return transposed.map((row) => row.reverse());
  }

  rotatePiece() {
    const original = this.currentPiece.shape;
    this.currentPiece.shape = this.rotate(this.currentPiece.shape);

    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!this.collide(this.currentPiece, kick, 0)) {
        this.currentPiece.x += kick;
        return;
      }
    }

    this.currentPiece.shape = original;
  }

  movePiece(offset) {
    if (!this.collide(this.currentPiece, offset, 0)) {
      this.currentPiece.x += offset;
    }
  }

  getDropDistance(piece) {
    let offset = 0;
    while (!this.collide(piece, 0, offset + 1)) {
      offset += 1;
    }
    return offset;
  }

  hardDrop() {
    const dist = this.getDropDistance(this.currentPiece);
    if (dist <= 0) {
      this.lockPiece();
      return;
    }
    this.currentPiece.y += dist;
    this.score += dist * 2;
    this.updateHUD();
    this.lockPiece();
  }

  softDrop() {
    if (!this.collide(this.currentPiece, 0, 1)) {
      this.currentPiece.y += 1;
      this.score += 1;
      this.updateHUD();
      return;
    }
    this.lockPiece();
  }

  lockPiece() {
    this.mergePiece();
    const fullRows = this.getFullRows();

    if (fullRows.length && this.lineAnimEnabled) {
      this.lineClearEffect = {
        rows: fullRows,
        elapsed: 0,
        duration: 140
      };
      return;
    }

    if (fullRows.length) {
      this.applyLineClear(fullRows);
    }

    this.spawnPiece();
  }

  startGame() {
    if (this.gameOver) {
      return;
    }
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.paused = false;
      this.ui.setState('进行中');
    }
  }

  togglePause() {
    if (!this.gameStarted || this.gameOver) {
      return;
    }
    this.paused = !this.paused;
    this.ui.setState(this.paused ? '已暂停（按 P 继续）' : '进行中');
  }

  onAction(action) {
    switch (action) {
      case 'restart':
        this.reset();
        return;
      case 'pause_toggle':
        this.togglePause();
        return;
      case 'start_or_primary':
        if (!this.gameStarted) {
          this.startGame();
        } else if (!this.paused && !this.gameOver && !this.lineClearEffect) {
          this.hardDrop();
        }
        return;
      default:
        break;
    }

    if (!this.gameStarted || this.paused || this.gameOver || this.lineClearEffect) {
      return;
    }

    switch (action) {
      case 'move_left':
        this.movePiece(-1);
        break;
      case 'move_right':
        this.movePiece(1);
        break;
      case 'soft_drop':
        this.softDrop();
        break;
      case 'rotate':
        this.rotatePiece();
        break;
      case 'hard_drop':
        this.hardDrop();
        break;
      default:
        break;
    }
  }

  onKeyDown(event) {
    const keyMap = {
      KeyR: 'restart',
      Space: 'start_or_primary',
      KeyP: 'pause_toggle',
      ArrowLeft: 'move_left',
      ArrowRight: 'move_right',
      ArrowDown: 'soft_drop',
      ArrowUp: 'rotate'
    };

    const action = keyMap[event.code];
    if (!action) {
      return;
    }

    if (event.code === 'Space' || event.code.startsWith('Arrow')) {
      event.preventDefault();
    }

    this.onAction(action);
  }

  hexToRgba(hex, alpha) {
    const parsed = hex.replace('#', '');
    const r = Number.parseInt(parsed.slice(0, 2), 16);
    const g = Number.parseInt(parsed.slice(2, 4), 16);
    const b = Number.parseInt(parsed.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  drawCell(ctx, x, y, color, size = this.BLOCK) {
    const px = x * size;
    const py = y * size;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(px + 2, py + 2, size - 4, 6);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
  }

  drawBoard() {
    mainCtx.fillStyle = '#0f1320';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    for (let y = 0; y < this.ROWS; y += 1) {
      for (let x = 0; x < this.COLS; x += 1) {
        const type = this.board[y][x];
        if (type) {
          this.drawCell(mainCtx, x, y, this.colors[type]);
        }
      }
    }
  }

  drawGrid() {
    mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    for (let x = 0; x <= this.COLS; x += 1) {
      mainCtx.beginPath();
      mainCtx.moveTo(x * this.BLOCK + 0.5, 0);
      mainCtx.lineTo(x * this.BLOCK + 0.5, this.ROWS * this.BLOCK);
      mainCtx.stroke();
    }

    for (let y = 0; y <= this.ROWS; y += 1) {
      mainCtx.beginPath();
      mainCtx.moveTo(0, y * this.BLOCK + 0.5);
      mainCtx.lineTo(this.COLS * this.BLOCK, y * this.BLOCK + 0.5);
      mainCtx.stroke();
    }
  }

  drawGhostPiece() {
    if (!this.ghostEnabled || this.gameOver || this.lineClearEffect) {
      return;
    }

    const dist = this.getDropDistance(this.currentPiece);
    if (dist <= 0) {
      return;
    }

    const ghostY = this.currentPiece.y + dist;
    const color = this.hexToRgba(this.colors[this.currentPiece.type], 0.22);
    const border = this.hexToRgba(this.colors[this.currentPiece.type], 0.62);

    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) {
          return;
        }
        const drawY = ghostY + y;
        if (drawY < 0) {
          return;
        }

        const px = (this.currentPiece.x + x) * this.BLOCK;
        const py = drawY * this.BLOCK;
        mainCtx.fillStyle = color;
        mainCtx.fillRect(px + 2, py + 2, this.BLOCK - 4, this.BLOCK - 4);

        mainCtx.strokeStyle = border;
        mainCtx.strokeRect(px + 1.5, py + 1.5, this.BLOCK - 3, this.BLOCK - 3);
      });
    });
  }

  drawCurrentPiece() {
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) {
          return;
        }
        const drawY = this.currentPiece.y + y;
        if (drawY >= 0) {
          this.drawCell(mainCtx, this.currentPiece.x + x, drawY, this.colors[this.currentPiece.type]);
        }
      });
    });
  }

  drawLineClearEffect() {
    if (!this.lineClearEffect) {
      return;
    }

    const progress = Math.min(1, this.lineClearEffect.elapsed / this.lineClearEffect.duration);
    const alpha = 0.18 + Math.abs(Math.sin(progress * Math.PI * 6)) * 0.62;

    this.lineClearEffect.rows.forEach((row) => {
      for (let x = 0; x < this.COLS; x += 1) {
        const px = x * this.BLOCK;
        const py = row * this.BLOCK;
        mainCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        mainCtx.fillRect(px + 1, py + 1, this.BLOCK - 2, this.BLOCK - 2);
      }
    });
  }

  drawNextPiece() {
    nextCtx.fillStyle = '#0f1320';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const previewBlock = 24;
    const shape = this.nextPiece.shape;
    const offsetX = (nextCanvas.width - shape[0].length * previewBlock) / 2;
    const offsetY = (nextCanvas.height - shape.length * previewBlock) / 2;

    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) {
          return;
        }
        const px = offsetX + x * previewBlock;
        const py = offsetY + y * previewBlock;
        nextCtx.fillStyle = this.colors[this.nextPiece.type];
        nextCtx.fillRect(px, py, previewBlock, previewBlock);
        nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        nextCtx.strokeRect(px + 0.5, py + 0.5, previewBlock - 1, previewBlock - 1);
      });
    });
  }

  draw() {
    this.drawBoard();
    this.drawGhostPiece();
    this.drawGrid();
    if (!this.gameOver) {
      this.drawCurrentPiece();
    }
    this.drawLineClearEffect();
    this.drawNextPiece();
  }

  update(delta) {
    if (this.lineClearEffect) {
      this.lineClearEffect.elapsed += delta;
      if (this.lineClearEffect.elapsed >= this.lineClearEffect.duration) {
        this.applyLineClear(this.lineClearEffect.rows);
        this.lineClearEffect = null;
        this.spawnPiece();
      }
    }

    if (this.gameStarted && !this.paused && !this.gameOver && !this.lineClearEffect) {
      this.dropCounter += delta;
      if (this.dropCounter >= this.dropInterval) {
        this.softDrop();
        this.dropCounter = 0;
      }
    }

    this.draw();
  }
}
  window.GameHub.games.TetrisGame = TetrisGame;
})();
