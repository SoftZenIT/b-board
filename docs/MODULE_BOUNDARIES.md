# BBOARD Module Boundaries

The dependency graph is strictly one-way. CI fails on violations.

---

## Dependency Diagram

```
┌──────────┐
│  public  │  No deps on other src/ modules
└────┬─────┘
     │
┌────▼─────┐
│   data   │  → public only
└────┬─────┘
     │
┌────┴─────────────────────────────────┐
│  core  │  composition  │  adapters  │  → data, public
└────┬───┴───────────────┴─────┬───────┘
     │                         │
┌────▼─────────────────────────▼───┐
│                ui                │  → core, public
└──────────────────────────────────┘
```

---

## Rules

| Module | May import from | Must NOT import from |
|--------|----------------|---------------------|
| `public` | nothing | data, core, composition, adapters, ui |
| `data` | public | core, composition, adapters, ui |
| `core` | data, public | composition, adapters, ui |
| `composition` | data, public | core, adapters, ui |
| `adapters` | core, public | composition, ui |
| `ui` | core, public | data, composition, adapters |

---

## Public vs Internal Exports

- **Public API** (`src/public/index.ts` → `src/index.ts`): types and factory functions consumers import from the npm package.
- **Internal modules** (`src/data/`, `src/core/`, etc.): not re-exported from `src/index.ts`. Consumers cannot import these directly.

---

## XSS Warning

Character data from `keyMap` and `compositionMap` must **never** be inserted into the DOM via `innerHTML`, `insertAdjacentHTML`, or similar. Always use `textContent` or Vue's `:text-content` binding. The `ui` module is responsible for safe rendering.

---

## Examples

```typescript
// ✅ Allowed: data imports from public
import type { KeyId } from '../public/types.js'

// ✅ Allowed: core imports from data
import { createDataLoader } from '../data/loader.js'

// ❌ Forbidden: data importing from core
import { StateMachine } from '../core/state-machine.js'  // CI FAIL

// ❌ Forbidden: ui importing from adapters
import { ReactAdapter } from '../adapters/react.js'  // CI FAIL
```
