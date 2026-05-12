#!/usr/bin/env bash
set -euo pipefail

WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

echo "Installing @softzenit/b-board in temp directory..."
cd "$WORK_DIR"
npm init -y > /dev/null
npm install @softzenit/b-board > /dev/null

echo "Verifying package import..."
node --input-type=module <<'EOF'
import '@softzenit/b-board';
// In Node, customElements is not defined — just check the import doesn't throw
console.log('Import succeeded');
EOF

echo "Verifying UMD bundle loads..."
node -e "
const mod = require('@softzenit/b-board');
console.log('UMD require succeeded, exports:', Object.keys(mod));
"

echo "✅ Install verification passed"
