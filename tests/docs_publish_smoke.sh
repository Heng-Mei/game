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
  "docs/scripts/games/dino.js"
  "docs/scripts/games/flappy.js"
  "docs/assets/icons/favicon.svg"
  "docs/assets/icons/favicon.ico"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

if rg -n '(href|src)="/' docs/index.html >/dev/null; then
  echo "FAIL: found root-absolute asset paths in docs/index.html"
  rg -n '(href|src)="/' docs/index.html
  exit 1
fi

echo "OK"
