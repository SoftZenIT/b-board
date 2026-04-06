# Framework Interoperability Testing & Examples — Design Spec

**Epic:** BBOARD-57  
**Tasks:** BBOARD-90 through BBOARD-96  
**Date:** 2025-07-21

## Overview

Validate that `<benin-keyboard>` works seamlessly across React, Vue 3, and Angular by building sample apps, E2E tests, integration guides, pitfall docs, cross-framework consistency tests, and CI automation.

## Implementation Phases

- **Phase A** — Sample apps + per-app E2E tests (BBOARD-90, 91, 92)
- **Phase B** — Integration guides + pitfalls docs (BBOARD-93, 94)
- **Phase C** — Cross-framework consistency tests + CI (BBOARD-95, 96)

Each phase must be production-grade before moving to the next.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Library reference | `"b-board": "file:../../"` symlink | Industry standard for monorepo examples; always in sync |
| Angular setup | Lightweight Vite + standalone components | Avoids Angular CLI overhead; uses `@analogjs/vite-plugin-angular` |
| E2E strategy | Hybrid (per-app smoke + root consistency) | Best of isolation and cross-framework verification |
| Integration style | Direct web component usage (no wrappers) | Most honest representation of real consumer DX |
| CI separation | Separate `framework-tests.yml` workflow | Doesn't slow down core `ci.yml` pipeline |

---

## Phase A: Sample Apps (BBOARD-90, 91, 92)

### Project Structure

```
examples/
├── react-sample-app/        # Vite + React 18 + TypeScript
│   ├── package.json          # "b-board": "file:../../"
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── playwright.config.ts
│   ├── src/
│   │   ├── App.tsx           # Main demo component
│   │   ├── main.tsx          # Entry point
│   │   └── bboard.d.ts       # JSX.IntrinsicElements type augmentation
│   └── e2e/
│       └── keyboard.spec.ts  # Playwright smoke tests
│
├── vue3-sample-app/          # Vite + Vue 3 + TypeScript (Composition API)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── playwright.config.ts
│   ├── src/
│   │   ├── App.vue           # Demo with v-on custom events
│   │   ├── main.ts           # Entry + custom element config
│   │   └── bboard.d.ts       # GlobalComponents augmentation
│   └── e2e/
│       └── keyboard.spec.ts
│
└── angular-sample-app/       # Vite + Angular standalone (lightweight)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── playwright.config.ts
    ├── src/
    │   ├── app.component.ts  # Standalone component + CUSTOM_ELEMENTS_SCHEMA
    │   ├── main.ts           # Bootstrap
    │   └── bboard.d.ts       # HTMLElementTagNameMap augmentation
    └── e2e/
        └── keyboard.spec.ts
```

### Demo App Behavior (All 3 Apps)

Each app implements an identical demo scenario:

1. **Language selector** — Dropdown switching between Yoruba, Fon, Baatonum, Dendi
2. **Text area** — Receives keyboard output via `bboard-key-press` events
3. **Keyboard** — `<benin-keyboard language="yoruba" surface="desktop">`
4. **Theme toggle** — Light/dark mode switch
5. **Error display** — Shows `bboard-error` events if any occur

### Framework-Specific Patterns

| Pattern | React 18 | Vue 3 | Angular |
|---------|----------|-------|---------|
| Event handling | `ref` + `addEventListener` in `useEffect` | `v-on:bboard-key-press` | `(bboard-key-press)` template binding |
| Property binding | JSX attributes | `:language="lang"` | `[attr.language]="lang"` |
| State management | `useState` hooks | `ref()` from Composition API | Class properties / signals |
| Typing | `JSX.IntrinsicElements` augmentation | `GlobalComponents` augmentation | `CUSTOM_ELEMENTS_SCHEMA` |
| Cleanup | `useEffect` return cleanup | `onUnmounted` | `ngOnDestroy` |

### Per-App E2E Tests

Each `e2e/keyboard.spec.ts` verifies:

1. **Renders** — Keyboard custom element exists and is visible
2. **Key press** — Clicking a key emits `bboard-key-press` and text appears in textarea
3. **Language switch** — Changing dropdown updates keyboard layout
4. **Theme toggle** — Light/dark switch applies CSS changes
5. **Error display** — Error events are caught and shown (if triggered)

