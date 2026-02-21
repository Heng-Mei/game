# 俄罗斯方块电脑端现代化改造设计

日期：2026-02-21

## 目标
- 仅针对电脑端增强俄罗斯方块交互能力。
- 新增左旋（逆时针旋转）。
- 新增自定义键位并持久化。
- 新增 Hold 暂存机制（每个下落方块仅可使用一次）。
- 新增按键响应帧数设置（DAS/DSS）。

## 范围与边界
- 电脑端：启用键盘增强能力与 Hold 预览。
- 移动端：保留现有触控按钮玩法，不引入额外复杂按键逻辑。

## 方案
1. 输入系统升级
- 将 `onKeyDown` 从固定映射改为可配置键位映射。
- 新增 `onKeyUp` + 按住状态机，实现 DAS 延迟后自动连发。

2. 游戏机制升级
- 在旋转逻辑中加入逆时针旋转。
- 引入 `holdPieceType` 和 `holdUsed` 状态，实现现代 Hold 交换规则。

3. UI 与设置
- 在侧栏新增 Hold 预览画布。
- 在设置面板中新增：
  - DAS/DSS 帧数循环调节。
  - 键位绑定入口与恢复默认。

## 数据持久化
- `localStorage`:
  - `gamehub.tetris.keybinds`
  - `gamehub.tetris.das_frames`

## 验证
- 新增 smoke：`tests/tetris_desktop_modern_smoke.sh`。
- 保留并回归现有 smoke 和 JS 语法检查。

