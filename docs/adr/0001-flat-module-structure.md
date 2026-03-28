# ADR-0001: Flat Module Structure for `src/data/`

**Date:** 2026-03-27
**Status:** Accepted

---

## Context

Epic 5 required implementing several related concerns in `src/data/`: loading JSON files,
validating them, checking cross-file integrity, and resolving layouts. We needed to decide
whether to group them into a single class, a functional pipeline, or flat separate modules.

---

## Decision

Use flat modules in `src/data/` — one file per concern:
- `loader.ts` — fetch + bundler transports + file-level caching
- `type-guards.ts` — boolean `is*` predicates
- `integrity-checker.ts` — cross-file consistency checks
- `layout-resolver.ts` — `ResolvedLayout` builder + LRU cache

Each module exports pure functions or a factory returning a plain object interface.
No inheritance, no base classes.

---

## Consequences

**Positive:**
- Each file has one clear responsibility — easy to read and test in isolation
- Matches the existing style of `src/data/` (validator.ts, layout.types.ts, etc.)
- Consumers can import only what they need (tree-shaking friendly)
- Smaller files = more reliable AI-assisted editing

**Negative / Trade-offs:**
- No single entry point — consumers who need loader + resolver must import both
- Slightly more imports at call sites

---

## Alternatives Considered

| Option | Why rejected |
|--------|-------------|
| Single `DataService` class | Concentrates state and logic; departs from existing functional style; harder to tree-shake |
| Functional pipeline (higher-order functions) | Over-engineered for the current scope (8 language×layout combinations max) |
