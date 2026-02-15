# 小游戏大厅（静态前端分层结构）

## 目录结构

```text
.
├─ docs/
│  ├─ index.html
│  ├─ assets/icons/
│  ├─ styles/main.css
│  ├─ scripts/
│  │  ├─ app.js
│  │  ├─ core/
│  │  └─ games/
│  └─ plans/
├─ scripts/run.sh
├─ run.sh
└─ tests/
```

## 运行方式

```bash
./run.sh
```

终端会打印：

```text
http://localhost:8080
```

## 游戏列表
- 俄罗斯方块
- 贪吃蛇
- 扫雷
- 小恐龙跳障碍
- Flappy Bird

## 说明
- 进入页面先显示游戏菜单
- 所有游戏均支持返回菜单
- 支持移动端触控操作（分游戏控制面板）
- 手机端横屏和竖屏均可直接游玩
- 竖屏采用十字方向键布局，横屏采用左手方向盘 + 右手功能键布局
- GitHub Pages 发布根目录为 `docs/`
- 启动仍基于 Python `http.server`，未引入 npm 依赖
