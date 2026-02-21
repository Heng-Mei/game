# 俄罗斯方块电脑端现代化改造实现记录

日期：2026-02-21

## 实施内容
1. 俄罗斯方块核心逻辑
- 文件：`docs/scripts/games/tetris.js`
- 新增逆时针旋转动作：`rotate_ccw`。
- 新增 Hold 机制：`holdCurrentPiece()`，并限制每个当前方块仅可 Hold 一次。
- 新增键位系统：
  - 可配置键位映射
  - 绑定冲突自动解除旧绑定
  - 本地持久化
- 新增键盘长按状态机：
  - `keydown + keyup`
  - 可调 DAS/DSS 帧数

2. UI 与输入分发
- 文件：`docs/index.html`
  - 新增 Hold 卡片与预览画布（`holdCard` / `holdCanvas`）。
- 文件：`docs/scripts/core/ui.js`
  - 新增 `showHoldCanvas()`。
  - 设置项支持 `kind: action`（非开关按钮）。
- 文件：`docs/scripts/core/game-manager.js`
  - 新增 `keyup` 分发至当前游戏。

3. 样式
- 文件：`docs/styles/main.css`
  - 将 `holdCanvas` 纳入统一画布样式。

4. 缓存刷新
- 文件：`docs/index.html`
  - 脚本 query version 更新到 `v=20260221-1`。

5. 测试
- 新增：`tests/tetris_desktop_modern_smoke.sh`

## 验证命令
- `bash tests/tetris_desktop_modern_smoke.sh`
- `bash tests/mobile_actions_smoke.sh`
- `bash tests/mobile_ui_smoke.sh`
- `bash tests/docs_publish_smoke.sh`
- `bash tests/pages_paths_smoke.sh`
- `bash tests/structure_smoke.sh`
- `for f in docs/scripts/core/*.js docs/scripts/games/*.js docs/scripts/app.js; do node --check "$f"; done`

## 结果
- 所有命令通过。

