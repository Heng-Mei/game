(function initApp() {
  window.GameHub = window.GameHub || {};

  const ui = window.GameHub.ui;
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
      title: '俄罗斯方块',
      instance: new TetrisGame(ui)
    },
    snake: {
      title: '贪吃蛇',
      instance: new SnakeGame(ui)
    },
    minesweeper: {
      title: '扫雷',
      instance: new MinesweeperGame(ui)
    },
    spider: {
      title: '蜘蛛纸牌',
      instance: new SpiderGame(ui)
    },
    dino: {
      title: '小恐龙跳障碍',
      instance: new DinoGame(ui)
    },
    flappy: {
      title: 'Flappy Bird',
      instance: new FlappyGame(ui)
    },
    game2048: {
      title: '2048',
      instance: new Game2048(ui)
    }
  };

  const manager = new GameManager(games);
  manager.openMenu();

  const loop = new GameLoop((delta, ts) => {
    manager.update(delta, ts);
  });
  loop.start();
})();
