#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf docs/*
cp -r dist/free/* docs/
find docs -type f -exec chmod 644 {} +
find docs -type d -exec chmod 755 {} +
echo "Free build copied to docs/. Commit docs/ to publish via GitHub Pages."
