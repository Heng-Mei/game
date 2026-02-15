# Project Structure Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构当前扁平静态项目为工业常见分层目录，同时保持现有 5 个小游戏功能和启动方式不变。

**Architecture:** 采用 `docs-only` 分层，将可访问资源统一放到 `docs/`；将 `game.js` 以“核心层 + 游戏层 + 入口层”拆分。运行脚本迁移到 `scripts/`，根脚本保留兼容转发。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Python `http.server`

---

### Task 1: 建立目标目录骨架

**Files:**
- Create: `docs/`
- Create: `docs/assets/icons/`
- Create: `docs/styles/`
- Create: `docs/scripts/core/`
- Create: `docs/scripts/games/`
- Create: `scripts/`

**Step 1: 建目录（可逆）**
Run: `mkdir -p docs/assets/icons docs/styles docs/scripts/core docs/scripts/games scripts`
Expected: 目录创建成功。

**Step 2: 结构检查**
Run: `find docs scripts -maxdepth 3 -type d | sort`
Expected: 输出包含上述目录。

### Task 2: 迁移静态入口与样式资源

**Files:**
- Create: `docs/index.html`
- Create: `docs/styles/main.css`
- Modify: `docs/index.html`

**Step 1: 迁移并改引用**
- 将 `index.html` 内容迁至 `docs/index.html`
- 将 `style.css` 内容迁至 `docs/styles/main.css`
- 更新引用为 `/styles/main.css` 与 `/scripts/...`

**Step 2: 资源路径检查**
Run: `rg -n "style.css|game.js" docs/index.html`
Expected: 不再出现旧路径。

### Task 3: 拆分 JavaScript 为核心层与游戏层

**Files:**
- Create: `docs/scripts/core/ui.js`
- Create: `docs/scripts/core/game-manager.js`
- Create: `docs/scripts/core/loop.js`
- Create: `docs/scripts/games/tetris.js`
- Create: `docs/scripts/games/snake.js`
- Create: `docs/scripts/games/minesweeper.js`
- Create: `docs/scripts/games/dino.js`
- Create: `docs/scripts/games/flappy.js`
- Create: `docs/scripts/app.js`
- Source: `game.js`

**Step 1: 先定义全局导出协议**
- 每个模块写入 `window.GameHub.*` 命名空间，避免 bundler 依赖。

**Step 2: 拆分实现（保持行为一致）**
- 抽 UI 工具到 `core/ui.js`
- 抽管理与事件分发到 `core/game-manager.js`
- 抽主循环到 `core/loop.js`
- 每个游戏类单文件迁移
- `app.js` 装配菜单、游戏注册、启动逻辑

**Step 3: 语法验证（TDD 适配）**
Run: `node --check docs/scripts/core/ui.js && node --check docs/scripts/core/game-manager.js && node --check docs/scripts/core/loop.js && node --check docs/scripts/games/tetris.js && node --check docs/scripts/games/snake.js && node --check docs/scripts/games/minesweeper.js && node --check docs/scripts/games/dino.js && node --check docs/scripts/games/flappy.js && node --check docs/scripts/app.js`
Expected: 全部通过。

### Task 4: 迁移图标与运行脚本兼容改造

**Files:**
- Move/Create: `docs/assets/icons/favicon.svg`
- Move/Create: `docs/assets/icons/favicon.ico`
- Create: `scripts/run.sh`
- Modify: `run.sh`

**Step 1: 图标迁移**
- 迁移 favicon 文件到新路径。

**Step 2: 启动脚本改造**
- `scripts/run.sh`：`python3 -m http.server 8080 --bind 127.0.0.1 --directory docs`
- 根 `run.sh`：仅转调 `scripts/run.sh`

**Step 3: 权限与路径验证**
Run: `chmod +x run.sh scripts/run.sh`
Expected: 可执行。

### Task 5: 文档与验证

**Files:**
- Modify: `README.md`
- Optional cleanup: root legacy files

**Step 1: 更新 README**
- 新增目录说明与迁移后入口路径。

**Step 2: 运行验证**
Run: `./run.sh`
Expected: 打印 `http://localhost:8080`。

**Step 3: HTTP 验证**
Run: `curl -I http://localhost:8080 && curl -I http://localhost:8080/styles/main.css && curl -I http://localhost:8080/scripts/app.js && curl -I http://localhost:8080/assets/icons/favicon.svg`
Expected: 均返回 `200`。

**Step 4: 手工功能回归**
- 菜单进入 5 游戏
- 每个游戏可“返回菜单”
- 俄罗斯方块两个视觉开关有效
