export type GameCatalogItem = {
  id: string;
  name: string;
  summary: string;
};

export const gameCatalog: GameCatalogItem[] = [
  { id: 'tetris', name: '俄罗斯方块', summary: '现代规则 + 键位设置' },
  { id: 'snake', name: '贪吃蛇', summary: '经典转向与成长' },
  { id: 'minesweeper', name: '扫雷', summary: 'Win7 经典规则' },
  { id: 'spider', name: '蜘蛛纸牌', summary: 'Win7 经典蜘蛛' },
  { id: 'flappy', name: 'Flappy Bird', summary: '点击起飞' },
  { id: 'dino', name: '小恐龙', summary: '跳跃避障' },
  { id: 'g2048', name: '2048', summary: '滑动合并数字' }
];
