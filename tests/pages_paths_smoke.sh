#!/usr/bin/env bash
set -euo pipefail

if rg -n '(href|src)="/' docs/index.html >/dev/null; then
  echo "FAIL: found root-absolute asset paths in docs/index.html"
  rg -n '(href|src)="/' docs/index.html
  exit 1
fi

echo "OK"
