#!/usr/bin/env bash
set -euo pipefail

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "Installing b-board in temp directory..."
cd "$TMPDIR"
npm init -y > /dev/null
npm install b-board > /dev/null

echo "Verifying package import..."
node --input-type=module <<'EOF'
import 'b-board';
// In Node, customElements is not defined — just check the import doesn't throw
console.log('Import succeeded');
EOF

echo "Verifying UMD bundle loads..."
node -e "
const mod = require('b-board');
console.log('UMD require succeeded, exports:', Object.keys(mod));
"

echo "✅ Install verification passed"
