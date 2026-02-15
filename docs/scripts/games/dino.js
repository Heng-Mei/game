(function initDinoGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};
  const { mainCtx } = window.GameHub.refs;
  const ui = window.GameHub.ui;
class DinoGame {
  constructor(uiRef) {
    this.ui = uiRef;
    this.width = 800;
    this.height = 240;
    this.groundY = 196;
    this.reset();
  }

  enter() {
    this.ui.setCanvasSize(this.width, this.height);
    this.ui.showNextCanvas(false);
    this.ui.setSettings([]);
    this.ui.setControls([
      '点击画布：开始 / 跳跃 / 重开',
      '空格 / ↑ / W：跳跃'
    ]);
    this.reset();
  }

  exit() { }

  reset() {
    this.player = {
      x: 80,
      y: this.groundY - 46,
      w: 42,
      h: 46,
      vy: 0
    };
    this.obstacles = [];
    this.spawnTimer = 0;
    this.nextSpawn = this.randomSpawnInterval();
    this.speed = 320;
    this.started = false;
    this.gameOver = false;
    this.score = 0;
    this.best = Math.max(this.best || 0, 0);
    this.ui.setState('按空格开始并跳跃');
    this.updateHUD();
    this.draw();
  }

  randomSpawnInterval() {
    return 900 + Math.random() * 900;
  }

  updateHUD() {
    this.ui.setStatus([
      { label: '分数', value: Math.floor(this.score) },
      { label: '速度', value: Math.floor(this.speed) },
      { label: '最高分', value: Math.floor(this.best || 0) }
    ]);
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.ui.setState('进行中');
    }
  }

  jump() {
    const onGround = this.player.y >= this.groundY - this.player.h - 0.1;
    if (onGround) {
      this.player.vy = -680;
    }
  }

  onKeyDown(event) {
    const keyMap = {
      KeyR: 'restart',
      Space: 'jump_primary',
      ArrowUp: 'jump_primary',
      KeyW: 'jump_primary'
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

  onAction(action) {
    if (action === 'restart') {
      this.reset();
      return;
    }

    if (action === 'jump_primary' || action === 'primary_tap') {
      if (this.gameOver) {
        this.reset();
      }
      this.start();
      this.jump();
    }
  }

  intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  spawnObstacle() {
    const tall = Math.random() > 0.55;
    const h = tall ? 48 + Math.random() * 24 : 30 + Math.random() * 18;
    const w = tall ? 22 + Math.random() * 12 : 30 + Math.random() * 14;
    this.obstacles.push({
      x: this.width + 30,
      y: this.groundY - h,
      w,
      h
    });
  }

  update(delta) {
    const dt = delta / 1000;

    if (this.started && !this.gameOver) {
      this.score += dt * 100;
      this.speed = 320 + Math.min(220, this.score * 0.45);

      this.player.vy += 1900 * dt;
      this.player.y += this.player.vy * dt;
      if (this.player.y > this.groundY - this.player.h) {
        this.player.y = this.groundY - this.player.h;
        this.player.vy = 0;
      }

      this.spawnTimer += delta;
      if (this.spawnTimer >= this.nextSpawn) {
        this.spawnTimer = 0;
        this.nextSpawn = this.randomSpawnInterval();
        this.spawnObstacle();
      }

      this.obstacles.forEach((obs) => {
        obs.x -= this.speed * dt;
      });
      this.obstacles = this.obstacles.filter((obs) => obs.x + obs.w > -20);

      const hit = this.obstacles.some((obs) => this.intersects(this.player, obs));
      if (hit) {
        this.gameOver = true;
        this.best = Math.max(this.best || 0, this.score);
        this.ui.setState('碰到障碍，按 R 或空格重开');
      }

      this.updateHUD();
    }

    this.draw();
  }

  draw() {
    const g = mainCtx.createLinearGradient(0, 0, 0, this.height);
    g.addColorStop(0, '#111827');
    g.addColorStop(1, '#18212f');
    mainCtx.fillStyle = g;
    mainCtx.fillRect(0, 0, this.width, this.height);

    mainCtx.strokeStyle = '#49536b';
    mainCtx.lineWidth = 2;
    mainCtx.beginPath();
    mainCtx.moveTo(0, this.groundY + 0.5);
    mainCtx.lineTo(this.width, this.groundY + 0.5);
    mainCtx.stroke();

    mainCtx.fillStyle = '#9ca3af';
    for (let x = -20; x < this.width; x += 36) {
      const ox = ((x - (this.score * 3) % 36) + this.width) % (this.width + 36) - 18;
      mainCtx.fillRect(ox, this.groundY + 8, 16, 2);
    }

    mainCtx.fillStyle = '#4ade80';
    mainCtx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
    mainCtx.fillStyle = '#0f172a';
    mainCtx.fillRect(this.player.x + 26, this.player.y + 10, 8, 8);

    mainCtx.fillStyle = '#f97316';
    this.obstacles.forEach((obs) => {
      mainCtx.fillRect(obs.x, obs.y, obs.w, obs.h);
    });
  }
}
  window.GameHub.games.DinoGame = DinoGame;
})();
