#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f top-cartoes-premium.zip
zip -r top-cartoes-premium.zip dist/premium -x "*.DS_Store"
echo "Premium package created: top-cartoes-premium.zip"
