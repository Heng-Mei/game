(function initFlappyGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};
  const { mainCtx } = window.GameHub.refs;
  const ui = window.GameHub.ui;
class FlappyGame {
  constructor(uiRef) {
    this.ui = uiRef;
    this.width = 420;
    this.height = 600;
    this.ground = 560;
    this.best = 0;
    this.reset();
  }

  enter() {
    this.ui.setCanvasSize(this.width, this.height);
    this.ui.showNextCanvas(false);
    this.ui.setSettings([]);
    this.ui.setControls([
      '空格 / ↑ / W：起飞',
      '鼠标左键点击画布：起飞',
      'R：重新开始'
    ]);
    this.reset();
  }

  exit() { }

  reset() {
    this.bird = {
      x: 116,
      y: 260,
      r: 16,
      vy: 0
    };
    this.gravity = 1250;
    this.flapVelocity = -360;
    this.pipes = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1450;
    this.pipeGap = 170;
    this.pipeWidth = 64;
    this.speed = 185;
    this.score = 0;
    this.started = false;
    this.gameOver = false;
    this.ui.setState('按空格或点击开始');
    this.updateHUD();
    this.draw();
  }

  updateHUD() {
    this.ui.setStatus([
      { label: '分数', value: this.score },
      { label: '速度', value: this.speed },
      { label: '最高分', value: this.best }
    ]);
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.ui.setState('进行中');
    }
  }

  flap() {
    this.bird.vy = this.flapVelocity;
  }

  onKeyDown(event) {
    const keyMap = {
      KeyR: 'restart',
      Space: 'flap_primary',
      ArrowUp: 'flap_primary',
      KeyW: 'flap_primary'
    };
    const action = keyMap[event.code];
    if (!action) {
      return;
    }

    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
    }

    this.onAction(action);
  }

  onPointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    this.onAction('flap_primary');
  }

  onAction(action) {
    if (action === 'restart') {
      this.reset();
      return;
    }

    if (action === 'flap_primary') {
      this.handleFlapAction();
    }
  }

  handleFlapAction() {
    if (this.gameOver) {
      this.reset();
      this.start();
      this.flap();
      return;
    }

    this.start();
    this.flap();
  }

  spawnPipe() {
    const margin = 80;
    const gapY = margin + Math.random() * (this.ground - margin * 2 - this.pipeGap);
    this.pipes.push({
      x: this.width + 20,
      gapY,
      passed: false
    });
  }

  circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= r * r;
  }

  checkCollisions() {
    if (this.bird.y - this.bird.r <= 0 || this.bird.y + this.bird.r >= this.ground) {
      return true;
    }

    return this.pipes.some((pipe) => {
      const topH = pipe.gapY;
      const bottomY = pipe.gapY + this.pipeGap;
      const bottomH = this.ground - bottomY;

      const hitTop = this.circleRectCollision(
        this.bird.x,
        this.bird.y,
        this.bird.r,
        pipe.x,
        0,
        this.pipeWidth,
        topH
      );
      const hitBottom = this.circleRectCollision(
        this.bird.x,
        this.bird.y,
        this.bird.r,
        pipe.x,
        bottomY,
        this.pipeWidth,
        bottomH
      );
      return hitTop || hitBottom;
    });
  }

  update(delta) {
    const dt = delta / 1000;

    if (this.started && !this.gameOver) {
      this.bird.vy += this.gravity * dt;
      this.bird.y += this.bird.vy * dt;

      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnPipe();
      }

      this.pipes.forEach((pipe) => {
        pipe.x -= this.speed * dt;

        if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
          pipe.passed = true;
          this.score += 1;
        }
      });
      this.pipes = this.pipes.filter((pipe) => pipe.x + this.pipeWidth > -20);

      this.speed = 185 + Math.min(90, this.score * 2);

      if (this.checkCollisions()) {
        this.gameOver = true;
        this.best = Math.max(this.best, this.score);
        this.ui.setState('撞到了，按 R 或空格重开');
      }

      this.updateHUD();
    }

    this.draw();
  }

  draw() {
    const sky = mainCtx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e293b');
    mainCtx.fillStyle = sky;
    mainCtx.fillRect(0, 0, this.width, this.height);

    mainCtx.fillStyle = '#22c55e';
    this.pipes.forEach((pipe) => {
      const topH = pipe.gapY;
      const bottomY = pipe.gapY + this.pipeGap;
      mainCtx.fillRect(pipe.x, 0, this.pipeWidth, topH);
      mainCtx.fillRect(pipe.x, bottomY, this.pipeWidth, this.ground - bottomY);
    });

    mainCtx.fillStyle = '#facc15';
    mainCtx.beginPath();
    mainCtx.arc(this.bird.x, this.bird.y, this.bird.r, 0, Math.PI * 2);
    mainCtx.fill();

    mainCtx.fillStyle = '#111827';
    mainCtx.beginPath();
    mainCtx.arc(this.bird.x + 5, this.bird.y - 4, 3, 0, Math.PI * 2);
    mainCtx.fill();

    mainCtx.fillStyle = '#374151';
    mainCtx.fillRect(0, this.ground, this.width, this.height - this.ground);
  }
}
  window.GameHub.games.FlappyGame = FlappyGame;
})();
