#!/usr/bin/env bash
set -euo pipefail

required=(
  "docs/index.html"
  "docs/package.json"
  "docs/tsconfig.json"
  "docs/vite.config.ts"
  "docs/src/main.tsx"
  "docs/src/app/App.tsx"
  "docs/src/app/router.tsx"
  "docs/assets/icons/favicon.svg"
  "docs/assets/icons/favicon.ico"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING: $file"
    exit 1
  fi
done

if [[ -d docs/scripts ]]; then
  echo "FAIL: docs/scripts directory should be removed in React refactor"
  exit 1
fi

if rg -n '(href|src)="/' docs/index.html >/dev/null; then
  echo "FAIL: found root-absolute asset paths in docs/index.html"
  rg -n '(href|src)="/' docs/index.html
  exit 1
fi

rg -n 'src="./src/main\.tsx"' docs/index.html >/dev/null
rg -n "base:\\s*\"\\./\"|base:\\s*'\\./'" docs/vite.config.ts >/dev/null

if rg -n 'scripts/core|scripts/games|styles/main\\.css' docs/index.html >/dev/null; then
  echo "FAIL: legacy static runtime references still exist in docs/index.html"
  rg -n 'scripts/core|scripts/games|styles/main\\.css' docs/index.html
  exit 1
fi

echo "OK"
