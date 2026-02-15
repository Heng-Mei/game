(function initGameManager() {
  window.GameHub = window.GameHub || {};
  window.GameHub.core = window.GameHub.core || {};

  const refs = window.GameHub.refs;
  const ui = window.GameHub.ui;

  class GameManager {
    constructor(games) {
      this.games = games;
      this.activeGameKey = null;
      this.activeGame = null;
      this.allowPortraitPlay = false;
      this.repeatTimer = null;
      this.mobileLayouts = {
        tetris: {
          gameKey: 'tetris',
          rows: [
            [
              { action: 'move_left', label: '左', repeat: true },
              { action: 'rotate', label: '旋转' },
              { action: 'move_right', label: '右', repeat: true },
              { action: 'hard_drop', label: '硬降', variant: 'accent' }
            ],
            [
              { action: 'soft_drop', label: '下落', repeat: true, variant: 'accent' },
              { action: 'start_or_primary', label: '开始/确认' },
              { action: 'pause_toggle', label: '暂停' },
              { action: 'restart', label: '重开', variant: 'warn' }
            ]
          ]
        },
        snake: {
          gameKey: 'snake',
          rows: [
            [
              { action: 'move_left', label: '左', repeat: true },
              { action: 'move_up', label: '上', repeat: true },
              { action: 'move_right', label: '右', repeat: true },
              { action: 'start_or_primary', label: '开始/确认' }
            ],
            [
              { action: 'move_down', label: '下', repeat: true },
              { action: 'pause_toggle', label: '暂停' },
              { action: 'restart', label: '重开', variant: 'warn' }
            ]
          ]
        },
        minesweeper: {
          gameKey: 'minesweeper',
          rows: [
            [
              { action: 'mode_reveal', label: '翻开' },
              { action: 'mode_flag', label: '插旗', variant: 'accent' },
              { action: 'restart', label: '重开', variant: 'warn' }
            ]
          ]
        },
        dino: {
          gameKey: 'dino',
          rows: [
            [
              { action: 'jump_primary', label: '跳跃', variant: 'accent' },
              { action: 'restart', label: '重开', variant: 'warn' }
            ]
          ]
        },
        flappy: {
          gameKey: 'flappy',
          rows: [
            [
              { action: 'flap_primary', label: '起飞', variant: 'accent' },
              { action: 'restart', label: '重开', variant: 'warn' }
            ]
          ]
        }
      };
      this.bindEvents();
    }

    isMobileViewport() {
      return window.matchMedia('(max-width: 1024px)').matches
        && window.matchMedia('(pointer: coarse)').matches;
    }

    isLandscape() {
      return window.matchMedia('(orientation: landscape)').matches;
    }

    renderMobileControls() {
      if (!this.activeGameKey || !this.isMobileViewport()) {
        ui.setMobileControls(null);
        return;
      }

      ui.setMobileControls(this.mobileLayouts[this.activeGameKey] || null);
    }

    updateOrientationOverlay() {
      const shouldShow = Boolean(
        this.activeGame
        && this.isMobileViewport()
        && !this.isLandscape()
        && !this.allowPortraitPlay
      );

      ui.setOrientationOverlay(
        shouldShow,
        '建议横屏获得最佳操作体验，你也可以继续竖屏游玩。'
      );
    }

    dispatchAction(action, payload) {
      if (!this.activeGame || !action) {
        return;
      }

      if (typeof this.activeGame.onAction === 'function') {
        this.activeGame.onAction(action, payload);
      }
    }

    stopRepeatAction() {
      if (this.repeatTimer) {
        window.clearInterval(this.repeatTimer);
        this.repeatTimer = null;
      }
    }

    startRepeatAction(action) {
      this.stopRepeatAction();
      this.dispatchAction(action);
      this.repeatTimer = window.setInterval(() => {
        this.dispatchAction(action);
      }, 110);
    }

    onMobileControlPointerDown(event) {
      const btn = event.target.closest('.mobile-btn');
      if (!btn) {
        return;
      }

      event.preventDefault();
      const action = btn.getAttribute('data-action');
      const repeat = btn.getAttribute('data-repeat') === '1';

      if (!action) {
        return;
      }

      if (repeat) {
        this.startRepeatAction(action);
      } else {
        this.dispatchAction(action);
      }
    }

    openMenu() {
      if (this.activeGame && typeof this.activeGame.exit === 'function') {
        this.activeGame.exit();
      }

      this.stopRepeatAction();
      this.activeGame = null;
      this.activeGameKey = null;
      this.allowPortraitPlay = false;
      refs.menuView.classList.remove('hidden');
      refs.gameView.classList.add('hidden');
      ui.resetPanels();
      ui.clearMainCanvas();
    }

    openGame(gameKey) {
      const item = this.games[gameKey];
      if (!item) {
        return;
      }

      if (this.activeGame && typeof this.activeGame.exit === 'function') {
        this.activeGame.exit();
      }

      this.activeGameKey = gameKey;
      this.activeGame = item.instance;
      this.allowPortraitPlay = false;
      ui.setTitle(item.title);
      refs.menuView.classList.add('hidden');
      refs.gameView.classList.remove('hidden');
      this.activeGame.enter();
      this.renderMobileControls();
      this.updateOrientationOverlay();
    }

    bindEvents() {
      refs.menuButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const gameKey = button.getAttribute('data-game');
          this.openGame(gameKey);
        });
      });

      refs.backToMenuBtn.addEventListener('click', () => {
        this.openMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (!this.activeGame) {
          return;
        }
        if (typeof this.activeGame.onKeyDown === 'function') {
          this.activeGame.onKeyDown(event);
        }
      });

      refs.mainCanvas.addEventListener('pointerdown', (event) => {
        if (!this.activeGame) {
          return;
        }
        if (typeof this.activeGame.onPointerDown === 'function') {
          this.activeGame.onPointerDown(event);
        }
      });

      refs.mainCanvas.addEventListener('contextmenu', (event) => {
        if (this.activeGame && typeof this.activeGame.onContextMenu === 'function') {
          this.activeGame.onContextMenu(event);
        }
      });

      refs.mobileControls.addEventListener('pointerdown', (event) => {
        this.onMobileControlPointerDown(event);
      });
      refs.mobileControls.addEventListener('pointerup', () => {
        this.stopRepeatAction();
      });
      refs.mobileControls.addEventListener('pointercancel', () => {
        this.stopRepeatAction();
      });
      refs.mobileControls.addEventListener('pointerleave', () => {
        this.stopRepeatAction();
      });

      refs.continuePortraitBtn.addEventListener('click', () => {
        this.allowPortraitPlay = true;
        this.updateOrientationOverlay();
      });

      window.addEventListener('resize', () => {
        this.renderMobileControls();
        this.updateOrientationOverlay();
      });
      window.addEventListener('orientationchange', () => {
        this.renderMobileControls();
        this.updateOrientationOverlay();
      });
      window.addEventListener('blur', () => {
        this.stopRepeatAction();
      });
    }

    update(delta, ts) {
      if (this.activeGame && typeof this.activeGame.update === 'function') {
        this.activeGame.update(delta, ts);
      }
    }
  }

  window.GameHub.core.GameManager = GameManager;
})();
