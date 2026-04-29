---
title: Architecture
---

# Architecture

b-board is a framework-agnostic virtual keyboard library for Beninese African languages. The codebase is organised into six layers with strict one-way dependency rules.

## Layer Overview

```
┌─────────────────────────────────────────────────┐
│                  Public API                     │
│            src/public/index.ts                  │
│  (single entry point — the only thing           │
│   consumers are allowed to import)              │
└──────────────┬──────────────┬───────────────────┘
               │              │
   ┌───────────▼──┐   ┌───────▼──────────┐
   │  Core Engine │   │ Composition      │
   │  src/core/   │   │ Engine           │
   │              │   │ src/composition/ │
   └───────┬──────┘   └───────┬──────────┘
           │                  │
   ┌───────▼──────────────────▼──────────────────┐
   │              UI Renderers                   │
   │  src/ui/desktop/    src/ui/mobile/          │
   │  (Lit Web Components — framework-agnostic)  │
   └───────────────────────┬─────────────────────┘
                           │
   ┌───────────────────────▼─────────────────────┐
   │                  Adapters                   │
   │   src/adapters/  (input / textarea /        │
   │                   contenteditable)          │
   └───────────────────────┬─────────────────────┘
                           │
   ┌───────────────────────▼─────────────────────┐
   │               Data Layer                    │
   │  src/data/  (JSON loading, AJV validation,  │
   │              layout resolution)             │
   └─────────────────────────────────────────────┘
```

---

## Module Boundary Rule

**Consumers must only import from `b-board`**, which resolves to `src/public/index.ts`. Direct imports from any internal path (`src/core/`, `src/data/`, etc.) are forbidden and enforced by an ESLint rule that fails CI on violation.

Within the source tree the dependency direction is strictly one-way:

```
public
  └─► data
        └─► core  ◄── composition
                   └─► ui
                         └─► adapters
```

| Module        | May import from | Must NOT import from                  |
| ------------- | --------------- | ------------------------------------- |
| `public`      | nothing         | data, core, composition, adapters, ui |
| `data`        | public          | core, composition, adapters, ui       |
| `core`        | data, public    | composition, adapters, ui             |
| `composition` | data, public    | core, adapters, ui                    |
| `adapters`    | core, public    | composition, ui                       |
| `ui`          | core, public    | data, composition, adapters           |

See [ADR-0002](../adr/0002-module-boundaries.md) for the rationale behind this rule.

---

## Core Engine (`src/core/`)

The core engine is a state machine that manages the keyboard lifecycle. It has no I/O dependencies; all external data arrives through the Data Layer interface.

### States

The machine has five top-level states:

| State       | Description                                           |
| ----------- | ----------------------------------------------------- |
| `idle`      | Keyboard mounted but no target focused                |
| `ready`     | Target focused; keyboard accepting key events         |
| `composing` | A dead key has been armed; waiting for the base key   |
| `error`     | An unrecoverable error was caught; keyboard suspended |
| `destroyed` | Instance has been torn down; all listeners removed    |

