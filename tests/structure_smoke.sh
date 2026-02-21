#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/index.html"
  "docs/package.json"
  "docs/tsconfig.json"
  "docs/tsconfig.node.json"
  "docs/vite.config.ts"
  "docs/src/main.tsx"
  "docs/src/app/App.tsx"
  "docs/src/app/router.tsx"
  "docs/src/app/layouts/AppShell.tsx"
  "docs/src/styles/global.scss"
  "docs/src/styles/reset.scss"
  "docs/src/vite-env.d.ts"
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

legacy_removed=(
  "docs/styles/main.css"
  "docs/scripts/app.js"
  "docs/scripts/core/ui.js"
  "docs/scripts/core/game-manager.js"
  "docs/scripts/core/loop.js"
)

for file in "${legacy_removed[@]}"; do
  if [[ -f "$file" ]]; then
    echo "LEGACY_STILL_EXISTS: $file"
    exit 1
  fi
done

echo "OK"
