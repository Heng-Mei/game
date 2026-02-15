#!/usr/bin/env bash
set -euo pipefail

echo "Open in browser: http://localhost:8080"
python3 -m http.server 8080 --bind 127.0.0.1 --directory public
