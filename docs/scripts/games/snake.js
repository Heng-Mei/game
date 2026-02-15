(function initSnakeGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};
  const { mainCanvas, mainCtx } = window.GameHub.refs;
  const ui = window.GameHub.ui;
class SnakeGame {
  constructor(uiRef) {
    this.ui = uiRef;
    this.grid = 20;
    this.cell = 24;
    this.best = 0;
    this.reset();
  }

  enter() {
    this.ui.setCanvasSize(this.grid * this.cell, this.grid * this.cell);
    this.ui.showNextCanvas(false);
    this.ui.setSettings([]);
    this.ui.setControls([
      '← / → / ↑ / ↓ 或 WASD：移动',
      '空格：开始 / 死亡后重开',
      'P：暂停/继续',
      'R：重新开始'
    ]);
    this.reset();
  }

  exit() { }

  reset() {
    const mid = Math.floor(this.grid / 2);
    this.snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = this.randomFood();
    this.score = 0;
    this.started = false;
    this.paused = false;
    this.gameOver = false;
    this.stepTimer = 0;
    this.stepInterval = 150;
    this.updateHUD();
    this.ui.setState('按空格开始');
    this.draw();
  }

  randomFood() {
    while (true) {
      const point = {
        x: Math.floor(Math.random() * this.grid),
        y: Math.floor(Math.random() * this.grid)
      };
      if (!this.snake || !this.snake.some((part) => part.x === point.x && part.y === point.y)) {
        return point;
      }
    }
  }

  updateHUD() {
    const speed = (1000 / this.stepInterval).toFixed(1);
    this.ui.setStatus([
      { label: '分数', value: this.score },
      { label: '长度', value: this.snake.length },
      { label: '速度(格/秒)', value: speed },
      { label: '最高分', value: this.best }
    ]);
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.paused = false;
      this.ui.setState('进行中');
    }
  }

  togglePause() {
    if (!this.started || this.gameOver) {
      return;
    }
    this.paused = !this.paused;
    this.ui.setState(this.paused ? '已暂停（按 P 继续）' : '进行中');
  }

  setDirection(x, y) {
    if (this.dir.x + x === 0 && this.dir.y + y === 0) {
      return;
    }
    this.nextDir = { x, y };
  }

  move() {
    this.dir = this.nextDir;
    const head = this.snake[0];
    const nextHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    if (nextHead.x < 0 || nextHead.x >= this.grid || nextHead.y < 0 || nextHead.y >= this.grid) {
      this.gameOver = true;
      this.best = Math.max(this.best, this.score);
      this.ui.setState('撞墙了，按空格或 R 重新开始');
      this.updateHUD();
      return;
    }

    if (this.snake.some((part) => part.x === nextHead.x && part.y === nextHead.y)) {
      this.gameOver = true;
      this.best = Math.max(this.best, this.score);
      this.ui.setState('撞到自己了，按空格或 R 重新开始');
      this.updateHUD();
      return;
    }

    this.snake.unshift(nextHead);

    if (nextHead.x === this.food.x && nextHead.y === this.food.y) {
      this.score += 10;
      this.food = this.randomFood();
      this.stepInterval = Math.max(70, 150 - Math.floor(this.score / 30) * 4);
    } else {
      this.snake.pop();
    }

    this.updateHUD();
  }

  onKeyDown(event) {
    const keyMap = {
      KeyR: 'restart',
      KeyP: 'pause_toggle',
      Space: 'start_or_primary',
      ArrowUp: 'move_up',
      KeyW: 'move_up',
      ArrowDown: 'move_down',
      KeyS: 'move_down',
      ArrowLeft: 'move_left',
      KeyA: 'move_left',
      ArrowRight: 'move_right',
      KeyD: 'move_right'
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

  onAction(action) {
    switch (action) {
      case 'restart':
        this.reset();
        return;
      case 'pause_toggle':
        this.togglePause();
        return;
      case 'start_or_primary':
        if (this.gameOver) {
          this.reset();
        }
        this.start();
        return;
      case 'move_up':
        this.setDirection(0, -1);
        return;
      case 'move_down':
        this.setDirection(0, 1);
        return;
      case 'move_left':
        this.setDirection(-1, 0);
        return;
      case 'move_right':
        this.setDirection(1, 0);
        return;
      default:
        return;
    }
  }

  draw() {
    mainCtx.fillStyle = '#0f1320';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    mainCtx.strokeStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i <= this.grid; i += 1) {
      const p = i * this.cell + 0.5;
      mainCtx.beginPath();
      mainCtx.moveTo(p, 0);
      mainCtx.lineTo(p, mainCanvas.height);
      mainCtx.stroke();
      mainCtx.beginPath();
      mainCtx.moveTo(0, p);
      mainCtx.lineTo(mainCanvas.width, p);
      mainCtx.stroke();
    }

    mainCtx.fillStyle = '#ff6b6b';
    mainCtx.beginPath();
    mainCtx.arc(
      this.food.x * this.cell + this.cell / 2,
      this.food.y * this.cell + this.cell / 2,
      this.cell * 0.33,
      0,
      Math.PI * 2
    );
    mainCtx.fill();

    this.snake.forEach((part, index) => {
      mainCtx.fillStyle = index === 0 ? '#67e8f9' : '#3ddc97';
      mainCtx.fillRect(part.x * this.cell + 2, part.y * this.cell + 2, this.cell - 4, this.cell - 4);
    });
  }

  update(delta) {
    if (this.started && !this.paused && !this.gameOver) {
      this.stepTimer += delta;
      while (this.stepTimer >= this.stepInterval) {
        this.move();
        this.stepTimer -= this.stepInterval;
        if (this.gameOver) {
          break;
        }
      }
    }

    this.draw();
  }
}
  window.GameHub.games.SnakeGame = SnakeGame;
})();
