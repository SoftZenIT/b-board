# BBOARD Code Style Guide

Enforced automatically by ESLint + Prettier where noted. Everything else is enforced in code review.

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Variables, functions, methods | camelCase | `loadLayoutShape`, `compositionMap` |
| Types, interfaces, classes | PascalCase | `LayoutShape`, `DataLoader`, `ValidationError` |
| Type aliases for IDs | PascalCase + `Id` suffix | `LayoutVariantId`, `LanguageId` |
| Constants (module-level) | UPPER_SNAKE_CASE | `LAYOUT_PATHS`, `REGISTRY_PATH` |
| Files | kebab-case | `layout-resolver.ts`, `integrity-checker.ts` |
| Test files | same name as source + `.test.ts` | `loader.test.ts` co-located with `loader.ts` |

---

## TypeScript Rules

- **No `any`** — use `unknown` at boundaries, then narrow via type guards or validators.
- **Strict mode** — `tsconfig.json` uses `"strict": true`. Never disable with `// @ts-ignore`.
- **Branded types for IDs** — use `createKeyId()`, never cast raw strings to `KeyId` directly.
- **`as const` for enums** — define value lists as `const` arrays; derive types from them:
  ```typescript
  const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi'] as const
  export type LanguageId = (typeof LANGUAGE_IDS)[number]
  ```

---

## File Structure

Each file has one clear responsibility. Split by domain, not by technical layer.

- `src/public/` — public API only (types + factory functions consumers can import)
- `src/data/` — data model interfaces, validators, loader, resolver
- `src/core/` — runtime state machine (Phase 2)
- `src/composition/` — composition engine (Phase 2)
- `src/adapters/` — framework adapters (Phase 3)
- `src/ui/` — Vue keyboard components (Phase 2)

See `docs/MODULE_BOUNDARIES.md` for import rules between modules.

---

## Imports

Group imports in this order (blank line between groups):

```typescript
// 1. Node built-ins
import { readFile } from 'node:fs/promises'

// 2. External packages
import Ajv from 'ajv'

// 3. Internal — public API
import type { KeyId, LanguageId } from '../public/types.js'

// 4. Internal — sibling modules
import { validateLayoutShape } from './validator.js'
```

Always include `.js` extension on local imports (required for ESM).

---

## Error Handling

Follow the `[Module] Action: detail` format — see `docs/ERROR_MESSAGE_STANDARDS.md`.

```typescript
// ✅ Good
throw new DataLoaderError(`[DataLoader] HTTP ${res.status} loading '${path}'`)

// ❌ Bad — no module prefix, no context
throw new Error('fetch failed')
```

Sanitize internal detail in production:
```typescript
const detail = import.meta.env?.DEV === true ? err.message : 'check console for details'
```

---

## Comments

- **Public API**: full TSDoc — see `docs/TSDOC_STANDARDS.md`
- **Private helpers**: brief inline comment only if the logic is non-obvious
- **No `// TODO` in committed code** — create a Jira ticket instead

---

## Formatting

Prettier handles all formatting automatically (`npm run format`). Key settings (see `.prettierrc`):
- Single quotes
- No semicolons
- 2-space indent
- 100-char line width
