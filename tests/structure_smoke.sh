#!/usr/bin/env bash
set -euo pipefail

required=(
  "public/index.html"
  "public/styles/main.css"
  "public/scripts/app.js"
  "public/scripts/core/ui.js"
  "public/scripts/core/game-manager.js"
  "public/scripts/core/loop.js"
  "public/scripts/games/tetris.js"
  "public/scripts/games/snake.js"
  "public/scripts/games/minesweeper.js"
  "public/scripts/games/dino.js"
  "public/scripts/games/flappy.js"
  "public/assets/icons/favicon.svg"
  "public/assets/icons/favicon.ico"
  "scripts/run.sh"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

echo "OK"
