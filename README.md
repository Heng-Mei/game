# 小游戏大厅（React + TypeScript + Phaser 重构中）

## 目录结构

```text
.
├─ docs/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ assets/icons/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ styles/
│  │  └─ ...
│  ├─ scripts/games/   # 旧游戏逻辑（迁移中）
│  └─ plans/
├─ scripts/run.sh
├─ run.sh
└─ tests/
```

## 运行方式

```bash
./run.sh
```

首次运行会自动安装依赖，终端会打印：

```text
Local: http://localhost:5173
```

## 游戏列表
- 俄罗斯方块
- 贪吃蛇
- 扫雷（Win7 经典规则）
- 蜘蛛纸牌（Win7 经典）
- 小恐龙跳障碍
- Flappy Bird
- 2048（经典规则）

## 说明
- 进入页面先显示游戏菜单
- 所有游戏均支持返回菜单
- 支持移动端触控操作（分游戏控制面板）
- 手机端横屏和竖屏均可直接游玩
- 竖屏采用十字方向键布局，横屏采用左手方向盘 + 右手功能键布局
- 移动端游戏页采用“画布优先”布局：信息区默认收起，可通过顶部“信息”按钮手动打开底部抽屉
- 底部抽屉开关状态会被记忆，下次进入移动端游戏时沿用
- 俄罗斯方块在移动端始终显示“下一个方块”右上角浮卡
- Flappy Bird / 小恐龙支持仅点击画布游玩（开始、操作、重开）
- GitHub Pages 发布根目录仍为 `docs/`
- 当前使用 `Vite` 本地开发服务器