Dev server ports: React 5174, Vue 5175, Angular 5176.

---

## Phase B: Documentation (BBOARD-93, 94)

### Integration Guides (`docs/frameworks/`)

One guide per framework:

**`react-integration.md`:**
- Installation and setup
- Type declarations (`bboard.d.ts` with `JSX.IntrinsicElements`)
- Event handling (React 18 `ref` + `addEventListener` vs React 19 native custom element events)
- Property/attribute binding
- Handling composition (tone/nasal modifiers)
- SSR considerations (Next.js)

**`vue3-integration.md`:**
- Installation and setup
- Custom element config in `vite.config.ts` (`isCustomElement`)
- `v-on` for custom events (`@bboard-key-press`)
- `v-bind` for properties (`:language="lang"`)
- Composition API patterns
- Nuxt considerations

**`angular-integration.md`:**
- Installation and setup
- `CUSTOM_ELEMENTS_SCHEMA` in standalone components
- Event binding syntax (`(bboard-key-press)="onKeyPress($event)"`)
- Property binding (`[attr.language]="lang"`)
- Zone.js and change detection
- Standalone vs NgModule patterns

### Pitfalls Docs (`docs/frameworks/`)

One doc per framework with 5+ pitfalls each:

**`react-pitfalls.md`:**
1. React re-rendering destroying custom element internal state
2. Event listener not cleaned up in `useEffect`
3. Boolean attribute binding (attribute vs property)
4. SSR hydration mismatch with custom elements
5. `React.createElement` not forwarding custom events

**`vue3-pitfalls.md`:**
1. Missing `isCustomElement` config causing Vue to treat `<benin-keyboard>` as Vue component
2. `v-model` not working (web components don't emit `input`/`update:modelValue`)
3. Slot content not rendering in Shadow DOM
4. Vue DevTools not inspecting custom element internals
5. HMR not updating custom element definitions

**`angular-pitfalls.md`:**
1. Missing `CUSTOM_ELEMENTS_SCHEMA` causing template compilation errors
2. Zone.js patching custom element events incorrectly
3. Change detection not triggered by custom events outside Angular zone
4. `[property]` vs `[attr.property]` binding confusion
5. AOT compilation stripping custom element attributes

Each pitfall includes: problem description, code showing the mistake, solution code, and explanation.

---

## Phase C: Consistency Tests & CI (BBOARD-95, 96)

### Cross-Framework Consistency Tests

File: `tests/e2e/framework-interop/consistency.spec.ts`

Tests start all 3 dev servers and verify identical behavior:

1. **Key output consistency** — Same key press produces same `bboard-key-press` event detail across all 3 frameworks
2. **Layout consistency** — Language switching produces consistent keyboard layouts
3. **Composition consistency** — Tone/nasal modifier composition works identically
4. **Visual consistency** — Screenshot comparison across frameworks (same viewport size)
5. **Error handling consistency** — Error events have same structure across frameworks

### CI/CD Workflow

File: `.github/workflows/framework-tests.yml`

```yaml
name: Framework Interoperability Tests
on:
  push:
    branches: ['*']
  pull_request:
    branches: [main]

jobs:
  build-library:
    # Build b-board dist
  test-react:
    needs: build-library
    # Install, build, and test React sample app
  test-vue:
    needs: build-library
    # Install, build, and test Vue sample app
  test-angular:
    needs: build-library
    # Install, build, and test Angular sample app
  consistency-tests:
    needs: [test-react, test-vue, test-angular]
    # Run cross-framework consistency tests
```

- **Matrix:** Node 18 and 20
- **Artifacts:** Upload Playwright HTML reports on failure
- **Caching:** Cache node_modules for each sample app

---

## Port Assignments

| App | Dev Server Port |
|-----|----------------|
| Main b-board | 5173 |
| React sample | 5174 |
| Vue 3 sample | 5175 |
| Angular sample | 5176 |

## Dependencies

- Phase A tasks are independent (can be parallelized)
- Phase B depends on Phase A (docs based on real implementation experience)
- Phase C depends on Phase A (consistency tests need all 3 apps running)
