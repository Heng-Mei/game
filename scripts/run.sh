#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../docs"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Open in browser: http://localhost:5173"
npm run dev -- --host 127.0.0.1 --port 5173
