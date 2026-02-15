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
      this.repeatTimer = null;
      this.mobileLayouts = {
        tetris: {
          gameKey: 'tetris',
          rows: [
            {
              role: 'dpad',
              buttons: [
                { action: 'rotate', label: '旋', pos: 'up' },
                { action: 'move_left', label: '左', repeat: true, pos: 'left' },
                { action: 'soft_drop', label: '下', repeat: true, pos: 'down' },
                { action: 'move_right', label: '右', repeat: true, pos: 'right' }
              ]
            },
            {
              role: 'actions',
              buttons: [
                { action: 'hard_drop', label: '硬降', variant: 'accent', role: 'action' },
                { action: 'start_or_primary', label: '开始', role: 'action' },
                { action: 'pause_toggle', label: '暂停', role: 'action' },
                { action: 'restart', label: '重开', variant: 'warn', role: 'action' }
              ]
            }
          ]
        },
        snake: {
          gameKey: 'snake',
          rows: [
            {
              role: 'dpad',
              buttons: [
                { action: 'move_up', label: '上', repeat: true, pos: 'up' },
                { action: 'move_left', label: '左', repeat: true, pos: 'left' },
                { action: 'move_down', label: '下', repeat: true, pos: 'down' },
                { action: 'move_right', label: '右', repeat: true, pos: 'right' }
              ]
            },
            {
              role: 'actions',
              buttons: [
                { action: 'start_or_primary', label: '开始', role: 'action' },
                { action: 'pause_toggle', label: '暂停', role: 'action' },
                { action: 'restart', label: '重开', variant: 'warn', role: 'action' }
              ]
            }
          ]
        },
        minesweeper: {
          gameKey: 'minesweeper',
          rows: [
            {
              role: 'actions',
              buttons: [
                { action: 'mode_reveal', label: '翻开', role: 'action' },
                { action: 'mode_flag', label: '插旗', variant: 'accent', role: 'action' },
                { action: 'restart', label: '重开', variant: 'warn', role: 'action' }
              ]
            }
          ]
        },
        dino: {
          gameKey: 'dino',
          rows: [
            {
              role: 'actions',
              buttons: [
                { action: 'jump_primary', label: '跳跃', variant: 'accent', role: 'action' },
                { action: 'restart', label: '重开', variant: 'warn', role: 'action' }
              ]
            }
          ]
        },
        flappy: {
          gameKey: 'flappy',
          rows: [
            {
              role: 'actions',
              buttons: [
                { action: 'flap_primary', label: '起飞', variant: 'accent', role: 'action' },
                { action: 'restart', label: '重开', variant: 'warn', role: 'action' }
              ]
            }
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

      const baseConfig = this.mobileLayouts[this.activeGameKey];
      if (!baseConfig) {
        ui.setMobileControls(null);
        return;
      }

      ui.setMobileControls({
        ...baseConfig,
        layout: this.isLandscape() ? 'landscape' : 'portrait'
      });
    }

    updateOrientationOverlay() {
      ui.setOrientationOverlay(false);
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

      window.addEventListener('resize', () => {
        this.stopRepeatAction();
        this.renderMobileControls();
        this.updateOrientationOverlay();
      });
      window.addEventListener('orientationchange', () => {
        this.stopRepeatAction();
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
