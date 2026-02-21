(function initTetrisGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};

  const {
    mainCanvas,
    mainCtx,
    nextCanvas,
    nextCtx,
    holdCanvas,
    holdCtx
  } = window.GameHub.refs;

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

      this.keybindStorageKey = 'gamehub.tetris.keybinds';
      this.dasStorageKey = 'gamehub.tetris.das_frames';

      this.desktopActionLabels = {
        start_or_primary: '开始/主操作',
        pause_toggle: '暂停',
        restart: '重开',
        move_left: '左移',
        move_right: '右移',
        soft_drop: '软降',
        hard_drop: '硬降',
        rotate: '右旋',
        rotate_ccw: '左旋',
        hold: '暂存 Hold'
      };

      this.repeatActions = ['move_left', 'move_right', 'soft_drop'];
      this.arrFrames = 2;
      this.dasFrames = this.loadDasFrames();
      this.keyBindings = this.loadKeyBindings();
      this.rebindAction = null;

      this.heldActions = {
        move_left: this.createHeldActionState(),
        move_right: this.createHeldActionState(),
        soft_drop: this.createHeldActionState()
      };

      this.reset();
    }

    isDesktopMode() {
      return !window.matchMedia('(pointer: coarse)').matches;
    }

    createHeldActionState() {
      return {
        pressed: false,
        dasElapsed: 0,
        arrElapsed: 0
      };
    }

    clearHeldActions() {
      this.repeatActions.forEach((action) => {
        const state = this.heldActions[action];
        state.pressed = false;
        state.dasElapsed = 0;
        state.arrElapsed = 0;
      });
    }

    defaultKeyBindings() {
      return {
        start_or_primary: 'Enter',
        pause_toggle: 'KeyP',
        restart: 'KeyR',
        move_left: 'ArrowLeft',
        move_right: 'ArrowRight',
        soft_drop: 'ArrowDown',
        hard_drop: 'Space',
        rotate: 'ArrowUp',
        rotate_ccw: 'KeyZ',
        hold: 'KeyC'
      };
    }

    loadDasFrames() {
      const fallback = 8;
      try {
        const raw = window.localStorage.getItem(this.dasStorageKey);
        if (!raw) {
          return fallback;
        }
        const parsed = Number.parseInt(raw, 10);
        if (!Number.isFinite(parsed)) {
          return fallback;
        }
        return Math.max(2, Math.min(20, parsed));
      } catch (error) {
        return fallback;
      }
    }

    saveDasFrames() {
      try {
        window.localStorage.setItem(this.dasStorageKey, String(this.dasFrames));
      } catch (error) {
        // Ignore storage failures.
      }
    }

    cycleDasFrames() {
      const candidates = [2, 4, 6, 8, 10, 12, 15, 18, 20];
      const idx = candidates.indexOf(this.dasFrames);
      this.dasFrames = candidates[(idx + 1) % candidates.length];
      this.saveDasFrames();
      this.ui.setState(`键盘按键响应帧数(DAS/DSS)：${this.dasFrames}f`);
      this.renderSettings();
    }

    getDasMs() {
      return (this.dasFrames * 1000) / 60;
    }

    getArrMs() {
      return (this.arrFrames * 1000) / 60;
    }

    loadKeyBindings() {
      const defaults = this.defaultKeyBindings();
      try {
        const raw = window.localStorage.getItem(this.keybindStorageKey);
        if (!raw) {
          return { ...defaults };
        }

        const parsed = JSON.parse(raw);
        const next = { ...defaults };
        Object.keys(defaults).forEach((action) => {
          if (typeof parsed[action] === 'string' && parsed[action]) {
            next[action] = parsed[action];
          }
        });
        return next;
      } catch (error) {
        return { ...defaults };
      }
    }

    saveKeyBindings() {
      try {
        window.localStorage.setItem(this.keybindStorageKey, JSON.stringify(this.keyBindings));
      } catch (error) {
        // Ignore storage failures.
      }
    }

    resetKeyBindings() {
      this.keyBindings = this.defaultKeyBindings();
      this.saveKeyBindings();
      this.clearHeldActions();
      this.rebindAction = null;
      this.ui.setState('键位已恢复默认');
      this.renderSettings();
    }

    formatKeyCode(code) {
      if (!code) {
        return '未绑定';
      }

      const special = {
        Space: 'Space',
        Enter: 'Enter',
        ArrowLeft: '←',
        ArrowRight: '→',
        ArrowDown: '↓',
        ArrowUp: '↑',
        Escape: 'Esc'
      };
      if (special[code]) {
        return special[code];
      }

      if (code.startsWith('Key')) {
        return code.slice(3);
      }
      if (code.startsWith('Digit')) {
        return code.slice(5);
      }
      return code;
    }

    desktopRebindOrder() {
      return [
        'start_or_primary',
        'hard_drop',
        'hold',
        'rotate',
        'rotate_ccw',
        'move_left',
        'move_right',
        'soft_drop',
        'pause_toggle',
        'restart'
      ];
    }

    beginRebind(action) {
      if (!this.isDesktopMode()) {
        return;
      }

      this.rebindAction = action;
      this.clearHeldActions();
      this.ui.setState(`正在绑定「${this.desktopActionLabels[action]}」，请按键（Esc 取消）`);
      this.renderSettings();
    }

    cancelRebind() {
      if (!this.rebindAction) {
        return;
      }
      this.rebindAction = null;
      this.ui.setState('已取消键位绑定');
      this.renderSettings();
    }

    applyRebind(code) {
      const action = this.rebindAction;
      if (!action) {
        return;
      }

      Object.keys(this.keyBindings).forEach((key) => {
        if (key !== action && this.keyBindings[key] === code) {
          this.keyBindings[key] = '';
        }
      });

      this.keyBindings[action] = code;
      this.saveKeyBindings();
      this.rebindAction = null;
      this.ui.setState(`已绑定：${this.desktopActionLabels[action]} -> ${this.formatKeyCode(code)}`);
      this.renderSettings();
    }

    actionFromCode(code) {
      return Object.keys(this.keyBindings).find((action) => this.keyBindings[action] === code) || null;
    }

    isRepeatAction(action) {
      return this.repeatActions.includes(action);
    }

    renderSettings() {
      const defs = [
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
      ];

      if (this.isDesktopMode()) {
        defs.push({
          kind: 'action',
          enabled: true,
          label: `按键响应帧数(DAS/DSS)：${this.dasFrames}f`,
          onToggle: () => {
            this.cycleDasFrames();
          }
        });

        defs.push({
          kind: 'action',
          enabled: true,
          label: this.rebindAction
            ? `绑定中：${this.desktopActionLabels[this.rebindAction]}（点此取消）`
            : '自定义键位（点击下列项目）',
          onToggle: () => {
            if (this.rebindAction) {
              this.cancelRebind();
            }
          }
        });

        this.desktopRebindOrder().forEach((action) => {
          defs.push({
            kind: 'action',
            enabled: true,
            label: `${this.desktopActionLabels[action]}：${this.formatKeyCode(this.keyBindings[action])}`,
            onToggle: () => {
              this.beginRebind(action);
            }
          });
        });

        defs.push({
          kind: 'action',
          enabled: true,
          label: '恢复默认键位',
          onToggle: () => {
            this.resetKeyBindings();
          }
        });
      }

      this.ui.setSettings(defs);
    }

    enter() {
      this.ui.setCanvasSize(this.COLS * this.BLOCK, this.ROWS * this.BLOCK);
      this.ui.showNextCanvas(true);
      this.ui.showHoldCanvas(this.isDesktopMode());
      this.ui.setControls(this.isDesktopMode()
        ? [
          '电脑端：Enter 开始，Space 硬降，↑右旋，Z 左旋，C 暂存 Hold',
          '方向键：←/→移动，↓软降；P 暂停，R 重开',
          '可在“视觉设置”中自定义键位并调节按键响应帧数(DAS/DSS)',
          '点击画布：开始 / 游戏结束后重开'
        ]
        : [
          '移动端按钮：左/右/旋转/硬降',
          '点击画布：开始 / 游戏结束后重开',
          '电脑端支持左旋、Hold、自定义键位与DAS设置'
        ]);
      this.renderSettings();
      this.reset();
    }

    exit() {
      this.ui.showNextCanvas(false);
      this.ui.showHoldCanvas(false);
      this.ui.setSettings([]);
      this.clearHeldActions();
      this.rebindAction = null;
    }

    reset() {
      this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
      this.currentPiece = this.createPiece(this.randomType());
      this.nextPiece = this.createPiece(this.randomType());
      this.holdPieceType = null;
      this.holdUsed = false;
      this.score = 0;
      this.lines = 0;
      this.level = 1;
      this.dropInterval = 700;
      this.dropCounter = 0;
      this.gameStarted = false;
      this.gameOver = false;
      this.paused = false;
      this.lineClearEffect = null;
      this.clearHeldActions();
      this.updateHUD();
      this.ui.setState(this.isDesktopMode() ? '按 Enter 开始' : '点击画布或按空格开始');
      this.draw();
    }

    updateHUD() {
      this.ui.setStatus([
        { label: '分数', value: this.score },
        { label: '消行', value: this.lines },
        { label: '等级', value: this.level },
        { label: '暂存', value: this.holdPieceType || '-' }
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

    setGameOverState(message = '游戏结束，按 R 重新开始') {
      this.gameOver = true;
      this.gameStarted = false;
      this.clearHeldActions();
      this.ui.setState(message);
    }

    spawnPiece() {
      this.currentPiece = this.nextPiece;
      this.currentPiece.x = Math.floor(this.COLS / 2) - Math.ceil(this.currentPiece.shape[0].length / 2);
      this.currentPiece.y = -1;
      this.nextPiece = this.createPiece(this.randomType());
      this.holdUsed = false;

      if (this.collide(this.currentPiece)) {
        this.setGameOverState();
      }
    }

    rotate(matrix, clockwise = true) {
      const transposed = matrix[0].map((_, index) => matrix.map((row) => row[index]));
      if (clockwise) {
        return transposed.map((row) => row.reverse());
      }
      return transposed.reverse();
    }

    rotatePiece(clockwise = true) {
      const original = this.currentPiece.shape;
      this.currentPiece.shape = this.rotate(this.currentPiece.shape, clockwise);

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

    holdCurrentPiece() {
      if (this.holdUsed) {
        this.ui.setState('当前方块已使用过暂存，需落地后再次使用');
        return;
      }

      const currentType = this.currentPiece.type;
      if (!this.holdPieceType) {
        this.holdPieceType = currentType;
        this.spawnPiece();
        this.holdUsed = true;
        this.updateHUD();
        return;
      }

      const swapType = this.holdPieceType;
      this.holdPieceType = currentType;
      this.currentPiece = this.createPiece(swapType);
      this.holdUsed = true;

      if (this.collide(this.currentPiece)) {
        this.setGameOverState();
      }

      this.updateHUD();
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
      this.clearHeldActions();
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
          } else if (this.gameOver) {
            this.reset();
            this.startGame();
          }
          return;
        case 'primary_tap':
          if (!this.gameStarted) {
            this.startGame();
          } else if (this.gameOver) {
            this.reset();
            this.startGame();
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
          this.rotatePiece(true);
          break;
        case 'rotate_ccw':
          this.rotatePiece(false);
          break;
        case 'hard_drop':
          this.hardDrop();
          break;
        case 'hold':
          this.holdCurrentPiece();
          break;
        default:
          break;
      }
    }

    shouldPreventDefault(code) {
      return code.startsWith('Arrow') || code === 'Space' || code === 'Enter';
    }

    onKeyDown(event) {
      if (!this.isDesktopMode()) {
        return;
      }

      if (this.rebindAction) {
        event.preventDefault();
        if (event.code === 'Escape') {
          this.cancelRebind();
        } else {
          this.applyRebind(event.code);
        }
        return;
      }

      const action = this.actionFromCode(event.code);
      if (!action) {
        return;
      }

      if (this.shouldPreventDefault(event.code)) {
        event.preventDefault();
      }

      if (this.isRepeatAction(action)) {
        const state = this.heldActions[action];
        if (state.pressed) {
          return;
        }
        state.pressed = true;
        state.dasElapsed = 0;
        state.arrElapsed = 0;
        this.onAction(action);
        return;
      }

      if (event.repeat) {
        return;
      }

      this.onAction(action);
    }

    onKeyUp(event) {
      if (!this.isDesktopMode()) {
        return;
      }

      const action = this.actionFromCode(event.code);
      if (!action || !this.isRepeatAction(action)) {
        return;
      }

      const state = this.heldActions[action];
      state.pressed = false;
      state.dasElapsed = 0;
      state.arrElapsed = 0;
    }

    processHeldActions(delta) {
      if (!this.gameStarted || this.paused || this.gameOver || this.lineClearEffect) {
        return;
      }

      const dasMs = this.getDasMs();
      const arrMs = this.getArrMs();

      this.repeatActions.forEach((action) => {
        const state = this.heldActions[action];
        if (!state.pressed) {
          return;
        }

        state.dasElapsed += delta;
        if (state.dasElapsed < dasMs) {
          return;
        }

        state.arrElapsed += delta;
        while (state.arrElapsed >= arrMs) {
          state.arrElapsed -= arrMs;
          this.onAction(action);
          if (!state.pressed || this.paused || this.gameOver || this.lineClearEffect) {
            break;
          }
        }
      });
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

    drawPreview(ctx, canvas, type) {
      ctx.fillStyle = '#0f1320';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!type) {
        return;
      }

      const previewBlock = 24;
      const shape = this.shapes[type];
      const offsetX = (canvas.width - shape[0].length * previewBlock) / 2;
      const offsetY = (canvas.height - shape.length * previewBlock) / 2;

      shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (!value) {
            return;
          }
          const px = offsetX + x * previewBlock;
          const py = offsetY + y * previewBlock;
          ctx.fillStyle = this.colors[type];
          ctx.fillRect(px, py, previewBlock, previewBlock);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.strokeRect(px + 0.5, py + 0.5, previewBlock - 1, previewBlock - 1);
        });
      });
    }

    drawNextPiece() {
      this.drawPreview(nextCtx, nextCanvas, this.nextPiece.type);
    }

    drawHoldPiece() {
      if (!holdCtx || !holdCanvas) {
        return;
      }
      this.drawPreview(holdCtx, holdCanvas, this.holdPieceType);
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
      this.drawHoldPiece();
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

      this.processHeldActions(delta);

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
