export type GameId = 'tetris' | 'snake' | 'minesweeper' | 'spider' | 'flappy' | 'dino' | 'g2048';

export type GameManifest = {
  id: GameId;
  name: string;
  summary: string;
};
