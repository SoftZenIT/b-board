# BBOARD-108: Packaging & Distribution Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the full packaging and distribution pipeline for `b-board` — build config, npm publish via semantic-release, jsDelivr CDN docs, bundle size tracking, and install verification.

**Architecture:** semantic-release runs in a new `publish.yml` GitHub Actions workflow triggered on every push to `main`; it analyzes Conventional Commits, bumps `package.json`, generates `CHANGELOG.md`, creates a GitHub Release, and publishes to npm. `size-limit` runs in the existing `ci.yml` after every build to catch bundle regressions. A shell script verifies the published package post-release.

**Tech Stack:** semantic-release, size-limit, GitHub Actions, Vite lib mode, jsDelivr CDN.

**Branch:** `feat/bboard-107-documentation` (current branch — continue on it)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `vite.config.ts` | Modify | Add `sourcemap: true`; confirm minification |
| `.releaserc.json` | Create | semantic-release plugin config |
| `.github/workflows/publish.yml` | Create | Publish pipeline (triggered on push to main) |
| `.github/workflows/ci.yml` | Modify | Add dry-run + size-limit steps after build |
| `package.json` | Modify | Add `size-limit` config + `release` script |
| `scripts/verify-install.sh` | Create | Post-publish install verification |
| `CONTRIBUTING.md` | Modify | Add commit convention → version bump table |
| `docs-site/getting-started.md` | Modify | Add CDN / no-build setup section |
| `docs-site/fr/getting-started.md` | Modify | French mirror of CDN section |

---

## Task 1: Add source maps to Vite build config

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read current vite.config.ts**

Read `vite.config.ts`. Confirm the `build` section does not have `sourcemap` or `minify` set explicitly.

Current `build` block:
```ts
build: {
  lib: {
    entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    name: 'BBoardKeyboard',
    fileName: (format) => `bboard.${format}.js`,
  },
  rollupOptions: {
    external: ['vue'],
    output: {
      globals: {
        vue: 'Vue',
      },
    },
  },
},
```

- [ ] **Step 2: Add sourcemap to build config**

Replace the `build` block with:

```ts
build: {
  sourcemap: true,
  lib: {
    entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    name: 'BBoardKeyboard',
    fileName: (format) => `bboard.${format}.js`,
  },
  rollupOptions: {
    external: ['vue'],
    output: {
      globals: {
        vue: 'Vue',
      },
    },
  },
},
```

Note: `minify` defaults to `'esbuild'` in Vite lib mode — no explicit config needed.

- [ ] **Step 3: Run build and verify source maps are emitted**

```bash
npm run build
ls dist/*.map
```

Expected: `dist/bboard.es.js.map` and `dist/bboard.umd.js.map` both present.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "build: add source maps to lib build output"
```

---

## Task 2: Install semantic-release and size-limit

**Files:**
- Modify: `package.json` (dev dependencies only — via npm install)

- [ ] **Step 1: Install semantic-release plugins**

```bash
npm install --save-dev \
  semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  @semantic-release/commit-analyzer \
  @semantic-release/release-notes-generator
```

- [ ] **Step 2: Install size-limit**

```bash
npm install --save-dev size-limit @size-limit/preset-small-lib
```

- [ ] **Step 3: Verify installations**

```bash
npx semantic-release --version
npx size-limit --version
```

Expected: both print version strings without errors.

- [ ] **Step 4: Commit package.json and package-lock.json**

```bash
git add package.json package-lock.json
git commit -m "chore: add semantic-release and size-limit dev dependencies"
```

---

## Task 3: Add size-limit config and release script to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add size-limit config to package.json**

After the `"keywords"` array in `package.json`, add:

```json
"size-limit": [
  { "path": "dist/bboard.es.js", "limit": "50 kB" },
  { "path": "dist/bboard.umd.js", "limit": "50 kB" }
],
```

- [ ] **Step 2: Add release script to scripts section**

In the `"scripts"` object, add after `"docs:api"`:

```json
"release": "semantic-release"
```

- [ ] **Step 3: Run build then size-limit to verify thresholds**

```bash
npm run build
npx size-limit
```

Expected output: a table showing both bundles with their sizes and ✅ status (sizes should be well under 50 kB — if either bundle exceeds 50 kB, raise the limit to the next round number above the actual size).

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "build: add size-limit config and release script"
```

