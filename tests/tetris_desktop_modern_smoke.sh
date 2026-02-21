#!/usr/bin/env bash
set -euo pipefail

# Desktop-only modern tetris capabilities
rg -n "rotate_ccw|rotateLeft|counter.?clockwise" docs/scripts/games/tetris.js >/dev/null
rg -n "hold" docs/scripts/games/tetris.js >/dev/null
rg -n "keybind|key binding|键位" docs/scripts/games/tetris.js >/dev/null
rg -n "DAS|DSS|按键响应帧" docs/scripts/games/tetris.js >/dev/null

# UI hook for hold preview
rg -n "id=\"holdCard\"|id=\"holdCanvas\"" docs/index.html >/dev/null
rg -n "showHoldCanvas|holdCanvas" docs/scripts/core/ui.js >/dev/null

echo "OK"
