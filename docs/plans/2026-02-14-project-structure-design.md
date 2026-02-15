# 项目目录工业化重构设计（静态前端）

## 目标
在不引入 npm 依赖、保持 `./run.sh` 启动方式与现有功能不变的前提下，将当前扁平目录重构为更符合工业实践的静态项目层级，提升可维护性和后续扩展能力。

## 约束
- 保持纯静态站点（HTML/CSS/JS）
- 保持访问地址：`http://localhost:8080`
- 保持启动命令：`./run.sh`
- 不引入构建工具与包管理依赖

## 方案对比
1. `public-only` 分层（采用）
- 优点：简单、可部署、低迁移成本
- 缺点：无源码/产物分离

2. `src + public` 双层
- 优点：开发与发布分离更清晰
- 缺点：需要同步脚本，流程变复杂

3. `src + dist` 伪构建
- 优点：更接近完整工程交付
- 缺点：对当前项目过重

## 采用方案
采用 `public-only` 分层：

```text
game/
├─ public/
│  ├─ index.html
│  ├─ assets/icons/favicon.svg|ico
│  ├─ styles/main.css
│  └─ scripts/
│     ├─ app.js
│     ├─ core/{ui.js,game-manager.js,loop.js}
│     └─ games/{tetris.js,snake.js,minesweeper.js,dino.js,flappy.js}
├─ scripts/run.sh
├─ run.sh
├─ docs/plans/
└─ README.md
```

## 迁移映射
- `index.html` -> `public/index.html`
- `style.css` -> `public/styles/main.css`
- `game.js` -> 多模块拆分到 `public/scripts/**`
- `favicon.svg|ico` -> `public/assets/icons/`
- `run.sh` -> 保留兼容入口，转调 `scripts/run.sh`

## 风险与控制
- 脚本加载顺序错误：通过 `index.html` 显式顺序加载 `core -> games -> app`
- 路径迁移导致 404：使用 `curl -I` 验证关键静态资源
- 行为回归：按游戏逐项手工验证（菜单切换、输入、返回菜单）

## 验证清单
- `node --check public/scripts/**/*.js`
- `./run.sh` 后 `curl -I http://localhost:8080` 返回 `200`
- `favicon/css/js` 关键资源返回 `200`

