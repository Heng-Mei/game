#!/usr/bin/env bash
set -euo pipefail

# Spider should be wired into the app.
[[ -f docs/scripts/games/spider.js ]]
rg -n 'data-game="spider"' docs/index.html >/dev/null
rg -n 'scripts/games/spider\.js' docs/index.html >/dev/null
rg -n 'SpiderGame' docs/scripts/app.js >/dev/null
rg -n "spider:\s*'" docs/scripts/core/game-manager.js >/dev/null

# Minesweeper should expose Win7-like classic interactions.
rg -n 'BEGINNER|INTERMEDIATE|EXPERT' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'question|\?' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'chord|quick open|quick_open' docs/scripts/games/minesweeper.js >/dev/null
rg -n 'first.?click|safe' docs/scripts/games/minesweeper.js >/dev/null

echo "OK"
