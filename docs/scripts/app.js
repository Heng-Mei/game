(function initApp() {
  window.GameHub = window.GameHub || {};

  const ui = window.GameHub.ui;
  const { GameManager, GameLoop } = window.GameHub.core;
  const {
    TetrisGame,
    SnakeGame,
    MinesweeperGame,
    DinoGame,
    FlappyGame
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
    dino: {
      title: '小恐龙跳障碍',
      instance: new DinoGame(ui)
    },
    flappy: {
      title: 'Flappy Bird',
      instance: new FlappyGame(ui)
    }
  };

  const manager = new GameManager(games);
  manager.openMenu();

  const loop = new GameLoop((delta, ts) => {
    manager.update(delta, ts);
  });
  loop.start();
})();
