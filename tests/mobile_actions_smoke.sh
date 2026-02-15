#!/usr/bin/env bash
set -euo pipefail

rg -n 'dispatchAction\(' docs/scripts/core/game-manager.js >/dev/null
rg -n 'setMobileControls\(' docs/scripts/core/ui.js >/dev/null
rg -n 'setInfoDrawer\(' docs/scripts/core/ui.js >/dev/null
rg -n 'setFloatingNext\(' docs/scripts/core/ui.js >/dev/null
rg -n 'setOrientationOverlay\(' docs/scripts/core/ui.js >/dev/null
rg -n 'mobileControlPolicies' docs/scripts/core/game-manager.js >/dev/null
rg -n 'infoDrawerOpen' docs/scripts/core/game-manager.js >/dev/null
rg -n 'loadInfoDrawerState' docs/scripts/core/game-manager.js >/dev/null
rg -n "dino: 'canvas_only'" docs/scripts/core/game-manager.js >/dev/null
rg -n "flappy: 'canvas_only'" docs/scripts/core/game-manager.js >/dev/null
rg -n 'primary_tap' docs/scripts/games/flappy.js >/dev/null
rg -n 'primary_tap' docs/scripts/games/dino.js >/dev/null
rg -n 'primary_tap' docs/scripts/games/snake.js >/dev/null
rg -n 'primary_tap' docs/scripts/games/tetris.js >/dev/null
rg -n 'double_tap_restart' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'onAction\(action\)' docs/scripts/games/tetris.js >/dev/null
rg -n 'onAction\(action\)' docs/scripts/games/snake.js >/dev/null
rg -n 'onAction\(action\)' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'onAction\(action\)' docs/scripts/games/dino.js >/dev/null
rg -n 'onAction\(action\)' docs/scripts/games/flappy.js >/dev/null

echo "OK"
