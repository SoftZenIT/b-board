# Testing Infrastructure & Validation — Design Spec

**Epic:** BBOARD-106 (Epic #23)
**Date:** 2026-04-07
**Status:** Approved

## Problem Statement

The b-board virtual keyboard has a solid testing foundation (57 unit test files, 443 tests, 98.49% statement coverage, 8 E2E specs, two CI workflows). However, several testing disciplines are missing: performance benchmarks with regression enforcement, snapshot tests for render models, property-based fuzz testing, structured test fixtures, and comprehensive test documentation. Seven of the 14 epic tasks are already complete; this spec addresses the remaining gaps.

## Task Disposition

### Already Complete (mark Done in Jira)

| Task | Reason |
|------|--------|
| BBOARD-184: Test Framework & Environment | Vitest + Playwright fully configured with setup file, coverage thresholds |
| BBOARD-185: Core Logic Unit Tests | 39 test files in src/, 100% coverage on composition and core modules |
| BBOARD-186: Data Validation Unit Tests | integrity-checker, type-guards, validator, data-layer tests exist |
| BBOARD-187: E2E Integration Tests | 8 Playwright specs cover desktop, mobile, physical keyboard, composition, themes |
| BBOARD-188: React Integration Tests | framework-tests.yml runs React sample app with Playwright |
| BBOARD-189: Vue Integration Tests | framework-tests.yml runs Vue sample app with Playwright |
| BBOARD-190: Angular Integration Tests | framework-tests.yml runs Angular sample app with Playwright |

### Gaps to Implement

| Task | Deliverable |
|------|-------------|
| BBOARD-191: CI/CD Enhancements | Add benchmarks + E2E to ci.yml |
| BBOARD-192: Coverage Reports | Coverage badge in README, docs/test-coverage.md |
| BBOARD-193: Performance Benchmarks | vitest bench suite with threshold enforcement |
| BBOARD-194: Test Data Fixtures | Rich fixture factories for language data, compositions, render models |
| BBOARD-195: Test Documentation | docs/testing.md |
| BBOARD-196: Snapshot Tests | Render model + data structure snapshots |
| BBOARD-197: Fuzz Testing | Property-based tests with fast-check |

## Architecture

### Phase 1: Test Data Fixtures (BBOARD-194)

**Files:**
- `src/tests/fixtures/language-fixtures.ts` — Factory functions for `LanguageData` objects (Yoruba, Fon, Baatonum, Dendi) with realistic character sets, composition rules, and layout references. Builder pattern allows tests to override specific fields.
- `src/tests/fixtures/composition-fixtures.ts` — Pre-built composition sequences: tone cycles (e→é→è→ê→ë→e), nasal compositions (n+a→na→ã), invalid sequences, edge cases.
- `src/tests/fixtures/render-model-fixtures.ts` — Factory functions for `DesktopRenderKey[]` and `MobileRenderKey[]` with known layouts.
- `src/tests/fixtures/index.ts` — Barrel re-export.

Existing `src/tests/fixtures.ts` (DOM factories) remains unchanged.

### Phase 2: Performance Benchmarks (BBOARD-193)

**Framework:** Vitest's built-in `bench()` API (no extra dependencies).

**Files:**
- `src/tests/benchmarks/composition.bench.ts` — Tone cycle resolution (single step, full cycle), nasal composition resolution, letter mapping lookup.
- `src/tests/benchmarks/data.bench.ts` — Language data loading + validation, layout resolution, schema validation.
- `src/tests/benchmarks/render-model.bench.ts` — Desktop/mobile render model building, language switching (full pipeline).

**Enforcement:**
- New npm script: `test:bench` runs `vitest bench`.
- Custom threshold check script (`scripts/check-bench-thresholds.ts`) reads vitest bench JSON output and fails if ops/sec drops below configured minimums in `benchmarks.config.json`.
- CI step runs benchmarks after unit tests.

### Phase 3: Snapshot Tests (BBOARD-196)

**Framework:** Vitest's built-in `toMatchSnapshot()`.

**Files:**
- `src/tests/snapshots/render-model.snap.test.ts` — Desktop render model snapshot for each language (Yoruba, Fon, Baatonum, Dendi) in base layer; mobile render model snapshot for each language; shift/AltGr layer snapshots for Yoruba (representative).
- `src/tests/snapshots/data-structures.snap.test.ts` — Language data structure snapshots (schema shape, not full content to avoid brittleness); composition rule structure snapshots; error code registry snapshot (catches accidental removals).

**Update process:** `npx vitest --update` to refresh snapshots. CI rejects unknown snapshot changes (default vitest behavior).

No DOM snapshots — too brittle with Lit rendering.

### Phase 4: Fuzz Testing (BBOARD-197)

**Framework:** `fast-check` (devDependency) for property-based testing.

**Files:**
- `src/tests/fuzz/composition.fuzz.test.ts`
  - Property: Any Unicode string through `process()` never throws
  - Property: Composition state machine always reaches a terminal state
  - Property: Tone cycle always returns to base character within N steps
- `src/tests/fuzz/input-validation.fuzz.test.ts`
  - Property: Random key IDs never crash `_activateKey()`
  - Property: Random language IDs through `loadLanguage()` either succeed or return a typed error
  - Property: Arbitrary state transitions never leave state machine in invalid state
- `src/tests/fuzz/data-integrity.fuzz.test.ts`
  - Property: Malformed JSON through data loaders throws validation error, never crashes
  - Property: Layout resolver handles missing/extra keys gracefully

Focus: "never crashes" invariants, not exhaustive correctness.

### Phase 5: CI Enhancements (BBOARD-191)

**Changes to `.github/workflows/ci.yml`:**
- Add benchmark step after `test:ci`: runs `npm run test:bench`
- Add E2E step: installs Playwright browsers, runs `npx playwright test`

### Phase 6: Coverage & Documentation (BBOARD-192, BBOARD-195)

**Coverage (BBOARD-192):**
- Add coverage badge to `README.md` using shields.io dynamic badge (reads coverage-summary.json)
- Create `docs/test-coverage.md`: coverage hot spots, how to read reports, how to improve coverage in low areas

**Test Documentation (BBOARD-195) — `docs/testing.md`:**
- Test architecture overview (unit in src/, integration in tests/integration/, E2E in tests/e2e/)
- How to run tests locally (all commands)
- How to add new tests (naming conventions, file placement)
- Testing patterns used (factory functions, snapshot updates, fuzz invariants, benchmarks)
- CI pipeline explanation

## Dependencies

- Phase 1 (fixtures) has no dependencies
- Phase 2 (benchmarks) uses fixtures from Phase 1
- Phase 3 (snapshots) uses fixtures from Phase 1
- Phase 4 (fuzz) is independent
- Phase 5 (CI) depends on Phases 2-4 (needs scripts to exist)
- Phase 6 (docs) depends on all previous phases (documents what was built)

## Key Decisions

1. **No new testing framework** — Vitest handles unit tests, benchmarks, and snapshots natively
2. **fast-check for fuzz testing** — lightweight, integrates with Vitest, property-based approach
3. **Builder pattern for fixtures** — allows tests to override specific fields without maintaining many variants
4. **No DOM snapshots** — Lit component rendering is too dynamic; render model snapshots capture the logic
5. **Benchmark thresholds enforced in CI** — custom script checks ops/sec against minimums
6. **Render model + data structure snapshots only** — focused on logic output, not DOM structure