The `composing` state has two substates: `tone-armed` and `nasal-armed` (see [Composition Engine](#composition-engine-srccomposition) below).

### Lifecycle Events

| Event               | Fired when                                     |
| ------------------- | ---------------------------------------------- |
| `ready`             | Target element receives focus                  |
| `blur`              | Target element loses focus                     |
| `key-press`         | A key is tapped or clicked                     |
| `composition-start` | A dead key is armed                            |
| `composition-end`   | Composition resolves to output or is cancelled |
| `error`             | An error is caught inside the engine           |
| `destroy`           | `keyboard.destroy()` is called                 |

### Error Handler

Errors inside the engine are caught internally and forwarded to an optional `onError` callback supplied at construction time. When no handler is provided the error is re-thrown. The machine transitions to the `error` state and stops processing further key events until it is explicitly reset or destroyed.

---

## Composition Engine (`src/composition/`)

The Composition Engine handles dead-key input for tone marks and nasal vowels common in the supported languages (Yoruba, Fon/Adja, Baatɔnum, Dendi).

### Dead-Key State Machine

```
         ┌────────────────────────────────────────┐
         │                 none                   │◄──┐
         └─────────┬──────────────────────────────┘   │
                   │                                   │
       tone key    │            nasal key              │ cancel / resolve
                   ▼                                   │
         ┌─────────────────┐   ┌──────────────────┐   │
         │   tone-armed    │   │   nasal-armed    ├───┘
         └─────────────────┘   └──────────────────┘
```

- **`none`** — no dead key is pending.
- **`tone-armed`** — a tone modifier key has been pressed; the next base character key will receive the tone mark.
- **`nasal-armed`** — a nasal modifier key has been pressed; the next base character key will receive the nasal mark.

When the armed state receives a compatible base key, the engine resolves the combination to a single Unicode code point and emits it. When it receives an incompatible key or a second modifier press, the pending modifier is cancelled and normal processing resumes.

---

## UI Renderers (`src/ui/`)

All UI is rendered as **Lit Web Components** (`lit` v3). This means the keyboard element (`<benin-keyboard>`) works in any host framework without wrappers, because it is a standard Custom Element registered in the browser.

### Desktop Renderer (`src/ui/desktop/`)

Implements the AZERTY-based full-width keyboard layout. The rendering pipeline separates data from presentation:

1. `src/data/` loads JSON and resolves it to a `ResolvedLayout`.
2. `src/ui/desktop/render-model.ts` derives a pure `DesktopRenderModel` from `ResolvedLayout` and the current `DesktopRenderState`.
3. `src/ui/desktop/key.ts` / `src/ui/desktop/rows.ts` convert the render model to Lit `TemplateResult` objects.
4. `src/element/benin-keyboard.ts` is the thin public shell: it owns lifecycle, data loading, theme integration, and keyboard event registration.

Physical key echo and focus state are managed by `src/ui/state/desktop-state.ts` and `src/ui/state/focus-controller.ts`. See [ADR-0003](../adr/0003-desktop-renderer-boundary.md) for the motivation behind the thin-shell design.

### Mobile Renderer (`src/ui/mobile/`)

Provides a compact touch-optimised layout. Shares the same render-model pipeline but renders rows optimised for smaller viewports with larger tap targets.

---

## Adapters (`src/adapters/`)

Adapters bridge the keyboard to native host elements. Each adapter listens for output events from the Core Engine and writes characters into the target.

| Adapter                  | Target element type                               |
| ------------------------ | ------------------------------------------------- |
| `InputAdapter`           | `<input type="text">` and `<input type="search">` |
| `TextareaAdapter`        | `<textarea>`                                      |
| `ContentEditableAdapter` | Any element with `contenteditable`                |

All adapters share a common interface defined in `src/public/`. The `AdapterRegistry` (in `src/adapters/`) selects the correct adapter automatically based on the target element type.

---

## Data Layer (`src/data/`)

The data layer is a set of pure-function modules following [ADR-0001](../adr/0001-flat-module-structure.md)'s flat-module convention (one file per concern, no inheritance).

| Module                 | Responsibility                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `loader.ts`            | Fetch language JSON via bundler or URL transport; file-level cache                          |
| `validator.ts`         | AJV-based JSON Schema validation of language profiles and layout files                      |
| `type-guards.ts`       | Boolean `is*` predicates for runtime type narrowing                                         |
| `integrity-checker.ts` | Cross-file consistency checks (e.g., every key referenced in a layout exists in the keyMap) |
| `layout-resolver.ts`   | Builds a `ResolvedLayout` from raw JSON; LRU cache                                          |

### JSON Loading

Language profiles are JSON files. The loader supports two transports:

- **Bundler transport** — the file is imported as a static asset (Vite / webpack).
- **Fetch transport** — the file is fetched at runtime via `fetch()`.

### AJV Validation

Every language profile is validated against a JSON Schema using **AJV** before use. Invalid files throw a structured `DataError` with a machine-readable code and a human-readable message. AJV was chosen for its compile-time schema optimisation and zero-dependency footprint. See [Design Decisions](#design-decisions) below.

### Layout Resolution

`layout-resolver.ts` takes raw JSON and resolves cross-references (e.g., resolving key IDs to their full definitions) into a flat `ResolvedLayout` object consumed by the UI renderers. The resolver is memoised with an LRU cache keyed on language ID + layout variant.

---

## Design Decisions

### Why Lit?

The keyboard UI must work in React, Vue, Angular, and plain HTML without requiring consumers to install framework-specific wrapper packages. Lit Web Components are standard Custom Elements — they are registered once in the browser and usable in any context. This avoids the maintenance burden of maintaining separate React, Vue, and Angular component packages. See [ADR-0002](../adr/0002-module-boundaries.md).

### Why no framework in the core engine?

The `src/core/` state machine is plain TypeScript with no runtime dependencies. This keeps the bundle small, makes the engine trivially testable (no DOM required), and means the engine can run in Node.js or Web Workers in future.

### Why AJV?

AJV compiles JSON Schemas to optimised validator functions at initialisation time, making repeated validation essentially free at runtime. Its strict mode catches schema definition mistakes early. Alternatives such as Zod or Yup were considered but introduce larger bundles; AJV's compiled output is tree-shakeable.

### Why branded `KeyId`?

```ts
type KeyId = string & { readonly __brand: 'KeyId' };
```

Branding prevents raw strings from being accidentally passed where a `KeyId` is expected. TypeScript catches the mismatch at compile time, eliminating an entire class of key-lookup bugs without any runtime overhead.

---

## ADR Log

Architecture Decision Records live in [`docs/adr/`](../adr/):

- [ADR-0001 — Flat module structure for `src/data/`](../adr/0001-flat-module-structure.md)
- [ADR-0002 — Module boundaries and layer separation](../adr/0002-module-boundaries.md)
- [ADR-0003 — Thin element shell for desktop renderer](../adr/0003-desktop-renderer-boundary.md)
