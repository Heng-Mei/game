#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/index.html"
  "docs/styles/main.css"
  "docs/scripts/app.js"
  "docs/scripts/core/ui.js"
  "docs/scripts/core/game-manager.js"
  "docs/scripts/core/loop.js"
  "docs/scripts/games/tetris.js"
  "docs/scripts/games/snake.js"
  "docs/scripts/games/minesweeper.js"
  "docs/scripts/games/spider.js"
  "docs/scripts/games/game2048.js"
  "docs/scripts/games/dino.js"
  "docs/scripts/games/flappy.js"
  "docs/assets/icons/favicon.svg"
  "docs/assets/icons/favicon.ico"
  "scripts/run.sh"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

echo "OK"
