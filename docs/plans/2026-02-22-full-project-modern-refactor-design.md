# 全项目现代化重构设计（React + Phaser）

日期：2026-02-22

## 1. 目标与边界

### 目标
- 将当前原生 JS + Canvas 的小游戏站点重构为更现代、可维护的工程。
- 采用成熟技术栈：React + Vite + TypeScript + Phaser v3.90。
- 全站提供两套主题（日间/夜间），并支持系统跟随与手动切换持久化。
- 统一菜单、游戏内 UI、各游戏配色与交互范式，贴近现代扁平简约风。
- 保持各游戏核心规则不变，同时允许交互与手感优化。

### 边界
- 一次性全量迁移全部游戏（非分阶段逐游戏上线）。
- React 承载系统级 UI（菜单/设置/弹窗），Phaser 负责游戏渲染与输入。
- Phaser 版本使用 v3.90 正式版，架构预留未来 v4 升级位。

## 2. 架构方案与取舍

### 已确认路线
- 单仓库单应用：React + Vite + TypeScript。
- 全游戏渲染统一使用 Phaser（而非 DOM/SVG/Canvas 混合）。
- 系统 UI 由 React 统一控制。

### 关键原因
- 保证游戏运行时能力与性能上限（输入、场景、动画、资源管理）。
- 保持菜单、设置、弹窗等复杂交互的可维护性与可测试性。
- 为后续新增游戏与主题扩展建立统一工程底座。

## 3. 目标目录结构

- `src/app`：应用壳层、路由、布局框架
- `src/ui`：通用组件（按钮、卡片、抽屉、模态、表单）
- `src/theme`：日/夜 token、语义色、排版、动效参数
- `src/game-core`：PhaserBridge、基类 Scene、输入与事件协议
- `src/games/*`：各游戏模块（tetris/snake/minesweeper/spider/flappy/dino/g2048）
- `src/features/menu`：游戏大厅与入口
- `src/features/settings`：全局设置中心（主题、音量、键位、辅助）
- `src/shared`：类型、常量、工具
- `tests/unit`：Vitest 单测
- `tests/e2e`：Playwright 端到端

## 4. 组件分层与数据流

### 页面层
- `AppShell`：主题注入、全局快捷键、路由
- `MenuPage`：游戏卡片大厅
- `GamePage`：游戏容器 + 信息面板 + 移动端底部抽屉
- `SettingsModal`：统一设置中心
- `GameOverlay`：暂停/胜利/失败/确认模态

### 状态分层
- `uiStore`：主题、抽屉、模态状态
- `settingsStore`：键位、音量、动画强度、辅助选项
- `gameSessionStore`：当前游戏、分数、计时、运行状态
- `progressStore`：最高分、历史、成就（本地持久化）

### React <-> Phaser 通信协议
- React -> Phaser：`BOOT_GAME`, `APPLY_THEME`, `APPLY_SETTINGS`, `PAUSE`, `RESUME`, `RESTART`
- Phaser -> React：`GAME_READY`, `SCORE_CHANGED`, `STATE_CHANGED`, `REQUEST_MODAL`, `REQUEST_TOAST`

## 5. 视觉系统（日/夜 + 扁平现代）

### 视觉方向
- Flat / Minimal / High-legibility / Soft-contrast
- 降低装饰噪音，以语义色、留白、字号建立层级。

### 主题机制
- 默认跟随系统主题，允许手动覆盖并持久化。
- 仅暴露语义 token：`bg/surface/elevated/text/muted/primary/success/warn/danger/grid/focus`。
- React UI 与 Phaser 场景共用同一 token 快照，避免风格割裂。

### 游戏色彩统一规则
- 禁止在游戏代码中硬编码“站点外独立调色板”。
- 扫雷数字色、2048 数值色阶、俄罗斯方块方块色统一走主题生成策略。
- 日/夜两套均需通过可读性校验（对比度与状态辨识）。

## 6. 游戏交互重构细则

### 通用
- 统一顶栏 HUD（标题、分数、计时、暂停、设置、返回）。
- 桌面端信息侧栏 + 移动端底部抽屉（可固定关键模块）。
- 关键操作统一模态确认（重开、切难度、退出对局）。

### 俄罗斯方块
- 键位设置弹窗化：按键录入、冲突检测、恢复默认、实时测试。
- 保持现代机制：Hold、预览、DAS/ARR、软降/硬降设置。

### 扫雷
- 保持 Win7 经典规则（三态标记、快开、经典难度）。
- 视觉主题化，棋盘与网站整体风格统一。

### 蜘蛛纸牌
- 保持经典规则（同花序列、发牌逻辑、难度）。
- 牌面与花色做扁平现代化重绘，保留高辨识度。

### 2048 / Snake / Flappy / Dino
- 2048 保持规则并统一配色与动效参数。
- Flappy/Dino 维持轻操作策略，尽量减少冗余虚拟按键。
- 失败与暂停交互统一使用 overlay 与快捷操作。

## 7. 迁移计划与验收标准

### 迁移阶段（一次性发布）
1. 新工程脚手架与基础设施（Vite/TS/路由/状态/测试）
2. 主题系统与通用 UI 组件库
3. PhaserBridge 与统一事件协议
4. 各游戏迁移与对局 UI 改造
5. 联调、性能优化、可访问性校验
6. GitHub Pages 发布切换与回归

### 验收标准
- 功能：全部游戏可启动、可完整游玩、核心规则不回退。
- 视觉：菜单与游戏内 UI 在日/夜主题下统一且可读。
- 交互：移动端与桌面端操作链路无阻断（含抽屉/弹窗/触控）。
- 性能：主流移动设备可稳定运行，关键场景无明显掉帧。
- 质量：单测 + E2E 覆盖关键路径，发布前全绿。

## 8. 参考来源（主源）
- Phaser React+TS 官方模板：
  - https://github.com/phaserjs/template-react-ts
- Phaser v3.90 发布信息：
  - https://phaser.io/news/2025/05/phaser-v390-released
- Phaser v4 RC 信息：
  - https://phaser.io/news/2025/12/phaser-v4-rc6-released
- Vite 官方文档：
  - https://vite.dev/guide/
- React 官方新项目建议：
  - https://react.dev/learn/start-a-new-react-project
