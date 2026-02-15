(function initMinesweeperGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};

  const { mainCanvas, mainCtx } = window.GameHub.refs;

  const PRESETS = {
    BEGINNER: {
      label: '初级 9x9 10雷',
      cols: 9,
      rows: 9,
      mines: 10,
      cell: 38
    },
    INTERMEDIATE: {
      label: '中级 16x16 40雷',
      cols: 16,
      rows: 16,
      mines: 40,
      cell: 30
    },
    EXPERT: {
      label: '高级 30x16 99雷',
      cols: 30,
      rows: 16,
      mines: 99,
      cell: 24
    }
  };

  const PRESET_ORDER = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];

  const NUMBER_COLORS = {
    1: '#0000ff',
    2: '#008200',
    3: '#ff0000',
    4: '#000084',
    5: '#840000',
    6: '#008284',
    7: '#000000',
    8: '#808080'
  };

  class MinesweeperGame {
    constructor(uiRef) {
      this.ui = uiRef;
      this.difficultyKey = 'BEGINNER';
      this.customConfig = null;
      this.allowQuestionMarks = true;
      this.mobileMode = 'reveal';
      this.applyDifficultyConfig();
      this.reset();
    }

    enter() {
      this.ui.showNextCanvas(false);
      this.updateSettings();
      this.ui.setControls([
        '左键翻开，右键循环：旗子 -> 问号 -> 空白',
        '中键或已翻开的数字格可执行快开(chord)',
        '首击安全：第一下翻开不会直接踩雷',
        '1/2/3：初级/中级/高级，C：自定义(9-30列, 9-24行)，R：重开',
        '移动端：切换翻开/标记/快开模式后点击画布'
      ]);
      this.reset();
    }

    exit() { }

    applyDifficultyConfig() {
      const cfg = this.difficultyKey === 'CUSTOM'
        ? this.customConfig
        : PRESETS[this.difficultyKey];

      const fallback = PRESETS.BEGINNER;
      const config = cfg || fallback;

      this.cols = config.cols;
      this.rows = config.rows;
      this.mines = config.mines;
      this.cell = config.cell;
    }

    difficultyLabel() {
      if (this.difficultyKey === 'CUSTOM') {
        return `自定义 ${this.cols}x${this.rows} ${this.mines}雷`;
      }
      return PRESETS[this.difficultyKey].label;
    }

    updateSettings() {
      this.ui.setSettings([
        {
          label: `难度：${this.difficultyLabel()}`,
          enabled: true,
          onToggle: () => {
            this.onAction('cycle_difficulty');
          }
        },
        {
          label: '问号标记',
          enabled: this.allowQuestionMarks,
          onToggle: () => {
            this.onAction('toggle_question_marks');
          }
        }
      ]);
    }

    createCell() {
      return {
        mine: false,
        revealed: false,
        mark: 'none',
        count: 0,
        exploded: false,
        wrongFlag: false
      };
    }

    reset() {
      this.board = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.cols }, () => this.createCell())
      );
      this.started = false;
      this.ended = false;
      this.won = false;
      this.flags = 0;
      this.elapsed = 0;
      this.hudTicker = 0;
      this.mobileMode = 'reveal';
      this.ui.setCanvasSize(this.cols * this.cell, this.rows * this.cell);
      this.updateHUD();
      this.ui.setState(`难度：${this.difficultyLabel()}，左键翻开`);
      this.draw();
    }

    updateHUD() {
      this.ui.setStatus([
        { label: '难度', value: this.difficultyLabel() },
        { label: '总雷数', value: this.mines },
        { label: '已插旗', value: this.flags },
        { label: '剩余推测雷', value: this.mines - this.flags },
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

    placeMines(firstClickSafeX, firstClickSafeY) {
      const candidates = [];
      const isInSafeZone = (x, y) => (
        Math.abs(x - firstClickSafeX) <= 1 && Math.abs(y - firstClickSafeY) <= 1
      );

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          // Win7-style start: first click opens a safe blank area.
          if (isInSafeZone(x, y)) {
            continue;
          }
          candidates.push({ x: x, y: y });
        }
      }

      // Fallback for very dense custom maps: at least keep first click safe.
      if (candidates.length < this.mines) {
        candidates.length = 0;
        for (let y = 0; y < this.rows; y += 1) {
          for (let x = 0; x < this.cols; x += 1) {
            if (x === firstClickSafeX && y === firstClickSafeY) {
              continue;
            }
            candidates.push({ x: x, y: y });
          }
        }
      }

      for (let i = candidates.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = temp;
      }

      for (let i = 0; i < this.mines; i += 1) {
        const cell = candidates[i];
        this.board[cell.y][cell.x].mine = true;
      }

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          const current = this.board[y][x];
          if (current.mine) {
            continue;
          }
          current.count = this.neighbors(x, y)
            .filter((n) => this.board[n.y][n.x].mine)
            .length;
        }
      }
    }

    floodReveal(startX, startY) {
      const queue = [{ x: startX, y: startY }];
      for (let i = 0; i < queue.length; i += 1) {
        const { x, y } = queue[i];
        if (!this.inRange(x, y)) {
          continue;
        }

        const cell = this.board[y][x];
        if (cell.revealed || cell.mark === 'flag') {
          continue;
        }

        if (cell.mark === 'question') {
          cell.mark = 'none';
        }

        cell.revealed = true;
        if (cell.mine || cell.count > 0) {
          continue;
        }

        this.neighbors(x, y).forEach((n) => {
          const target = this.board[n.y][n.x];
          if (!target.revealed && target.mark !== 'flag') {
            queue.push(n);
          }
        });
      }
    }

    lose(explodeX, explodeY, fromChord) {
      this.ended = true;
      this.won = false;

      if (this.inRange(explodeX, explodeY)) {
        this.board[explodeY][explodeX].exploded = true;
      }

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          const cell = this.board[y][x];
          if (cell.mine) {
            cell.revealed = true;
          } else if (cell.mark === 'flag') {
            cell.wrongFlag = true;
          }
        }
      }

      this.ui.setState(fromChord
        ? '快开失败，踩雷了，按 R 重新开始'
        : '踩雷了，按 R 重新开始');
      this.updateHUD();
    }

    checkWin() {
      if (this.ended) {
        return;
      }

      let revealedSafe = 0;
      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          const cell = this.board[y][x];
          if (!cell.mine && cell.revealed) {
            revealedSafe += 1;
          }
        }
      }

      if (revealedSafe !== this.rows * this.cols - this.mines) {
        return;
      }

      this.ended = true;
      this.won = true;

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          const cell = this.board[y][x];
          if (!cell.mine) {
            continue;
          }
          cell.mark = 'flag';
        }
      }

      this.flags = this.mines;
      this.ui.setState('你赢了，按 R 再来一局');
      this.updateHUD();
    }

    cycleMark(x, y) {
      const cell = this.board[y][x];
      if (cell.revealed) {
        return;
      }

      if (cell.mark === 'none') {
        cell.mark = 'flag';
        this.flags += 1;
      } else if (cell.mark === 'flag') {
        this.flags -= 1;
        cell.mark = this.allowQuestionMarks ? 'question' : 'none';
      } else {
        cell.mark = 'none';
      }

      this.updateHUD();
    }

    revealCell(x, y) {
      const cell = this.board[y][x];
      if (cell.revealed) {
        this.tryChord(x, y);
        return;
      }
      if (cell.mark === 'flag') {
        return;
      }

      if (!this.started) {
        this.placeMines(x, y);
        this.started = true;
      }

      if (cell.mine) {
        this.lose(x, y, false);
        return;
      }

      this.floodReveal(x, y);
      this.checkWin();
      this.updateHUD();
    }

    tryChord(x, y) {
      const cell = this.board[y][x];
      if (!cell.revealed || cell.count <= 0 || this.ended) {
        return;
      }

      const around = this.neighbors(x, y);
      const flaggedCount = around
        .filter((n) => this.board[n.y][n.x].mark === 'flag')
        .length;

      if (flaggedCount !== cell.count) {
        return;
      }

      let exploded = null;
      around.forEach((n) => {
        if (exploded) {
          return;
        }

        const target = this.board[n.y][n.x];
        if (target.revealed || target.mark === 'flag') {
          return;
        }

        if (target.mine) {
          exploded = { x: n.x, y: n.y };
          return;
        }

        this.floodReveal(n.x, n.y);
      });

      if (exploded) {
        this.lose(exploded.x, exploded.y, true);
        return;
      }

      this.checkWin();
      this.updateHUD();
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

    setDifficulty(nextKey) {
      if (!PRESETS[nextKey]) {
        return;
      }
      this.difficultyKey = nextKey;
      this.customConfig = null;
      this.applyDifficultyConfig();
      this.updateSettings();
      this.reset();
    }

    cycleDifficulty() {
      const currentIndex = PRESET_ORDER.indexOf(this.difficultyKey);
      if (currentIndex < 0) {
        this.setDifficulty(PRESET_ORDER[0]);
        return;
      }
      const next = PRESET_ORDER[(currentIndex + 1) % PRESET_ORDER.length];
      this.setDifficulty(next);
    }

    computeCustomCell(cols) {
      const byWidth = Math.floor(760 / cols);
      return Math.max(16, Math.min(42, byWidth));
    }

    useCustomDifficulty(cols, rows, mines) {
      if (cols < 9 || cols > 30 || rows < 9 || rows > 24) {
        this.ui.setState('自定义失败：列/行范围应在 9-30 与 9-24');
        return;
      }

      const maxMines = Math.min(cols * rows - 1, 668);
      if (mines < 1 || mines > maxMines) {
        this.ui.setState(`自定义失败：雷数需在 1 到 ${maxMines}`);
        return;
      }

      this.customConfig = {
        cols: cols,
        rows: rows,
        mines: mines,
        cell: this.computeCustomCell(cols)
      };
      this.difficultyKey = 'CUSTOM';
      this.applyDifficultyConfig();
      this.updateSettings();
      this.reset();
    }

    promptCustomDifficulty() {
      const currentCols = String(this.cols);
      const currentRows = String(this.rows);
      const currentMines = String(this.mines);

      const colsInput = window.prompt('自定义列数 (9-30)', currentCols);
      if (colsInput === null) {
        return;
      }
      const rowsInput = window.prompt('自定义行数 (9-24)', currentRows);
      if (rowsInput === null) {
        return;
      }
      const minesInput = window.prompt('自定义雷数 (1 到上限，最高 668)', currentMines);
      if (minesInput === null) {
        return;
      }

      const cols = Number.parseInt(colsInput, 10);
      const rows = Number.parseInt(rowsInput, 10);
      const mines = Number.parseInt(minesInput, 10);

      if (Number.isNaN(cols) || Number.isNaN(rows) || Number.isNaN(mines)) {
        this.ui.setState('自定义失败：请输入整数');
        return;
      }

      this.useCustomDifficulty(cols, rows, mines);
    }

    onPointerDown(event) {
      if (event.button !== 0 && event.button !== 1 && event.button !== 2) {
        return;
      }

      const { x, y } = this.pointToCell(event);
      if (!this.inRange(x, y) || this.ended) {
        return;
      }

      if (event.button === 2) {
        this.cycleMark(x, y);
        return;
      }

      if (event.button === 1) {
        this.tryChord(x, y);
        return;
      }

      if (this.mobileMode === 'flag') {
        this.cycleMark(x, y);
        return;
      }

      if (this.mobileMode === 'chord') {
        this.tryChord(x, y);
        return;
      }

      this.revealCell(x, y);
    }

    onContextMenu(event) {
      event.preventDefault();
    }

    onKeyDown(event) {
      switch (event.code) {
        case 'KeyR':
          this.onAction('restart');
          break;
        case 'Digit1':
          this.onAction('difficulty_beginner');
          break;
        case 'Digit2':
          this.onAction('difficulty_intermediate');
          break;
        case 'Digit3':
          this.onAction('difficulty_expert');
          break;
        case 'KeyC':
          this.onAction('difficulty_custom');
          break;
        case 'KeyQ':
          this.onAction('toggle_question_marks');
          break;
        default:
          break;
      }
    }

    onAction(action) {
      switch (action) {
        case 'restart':
        case 'double_tap_restart':
          this.reset();
          break;
        case 'primary_tap':
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
            this.ui.setState('当前模式：标记');
          }
          break;
        case 'mode_chord':
          this.mobileMode = 'chord';
          if (!this.ended) {
            this.ui.setState('当前模式：快开');
          }
          break;
        case 'difficulty_beginner':
          this.setDifficulty('BEGINNER');
          break;
        case 'difficulty_intermediate':
          this.setDifficulty('INTERMEDIATE');
          break;
        case 'difficulty_expert':
          this.setDifficulty('EXPERT');
          break;
        case 'difficulty_custom':
          this.promptCustomDifficulty();
          break;
        case 'cycle_difficulty':
          this.cycleDifficulty();
          break;
        case 'toggle_question_marks':
          this.allowQuestionMarks = !this.allowQuestionMarks;
          if (!this.allowQuestionMarks) {
            for (let y = 0; y < this.rows; y += 1) {
              for (let x = 0; x < this.cols; x += 1) {
                const cell = this.board[y][x];
                if (cell.mark === 'question') {
                  cell.mark = 'none';
                }
              }
            }
          }
          this.updateSettings();
          this.updateHUD();
          break;
        default:
          break;
      }
    }

    drawHiddenCell(px, py) {
      const size = this.cell;
      mainCtx.fillStyle = '#c0c0c0';
      mainCtx.fillRect(px, py, size, size);

      mainCtx.strokeStyle = '#ffffff';
      mainCtx.beginPath();
      mainCtx.moveTo(px + 0.5, py + size - 0.5);
      mainCtx.lineTo(px + 0.5, py + 0.5);
      mainCtx.lineTo(px + size - 0.5, py + 0.5);
      mainCtx.stroke();

      mainCtx.strokeStyle = '#808080';
      mainCtx.beginPath();
      mainCtx.moveTo(px + size - 0.5, py + 0.5);
      mainCtx.lineTo(px + size - 0.5, py + size - 0.5);
      mainCtx.lineTo(px + 0.5, py + size - 0.5);
      mainCtx.stroke();

      mainCtx.strokeStyle = '#404040';
      mainCtx.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
    }

    drawMine(px, py) {
      const cx = px + this.cell / 2;
      const cy = py + this.cell / 2;
      const r = Math.max(4, Math.floor(this.cell * 0.18));

      mainCtx.fillStyle = '#111111';
      mainCtx.beginPath();
      mainCtx.arc(cx, cy, r, 0, Math.PI * 2);
      mainCtx.fill();

      mainCtx.strokeStyle = '#111111';
      mainCtx.lineWidth = 2;
      mainCtx.beginPath();
      mainCtx.moveTo(cx - r - 4, cy);
      mainCtx.lineTo(cx + r + 4, cy);
      mainCtx.moveTo(cx, cy - r - 4);
      mainCtx.lineTo(cx, cy + r + 4);
      mainCtx.moveTo(cx - r - 3, cy - r - 3);
      mainCtx.lineTo(cx + r + 3, cy + r + 3);
      mainCtx.moveTo(cx + r + 3, cy - r - 3);
      mainCtx.lineTo(cx - r - 3, cy + r + 3);
      mainCtx.stroke();
      mainCtx.lineWidth = 1;
    }

    drawFlag(px, py) {
      const poleX = px + Math.floor(this.cell * 0.36);
      const poleTop = py + Math.floor(this.cell * 0.2);
      const poleBottom = py + Math.floor(this.cell * 0.78);

      mainCtx.strokeStyle = '#111111';
      mainCtx.lineWidth = 2;
      mainCtx.beginPath();
      mainCtx.moveTo(poleX, poleTop);
      mainCtx.lineTo(poleX, poleBottom);
      mainCtx.stroke();

      mainCtx.fillStyle = '#d71a21';
      mainCtx.beginPath();
      mainCtx.moveTo(poleX + 1, poleTop);
      mainCtx.lineTo(poleX + Math.floor(this.cell * 0.32), poleTop + Math.floor(this.cell * 0.14));
      mainCtx.lineTo(poleX + 1, poleTop + Math.floor(this.cell * 0.28));
      mainCtx.closePath();
      mainCtx.fill();

      mainCtx.strokeStyle = '#111111';
      mainCtx.beginPath();
      mainCtx.moveTo(poleX - Math.floor(this.cell * 0.2), poleBottom);
      mainCtx.lineTo(poleX + Math.floor(this.cell * 0.2), poleBottom);
      mainCtx.stroke();
      mainCtx.lineWidth = 1;
    }

    drawQuestionMark(px, py) {
      mainCtx.fillStyle = '#111111';
      mainCtx.font = `bold ${Math.floor(this.cell * 0.6)}px sans-serif`;
      mainCtx.textAlign = 'center';
      mainCtx.textBaseline = 'middle';
      mainCtx.fillText('?', px + this.cell / 2, py + this.cell / 2 + 1);
    }

    drawWrongFlag(px, py) {
      mainCtx.strokeStyle = '#d71a21';
      mainCtx.lineWidth = 2;
      mainCtx.beginPath();
      mainCtx.moveTo(px + 4, py + 4);
      mainCtx.lineTo(px + this.cell - 4, py + this.cell - 4);
      mainCtx.moveTo(px + this.cell - 4, py + 4);
      mainCtx.lineTo(px + 4, py + this.cell - 4);
      mainCtx.stroke();
      mainCtx.lineWidth = 1;
    }

    drawCell(x, y) {
      const cell = this.board[y][x];
      const px = x * this.cell;
      const py = y * this.cell;

      if (cell.revealed) {
        mainCtx.fillStyle = cell.exploded ? '#ff5a5a' : '#c0c0c0';
        mainCtx.fillRect(px, py, this.cell, this.cell);
        mainCtx.strokeStyle = '#9a9a9a';
        mainCtx.strokeRect(px + 0.5, py + 0.5, this.cell - 1, this.cell - 1);

        if (cell.mine) {
          this.drawMine(px, py);
        } else if (cell.count > 0) {
          mainCtx.fillStyle = NUMBER_COLORS[cell.count] || '#111111';
          mainCtx.font = `bold ${Math.floor(this.cell * 0.62)}px sans-serif`;
          mainCtx.textAlign = 'center';
          mainCtx.textBaseline = 'middle';
          mainCtx.fillText(String(cell.count), px + this.cell / 2, py + this.cell / 2 + 1);
        }

        if (cell.wrongFlag) {
          this.drawWrongFlag(px, py);
        }
        return;
      }

      this.drawHiddenCell(px, py);
      if (cell.mark === 'flag') {
        this.drawFlag(px, py);
      } else if (cell.mark === 'question') {
        this.drawQuestionMark(px, py);
      }

      if (cell.wrongFlag) {
        this.drawWrongFlag(px, py);
      }
    }

    draw() {
      mainCtx.fillStyle = '#808080';
      mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          this.drawCell(x, y);
        }
      }
    }

    update(delta) {
      if (this.started && !this.ended) {
        this.elapsed += delta;
        this.hudTicker += delta;
        if (this.hudTicker >= 220) {
          this.hudTicker = 0;
          this.updateHUD();
        }
      }
      this.draw();
    }
  }

  window.GameHub.games.MinesweeperGame = MinesweeperGame;
})();