---

## Task 4: Create semantic-release config

**Files:**
- Create: `.releaserc.json`

- [ ] **Step 1: Create .releaserc.json**

Create `.releaserc.json` at the repo root:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {
      "npmPublish": true
    }],
    ["@semantic-release/github", {
      "successComment": "🎉 This is included in version ${nextRelease.version}"
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json", "package-lock.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }]
  ]
}
```

- [ ] **Step 2: Verify config is valid JSON**

```bash
node -e "require('./.releaserc.json'); console.log('valid')"
```

Expected: prints `valid`.

- [ ] **Step 3: Run semantic-release dry-run locally**

```bash
npx semantic-release --dry-run --no-ci
```

Expected: outputs analysis of commits since last tag. It will say "no release" if no releasable commits are present — that is fine. It must NOT error on the config.

- [ ] **Step 4: Commit**

```bash
git add .releaserc.json
git commit -m "chore: add semantic-release config"
```

---

## Task 5: Create publish GitHub Actions workflow

**Files:**
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create publish.yml**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  push:
    branches: [main]

jobs:
  publish:
    name: Release & Publish
    runs-on: ubuntu-22.04
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Verify YAML syntax**

```bash
npx js-yaml .github/workflows/publish.yml
```

Expected: prints the parsed YAML object without errors. If `js-yaml` is not available, run:

```bash
node -e "
const fs = require('fs');
const yaml = require('js-yaml');
yaml.load(fs.readFileSync('.github/workflows/publish.yml', 'utf8'));
console.log('valid');
" 2>/dev/null || python3 -c "import yaml; yaml.safe_load(open('.github/workflows/publish.yml')); print('valid')"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: add publish workflow with semantic-release"
```

---

## Task 6: Add dry-run and size-limit steps to ci.yml

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Read current ci.yml**

Read `.github/workflows/ci.yml`. Locate the `Build` step and the end of the `ci` job steps.

- [ ] **Step 2: Add size-limit step after Build step**

After the `Upload build artifacts` step in the `ci` job, add:

```yaml
      - name: Check bundle size
        run: npx size-limit
```

- [ ] **Step 3: Add semantic-release dry-run step after size-limit**

After the `Check bundle size` step, add:

```yaml
      - name: Release dry-run
        run: npx semantic-release --dry-run
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 4: Verify YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('valid')"
```

Expected: prints `valid`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add bundle size check and release dry-run to CI pipeline"
```

---

## Task 7: Create install verification script

**Files:**
- Create: `scripts/verify-install.sh`

- [ ] **Step 1: Create scripts/verify-install.sh**

```bash
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
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/verify-install.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-install.sh
git commit -m "chore: add post-publish install verification script"
```

---

## Task 8: Update CONTRIBUTING.md with commit convention

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Read current CONTRIBUTING.md**

Read `CONTRIBUTING.md`. Locate the "Commit Message Standards" section (currently at line ~17).

- [ ] **Step 2: Replace the Commit Message Standards section**

Replace the existing "Commit Message Standards" section with:

