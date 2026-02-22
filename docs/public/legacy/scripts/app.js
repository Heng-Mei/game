(function initApp() {
  window.GameHub = window.GameHub || {};

  const ui = window.GameHub.ui;
  const refs = window.GameHub.refs;
  const { GameManager, GameLoop } = window.GameHub.core;
  const {
    TetrisGame,
    SnakeGame,
    MinesweeperGame,
    SpiderGame,
    DinoGame,
    FlappyGame,
    Game2048
  } = window.GameHub.games;

  const games = {
    tetris: {
      title: '俄罗斯方块 · Tetris',
      instance: new TetrisGame(ui)
    },
    snake: {
      title: '贪吃蛇 · Snake',
      instance: new SnakeGame(ui)
    },
    minesweeper: {
      title: '扫雷 · Minesweeper',
      instance: new MinesweeperGame(ui)
    },
    spider: {
      title: '蜘蛛纸牌 · Spider Solitaire',
      instance: new SpiderGame(ui)
    },
    dino: {
      title: '奔跑小恐龙 · Dino Runner',
      instance: new DinoGame(ui)
    },
    flappy: {
      title: '像素小鸟 · Flappy Bird',
      instance: new FlappyGame(ui)
    },
    game2048: {
      title: '数字方阵 · 2048',
      instance: new Game2048(ui)
    }
  };

  const manager = new GameManager(games);
  const params = new URLSearchParams(window.location.search);
  const gameFromQuery = params.get('game');
  const embeddedMode = params.get('embedded') === '1' || params.get('embed') === '1';
  const themeFromQuery = params.get('theme');
  const THEME_MODE_STORAGE_KEY = 'gamehub.theme.mode';

  const applyTheme = (theme) => {
    const normalized = theme === 'night' ? 'night' : 'day';
    document.documentElement.setAttribute('data-theme', normalized);
  };

  const resolveInitialTheme = () => {
    if (themeFromQuery === 'day' || themeFromQuery === 'night') {
      return themeFromQuery;
    }

    try {
      const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (storedMode === 'day' || storedMode === 'night') {
        return storedMode;
      }
    } catch (error) {
      // Ignore storage failures and fallback to system.
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  };

  applyTheme(resolveInitialTheme());

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    const payload = event.data;
    if (!payload || payload.type !== 'GAMEHUB_THEME') {
      return;
    }
    applyTheme(payload.theme);
  });

  if (embeddedMode) {
    document.documentElement.classList.add('embedded-mode');
    refs.backToMenuBtn.classList.add('hidden');
    refs.gameTitle.classList.add('hidden');
    manager.openMenu = () => {};
  }

  if (gameFromQuery && games[gameFromQuery]) {
    manager.openGame(gameFromQuery);
  } else {
    manager.openMenu();
  }

  const loop = new GameLoop((delta, ts) => {
    manager.update(delta, ts);
  });
  loop.start();
})();
