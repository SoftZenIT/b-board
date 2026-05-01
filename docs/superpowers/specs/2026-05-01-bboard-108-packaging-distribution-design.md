# BBOARD-108: Packaging & Distribution Setup — Design Spec

**Epic:** BBOARD-108 (Epic #25)
**Date:** 2026-05-01
**Status:** Approved

---

## Goal

Configure and automate the full packaging and distribution pipeline for `b-board` so that `0.1.0` can be published to npm and served via CDN, with automated versioning, changelog generation, and bundle size tracking for all future releases.

## Decisions

- **Registry:** Public npm (npmjs.com), open-source
- **First release:** `0.1.0` stable, shipped directly (no beta phase)
- **Versioning:** Semantic-release + Conventional Commits, fully automated on merge to `main`
- **Formats:** ESM + UMD only (no CJS — UMD covers CommonJS use cases)
- **CDN:** jsDelivr (zero-config, auto-serves from npm)
- **Release trigger:** Every merge to `main` containing a releasable commit

---

## Architecture

### Build Artifacts

The existing Vite lib build produces two bundles. Two additions:

1. **Minification** — verify `build.minify` is enabled in `vite.config.ts` (Vite default for lib mode is `true`, confirm explicitly)
2. **Source maps** — add `build.sourcemap: true` so devtools can map back to TypeScript source

Output in `dist/` after build:
```
dist/
  bboard.es.js          # ESM bundle (minified)
  bboard.es.js.map      # ESM source map
  bboard.umd.js         # UMD bundle (minified)
  bboard.umd.js.map     # UMD source map
  index.d.ts            # TypeScript declarations
  # chunked language data files (unchanged)
```

`package.json` `files: ["dist"]` already ensures only `dist/` ships to npm. No `.npmignore` needed.

### npm Package Config

`package.json` is already fully configured:
- `name`, `version`, `main`, `module`, `types`, `exports`, `files`, `license`, `author`, `keywords`
- No changes needed to `package.json` itself

### CDN URLs (automatic after publish)

```
# Specific version (recommended for production):
https://cdn.jsdelivr.net/npm/b-board@0.1.0/dist/bboard.umd.js

# Latest (for demos/prototyping only):
https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js
```

### Publish Pipeline

New file: `.github/workflows/publish.yml`

Triggered on: `push` to `main` branch.

Steps:
1. `actions/checkout@v4` with `fetch-depth: 0` (full history — semantic-release needs all tags)
2. `actions/setup-node@v4` with `registry-url: 'https://registry.npmjs.org'`
3. `npm ci`
4. `npm run build`
5. `npx semantic-release`

Required secrets (added once to GitHub repo settings):
- `NPM_TOKEN` — npm automation token (publish-scoped)
- `GITHUB_TOKEN` — built-in, no setup needed

semantic-release config (`.releaserc.json` at repo root):
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": true }],
    ["@semantic-release/github", {
      "successComment": "🎉 This PR is included in version ${nextRelease.version}"
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }]
  ]
}
```

### Conventional Commit → Version Mapping

| Commit prefix | Version bump | Example |
|---|---|---|
| `fix:` | patch | `0.1.0` → `0.1.1` |
| `feat:` | minor | `0.1.0` → `0.2.0` |
| `BREAKING CHANGE:` in footer | major | `0.1.0` → `1.0.0` |
| `chore:`, `docs:`, `test:`, `refactor:` | no release | — |

### Dry-Run in CI

Add a semantic-release dry-run step to `ci.yml` (runs on every PR):
```yaml
- name: Release dry-run
  run: npx semantic-release --dry-run
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This shows contributors what version would be released without actually publishing.

### Bundle Size Tracking

Tool: `size-limit` (added as dev dependency).

Config in `package.json`:
```json
"size-limit": [
  { "path": "dist/bboard.es.js", "limit": "50 kB" },
  { "path": "dist/bboard.umd.js", "limit": "50 kB" }
]
```

Step added to `ci.yml` after build:
```yaml
- name: Check bundle size
  run: npx size-limit
```

Thresholds set at `50 kB` initially — to be tuned after measuring actual built sizes.

### Installation Verification Script

New file: `scripts/verify-install.sh`

Runs after publish to confirm the published package is importable:
1. Create temp directory
2. `npm install b-board@latest`
3. Run a minimal Node.js script that imports the package and asserts `customElements.get('benin-keyboard')` is defined
4. Exit 0 on success, 1 on failure

Run manually post-publish or via `workflow_dispatch` in CI.

### Documentation Updates

**`docs-site/getting-started.md`** and **`docs-site/fr/getting-started.md`** — add "CDN / No-build Setup" section:
```html
<!-- Add to your HTML, no npm or build step needed -->
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>
<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>
```

**`CONTRIBUTING.md`** — add "Commit Message Convention" section explaining:
- The `feat:` / `fix:` / `BREAKING CHANGE:` format
- How commit messages determine the version bump
- Link to Conventional Commits spec

### Release Documentation

- **`CHANGELOG.md`** — auto-generated and maintained by `@semantic-release/changelog`. Lives at repo root. No manual editing.
- **GitHub Releases** — auto-created by `@semantic-release/github` with commit-derived release notes.

---

## File Map

### Modified
- `vite.config.ts` — confirm minification, add `sourcemap: true`
- `.github/workflows/ci.yml` — add dry-run step + size-limit step
- `docs-site/getting-started.md` — add CDN section
- `docs-site/fr/getting-started.md` — French mirror of CDN section
- `CONTRIBUTING.md` — add commit convention section

### New
- `.github/workflows/publish.yml` — publish pipeline
- `.releaserc.json` — semantic-release config
- `scripts/verify-install.sh` — post-publish verification
- `CHANGELOG.md` — generated on first release (semantic-release creates it)

### Dev Dependencies Added
- `semantic-release`
- `@semantic-release/changelog`
- `@semantic-release/git`
- `@semantic-release/github`
- `@semantic-release/npm`
- `@semantic-release/commit-analyzer`
- `@semantic-release/release-notes-generator`
- `size-limit`
- `@size-limit/preset-small-lib`

---

## Sub-task Coverage

| Sub-task | Covered by |
|---|---|
| 25.1 npm package config | Already done; source maps + minification confirmation |
| 25.2 Distribution bundles | vite.config.ts source maps; ESM+UMD confirmed |
| 25.3 CDN setup | jsDelivr URL docs in getting-started |
| 25.4 Publish pipeline | publish.yml + .releaserc.json |
| 25.5 Release docs | CHANGELOG.md + GitHub Releases via semantic-release |
| 25.6 Performance monitoring | size-limit in ci.yml |
| 25.7 Install verification | scripts/verify-install.sh |
| 25.8 Beta/prerelease channel | Not in scope — user chose stable-only for 0.1.0 |

---

## Out of Scope

- CJS bundle (UMD covers require() use cases)
- Beta/prerelease npm dist-tag (deferred — not needed for 0.1.0)
- Self-hosted CDN (jsDelivr is sufficient)
- Custom CDN domain (future work if needed)
