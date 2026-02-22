import type { GameManifest } from '../contracts/game-contracts';

export type GameCatalogItem = GameManifest;

export const gameCatalog: GameCatalogItem[] = [
  { id: 'tetris', name: '俄罗斯方块 · Tetris', summary: '让方块严丝合缝，完成整行消除。' },
  { id: 'snake', name: '贪吃蛇 · Snake', summary: '一路觅食变长，谨慎转向避免相撞。' },
  { id: 'minesweeper', name: '扫雷 · Minesweeper', summary: '根据数字线索排雷，旗标与快开都可用。' },
  { id: 'spider', name: '蜘蛛纸牌 · Spider Solitaire', summary: '按花色整理序列，逐步清空整桌纸牌。' },
  { id: 'flappy', name: '像素小鸟 · Flappy Bird', summary: '轻触起飞穿越管道，稳住节奏拿高分。' },
  { id: 'dino', name: '奔跑小恐龙 · Dino Runner', summary: '看准时机跳过障碍，冲击更远距离。' },
  { id: 'g2048', name: '数字方阵 · 2048', summary: '滑动合并数字，朝 2048 持续进阶。' }
];
