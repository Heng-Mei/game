# Win7 经典蜘蛛纸牌 + 经典扫雷实现记录

日期：2026-02-15

## 实施项
- 新增 `docs/scripts/games/spider.js`
  - 经典发牌结构与 1/2/4 花色难度。
  - 同花连续移动、空列放置、发牌限制。
  - 自动移除 K->A 同花序列。
  - 计分、步数、用时、移动端动作接入。

- 重构 `docs/scripts/games/minesweeper.js`
  - 三档难度 + 自定义。
  - 右键三态标记、问号开关。
  - 快开(chord)、首击安全、胜负判定与 HUD。
  - 移动端模式：翻开 / 标记 / 快开。

- 框架接入
  - `docs/index.html`：菜单新增蜘蛛纸牌 + 脚本引入。
  - `docs/scripts/app.js`：注册 `SpiderGame`。
  - `docs/scripts/core/game-manager.js`：新增 spider 移动端按钮布局，扫雷新增快开与难度按钮。

- 验证脚本更新
  - `tests/structure_smoke.sh`、`tests/docs_publish_smoke.sh` 增加 spider 文件检查。
  - `tests/mobile_ui_smoke.sh`、`tests/mobile_actions_smoke.sh` 增加新交互检查。
  - 新增 `tests/spider_minesweeper_classic_smoke.sh` 作为本次能力回归测试。

## 验证命令
- `bash tests/spider_minesweeper_classic_smoke.sh`
- `bash tests/docs_publish_smoke.sh`
- `bash tests/pages_paths_smoke.sh`
- `bash tests/structure_smoke.sh`
- `bash tests/mobile_ui_smoke.sh`
- `bash tests/mobile_actions_smoke.sh`
- `for f in docs/scripts/core/*.js docs/scripts/games/*.js docs/scripts/app.js; do node --check "$f"; done`

## 结果
- 上述命令全部通过。

