(function initLoop() {
  window.GameHub = window.GameHub || {};
  window.GameHub.core = window.GameHub.core || {};

  class GameLoop {
    constructor(updateFn) {
      this.updateFn = updateFn;
      this.lastTs = performance.now();
      this.rafId = null;
      this.tick = this.tick.bind(this);
    }

    tick(ts) {
      const delta = ts - this.lastTs;
      this.lastTs = ts;
      this.updateFn(delta, ts);
      this.rafId = requestAnimationFrame(this.tick);
    }

    start() {
      if (this.rafId !== null) {
        return;
      }
      this.lastTs = performance.now();
      this.rafId = requestAnimationFrame(this.tick);
    }

    stop() {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
  }

  window.GameHub.core.GameLoop = GameLoop;
})();
