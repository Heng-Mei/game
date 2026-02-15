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
      this.bindEvents();
    }

    openMenu() {
      if (this.activeGame && typeof this.activeGame.exit === 'function') {
        this.activeGame.exit();
      }

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

      refs.mainCanvas.addEventListener('mousedown', (event) => {
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
    }

    update(delta, ts) {
      if (this.activeGame && typeof this.activeGame.update === 'function') {
        this.activeGame.update(delta, ts);
      }
    }
  }

  window.GameHub.core.GameManager = GameManager;
})();
