(function initMinesweeperGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};
  const { mainCanvas, mainCtx } = window.GameHub.refs;
  const ui = window.GameHub.ui;
class MinesweeperGame {
  constructor(uiRef) {
    this.ui = uiRef;
    this.cols = 12;
    this.rows = 12;
    this.cell = 36;
    this.mines = 22;
    this.reset();
  }

  enter() {
    this.ui.setCanvasSize(this.cols * this.cell, this.rows * this.cell);
    this.ui.showNextCanvas(false);
    this.ui.setSettings([]);
    this.ui.setControls([
      '鼠标左键：翻开格子',
      '鼠标右键：插旗/取消旗帜',
      '移动端：用下方按钮切换翻开/插旗模式',
      'R：重新开始'
    ]);
    this.reset();
  }

  exit() { }

  reset() {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        count: 0
      }))
    );
    this.started = false;
    this.ended = false;
    this.won = false;
    this.flags = 0;
    this.elapsed = 0;
    this.mobileMode = 'reveal';
    this.updateHUD();
    this.ui.setState('左键翻开，右键插旗');
    this.draw();
  }

  updateHUD() {
    const remaining = this.mines - this.flags;
    this.ui.setStatus([
      { label: '总雷数', value: this.mines },
      { label: '已插旗', value: this.flags },
      { label: '剩余推测雷', value: remaining },
      { label: '用时(秒)', value: Math.floor(this.elapsed / 1000) }
    ]);
  }

  inRange(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  neighbors(x, y) {
    const list = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        const nx = x + dx;
        const ny = y + dy;
        if (this.inRange(nx, ny)) {
          list.push({ x: nx, y: ny });
        }
      }
    }
    return list;
  }

  placeMines(safeX, safeY) {
    let placed = 0;
    while (placed < this.mines) {
      const x = Math.floor(Math.random() * this.cols);
      const y = Math.floor(Math.random() * this.rows);
      if ((x === safeX && y === safeY) || this.board[y][x].mine) {
        continue;
      }
      this.board[y][x].mine = true;
      placed += 1;
    }

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        if (this.board[y][x].mine) {
          continue;
        }
        const count = this.neighbors(x, y).filter((n) => this.board[n.y][n.x].mine).length;
        this.board[y][x].count = count;
      }
    }
  }

  revealCell(startX, startY) {
    const queue = [{ x: startX, y: startY }];
    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const cell = this.board[y][x];
      if (cell.revealed || cell.flagged) {
        continue;
      }
      cell.revealed = true;

      if (cell.count === 0 && !cell.mine) {
        this.neighbors(x, y).forEach((n) => {
          const target = this.board[n.y][n.x];
          if (!target.revealed && !target.flagged) {
            queue.push(n);
          }
        });
      }
    }
  }

  revealAllMines() {
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        if (this.board[y][x].mine) {
          this.board[y][x].revealed = true;
        }
      }
    }
  }

  checkWin() {
    let revealedSafe = 0;
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        const cell = this.board[y][x];
        if (!cell.mine && cell.revealed) {
          revealedSafe += 1;
        }
      }
    }

    if (revealedSafe === this.rows * this.cols - this.mines) {
      this.ended = true;
      this.won = true;
      this.ui.setState('你赢了，按 R 再来一局');
    }
  }

  pointToCell(event) {
    const rect = mainCanvas.getBoundingClientRect();
    const px = ((event.clientX - rect.left) * mainCanvas.width) / rect.width;
    const py = ((event.clientY - rect.top) * mainCanvas.height) / rect.height;
    return {
      x: Math.floor(px / this.cell),
      y: Math.floor(py / this.cell)
    };
  }

  onPointerDown(event) {
    if (event.button !== 0 && event.button !== 2) {
      return;
    }

    const { x, y } = this.pointToCell(event);
    if (!this.inRange(x, y) || this.ended) {
      return;
    }

    const cell = this.board[y][x];

    const useFlagAction = event.button === 2 || (event.button === 0 && this.mobileMode === 'flag');

    if (useFlagAction) {
      if (cell.revealed) {
        return;
      }
      cell.flagged = !cell.flagged;
      this.flags += cell.flagged ? 1 : -1;
      this.updateHUD();
      return;
    }

    if (cell.flagged) {
      return;
    }

    if (!this.started) {
      this.placeMines(x, y);
      this.started = true;
    }

    if (cell.mine) {
      cell.revealed = true;
      this.revealAllMines();
      this.ended = true;
      this.won = false;
      this.ui.setState('踩雷了，按 R 重新开始');
      this.updateHUD();
      return;
    }

    this.revealCell(x, y);
    this.checkWin();
    this.updateHUD();
  }

  onContextMenu(event) {
    event.preventDefault();
  }

  onKeyDown(event) {
    if (event.code === 'KeyR') {
      this.onAction('restart');
    }
  }

  onAction(action) {
    switch (action) {
      case 'restart':
        this.reset();
        break;
      case 'mode_reveal':
        this.mobileMode = 'reveal';
        if (!this.ended) {
          this.ui.setState('当前模式：翻开');
        }
        break;
      case 'mode_flag':
        this.mobileMode = 'flag';
        if (!this.ended) {
          this.ui.setState('当前模式：插旗');
        }
        break;
      default:
        break;
    }
  }

  drawNumber(x, y, count) {
    const colors = {
      1: '#7dd3fc',
      2: '#86efac',
      3: '#fca5a5',
      4: '#c4b5fd',
      5: '#f9a8d4',
      6: '#67e8f9',
      7: '#e5e7eb',
      8: '#fcd34d'
    };
    mainCtx.fillStyle = colors[count] || '#d1d5db';
    mainCtx.font = 'bold 18px sans-serif';
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    mainCtx.fillText(String(count), x * this.cell + this.cell / 2, y * this.cell + this.cell / 2);
  }

  draw() {
    mainCtx.fillStyle = '#101521';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        const cell = this.board[y][x];
        const px = x * this.cell;
        const py = y * this.cell;

        if (cell.revealed) {
          mainCtx.fillStyle = cell.mine ? '#b91c1c' : '#1f2937';
        } else {
          mainCtx.fillStyle = '#2a3348';
        }
        mainCtx.fillRect(px + 1, py + 1, this.cell - 2, this.cell - 2);

        if (cell.flagged && !cell.revealed) {
          mainCtx.fillStyle = '#f59e0b';
          mainCtx.beginPath();
          mainCtx.moveTo(px + 9, py + 8);
          mainCtx.lineTo(px + 25, py + 14);
          mainCtx.lineTo(px + 9, py + 20);
          mainCtx.closePath();
          mainCtx.fill();
          mainCtx.strokeStyle = '#fef3c7';
          mainCtx.beginPath();
          mainCtx.moveTo(px + 9, py + 7);
          mainCtx.lineTo(px + 9, py + 27);
          mainCtx.stroke();
        }

        if (cell.revealed && cell.mine) {
          mainCtx.fillStyle = '#111827';
          mainCtx.beginPath();
          mainCtx.arc(px + this.cell / 2, py + this.cell / 2, 8, 0, Math.PI * 2);
          mainCtx.fill();
        }

        if (cell.revealed && !cell.mine && cell.count > 0) {
          this.drawNumber(x, y, cell.count);
        }
      }
    }

    mainCtx.strokeStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i <= this.cols; i += 1) {
      const p = i * this.cell + 0.5;
      mainCtx.beginPath();
      mainCtx.moveTo(p, 0);
      mainCtx.lineTo(p, mainCanvas.height);
      mainCtx.stroke();
    }
    for (let i = 0; i <= this.rows; i += 1) {
      const p = i * this.cell + 0.5;
      mainCtx.beginPath();
      mainCtx.moveTo(0, p);
      mainCtx.lineTo(mainCanvas.width, p);
      mainCtx.stroke();
    }
  }

  update(delta) {
    if (this.started && !this.ended) {
      this.elapsed += delta;
      this.updateHUD();
    }
    this.draw();
  }
}
  window.GameHub.games.MinesweeperGame = MinesweeperGame;
})();
