#!/usr/bin/env bash
set -euo pipefail

# Wiring
[[ -f docs/scripts/games/game2048.js ]]
rg -n 'data-game="game2048"' docs/index.html >/dev/null
rg -n 'scripts/games/game2048\.js' docs/index.html >/dev/null
rg -n 'Game2048' docs/scripts/app.js >/dev/null
rg -n "game2048" docs/scripts/app.js >/dev/null

# Manager integration for mobile behavior.
rg -n "game2048:\s*'canvas_only'" docs/scripts/core/game-manager.js >/dev/null
rg -n 'pointerup' docs/scripts/core/game-manager.js >/dev/null
rg -n 'pointercancel' docs/scripts/core/game-manager.js >/dev/null
rg -n 'onPointerUp' docs/scripts/core/game-manager.js >/dev/null
rg -n 'onPointerCancel' docs/scripts/core/game-manager.js >/dev/null

# Core classic 2048 rules.
rg -n 'SIZE\s*=\s*4|rows\s*=\s*4|cols\s*=\s*4|4x4' docs/scripts/games/game2048.js >/dev/null
rg -n 'Math\.random\(\)\s*<\s*0\.9\s*\?\s*2\s*:\s*4' docs/scripts/games/game2048.js >/dev/null
rg -n '2048' docs/scripts/games/game2048.js >/dev/null
rg -n 'merge|combine' docs/scripts/games/game2048.js >/dev/null
rg -n 'ArrowLeft|ArrowRight|ArrowUp|ArrowDown' docs/scripts/games/game2048.js >/dev/null
rg -n 'swipe|threshold|touch' docs/scripts/games/game2048.js >/dev/null
rg -n 'animation|slide|pop|movingTiles|mergePops|spawnPop' docs/scripts/games/game2048.js >/dev/null
rg -n 'lerp|ease|interpolate' docs/scripts/games/game2048.js >/dev/null

echo "OK"