```markdown
## Commit Message Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/). Commit messages directly control automated versioning — the release pipeline reads your commits to determine the next version number.

Format: `type(scope): short description`

### Version bump rules

| Commit type | Example | Version bump |
|---|---|---|
| `feat:` | `feat(core): add dendi language profile` | **minor** (`0.1.0` → `0.2.0`) |
| `fix:` | `fix(data): handle missing tone mark` | **patch** (`0.1.0` → `0.1.1`) |
| `BREAKING CHANGE:` in footer | any commit + `BREAKING CHANGE: removed X` | **major** (`0.1.0` → `1.0.0`) |
| `chore:`, `docs:`, `test:`, `refactor:` | — | **no release** |

### Examples

```
feat(core): add state machine transition validation
fix(data): handle missing language profile gracefully
test(ui): add desktop keyboard render snapshot
docs(architecture): update module boundary diagram
```

A dry-run of the release pipeline runs on every PR — the CI output shows exactly what version your commits would produce before merging.
```

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add commit convention and version bump table to CONTRIBUTING"
```

---

## Task 9: Add CDN section to docs getting-started pages

**Files:**
- Modify: `docs-site/getting-started.md`
- Modify: `docs-site/fr/getting-started.md`

- [ ] **Step 1: Read docs-site/getting-started.md**

Read `docs-site/getting-started.md`. Locate the `## Installation` section (currently starts at line ~9).

- [ ] **Step 2: Add CDN section after Installation in docs-site/getting-started.md**

After the `## Installation` section (after the `npm install b-board` code block), add:

```markdown
### CDN / No-build Setup

To use `b-board` without a build step, load the UMD bundle directly from jsDelivr:

```html
<!-- Pin to a specific version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/npm/b-board@0.1.0/dist/bboard.umd.js"></script>

<!-- Or always load the latest version (good for prototyping) -->
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>

<!-- Then use the element directly -->
<benin-keyboard language="yoruba" theme="auto" open></benin-keyboard>
```

No `import` or bundler needed. The custom element registers itself when the script loads.
```

- [ ] **Step 3: Read docs-site/fr/getting-started.md**

Read `docs-site/fr/getting-started.md`. Locate the `## Installation` section.

- [ ] **Step 4: Add French CDN section to docs-site/fr/getting-started.md**

After the `## Installation` section, add the French translation:

```markdown
### Configuration via CDN (sans outil de build)

Pour utiliser `b-board` sans étape de build, chargez le bundle UMD directement depuis jsDelivr :

```html
<!-- Épingler à une version spécifique (recommandé en production) -->
<script src="https://cdn.jsdelivr.net/npm/b-board@0.1.0/dist/bboard.umd.js"></script>

<!-- Ou toujours charger la dernière version (pratique pour les prototypes) -->
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>

<!-- Puis utiliser l'élément directement -->
<benin-keyboard language="yoruba" theme="auto" open></benin-keyboard>
```

Aucun `import` ni bundler nécessaire. L'élément personnalisé s'enregistre automatiquement au chargement du script.
```

- [ ] **Step 5: Build docs and verify no dead links**

```bash
npm run docs:build
```

Expected: exits 0 with no errors.

- [ ] **Step 6: Commit**

```bash
git add docs-site/getting-started.md docs-site/fr/getting-started.md
git commit -m "docs: add CDN/no-build setup section to getting started guides"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run full build**

```bash
npm run build
ls dist/
```

Expected: `bboard.es.js`, `bboard.es.js.map`, `bboard.umd.js`, `bboard.umd.js.map`, `index.d.ts`, plus chunked data files.

- [ ] **Step 2: Run size-limit**

```bash
npx size-limit
```

Expected: both bundles show ✅ under their limits.

- [ ] **Step 3: Run semantic-release dry-run**

```bash
npx semantic-release --dry-run --no-ci
```

Expected: runs without config errors. Reports either a pending release or "no release" — both are correct.

- [ ] **Step 4: Run docs build**

```bash
npm run docs:build
```

Expected: exits 0.

- [ ] **Step 5: Verify all new files exist**

```bash
ls .releaserc.json \
   .github/workflows/publish.yml \
   scripts/verify-install.sh \
   CHANGELOG.md 2>/dev/null || echo "CHANGELOG.md not yet created (will be created on first release — OK)"
```

Expected: first three files present. `CHANGELOG.md` absence is fine — semantic-release creates it on first publish.

- [ ] **Step 6: Log final commits**

```bash
git log --oneline -15
```

Report the list of commits added for this feature.
