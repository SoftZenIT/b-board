# Testing Guide

This document describes the b-board testing architecture, how to run tests, and how to add new tests.

## Test Architecture

```
src/
├── tests/
│   ├── setup.ts                  # Global test setup (matchMedia mock)
│   ├── fixtures.ts               # DOM factory functions
│   ├── fixtures/                 # Rich test data factories
│   │   ├── language-fixtures.ts  # LanguageProfile builders
│   │   ├── composition-fixtures.ts # CompositionRule builders
│   │   ├── render-model-fixtures.ts # ResolvedLayout + state builders
│   │   └── index.ts              # Barrel re-export
│   ├── benchmarks/               # Performance benchmarks (vitest bench)
│   │   ├── composition.bench.ts
│   │   └── render-model.bench.ts
│   ├── snapshots/                # Snapshot tests
│   │   ├── render-model.snap.test.ts
│   │   └── data-structures.snap.test.ts
│   └── fuzz/                     # Property-based fuzz tests (fast-check)
│       ├── composition.fuzz.test.ts
│       ├── input-validation.fuzz.test.ts
│       └── data-integrity.fuzz.test.ts
│
├── **/*.test.ts                  # Co-located unit tests (39 files)
│
tests/
├── unit/                         # Additional unit tests (16 files)
├── integration/                  # Integration tests (2 files)
└── e2e/                          # Playwright E2E tests (8 specs)
    ├── desktop-keyboard.spec.ts
    ├── mobile-keyboard.spec.ts
    ├── physical-keyboard.spec.ts
    ├── composition.spec.ts
    ├── theme-switching.spec.ts
    ├── theme-auto-detect.spec.ts
    ├── browser-compat/
    └── framework-interop/
```

## Running Tests

### Unit & Integration Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI
npm run test:coverage # With coverage report
npm run test:ci       # CI mode (run once + coverage)
```

### Performance Benchmarks

```bash
npm run test:bench    # Run all benchmarks
```

### E2E Tests

```bash
npm run e2e                           # All browsers
npx playwright test --project=chromium # Single browser
```

### Snapshot Updates

When intentionally changing render model output or data structures:

```bash
npx vitest --run --update  # Update all snapshots
```

Review the diff carefully before committing updated snapshots.

## Test Categories

### Unit Tests (`src/**/*.test.ts`, `tests/unit/`)

Co-located with source files. Cover individual functions and classes in isolation.

**Naming:** `<module-name>.test.ts` next to the source file.

**Pattern:**

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module.js';

describe('myFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Snapshot Tests (`src/tests/snapshots/`)

Capture render model output and data structures to detect unintended changes.

- **Render models:** Snapshot the full `DesktopRenderModel` and `MobileRenderModel` output for known fixture inputs
- **Data structures:** Snapshot error code registry, composition rules, and language profile shapes

### Fuzz Tests (`src/tests/fuzz/`)

Property-based tests using `fast-check`. Focus on "never crashes" invariants.

**Pattern:**

```typescript
import fc from 'fast-check';

it('process() never throws for arbitrary strings', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result = processor.process(keyId, input);
      expect(result === null || typeof result === 'string').toBe(true);
    }),
    { numRuns: 500 }
  );
});
```

### Performance Benchmarks (`src/tests/benchmarks/`)

Using Vitest's built-in `bench()` API. Measures ops/sec for critical paths.

**Covered operations:**

- Tone and nasal resolution
- State machine transitions
- Composition processor pipeline
- Desktop and mobile render model creation

### E2E Tests (`tests/e2e/`)

Playwright tests running against the real keyboard in Chromium, Firefox, and WebKit.

**Naming:** `<feature>.spec.ts`

## Test Fixtures

### DOM Factories (`src/tests/fixtures.ts`)

```typescript
import { createMockElement, createMockInput, createMockTextarea } from '../tests/fixtures';
```

### Rich Fixtures (`src/tests/fixtures/`)

```typescript
import {
  buildLanguageProfile, // Yoruba profile with overrides
  buildFonProfile, // Fon profile (nasal composition)
  buildEmptyProfile, // Empty profile for edge cases
  buildCompositionMap, // Map<trigger, CompositionRule[]>
  acuteToneRules, // Yoruba acute tone rules
  nasalRules, // Fon nasal rules
  desktopResolvedLayout, // Full ResolvedLayout for desktop
  mobileResolvedLayout, // Full ResolvedLayout for mobile
  defaultDesktopState, // Base DesktopRenderState with overrides
  defaultMobileState, // Base MobileRenderState with overrides
} from '../tests/fixtures/index.js';
```

All builders accept a `Partial<T>` override parameter:

```typescript
const profile = buildLanguageProfile({ name: 'Custom' });
const state = defaultDesktopState({ activeLayer: 'shift' });
```

## Coverage

Coverage is enforced with these thresholds:

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 90%       |
| Branches   | 85%       |
| Functions  | 90%       |
| Statements | 90%       |

View coverage reports:

```bash
npm run test:coverage  # Generates HTML report in coverage/
open coverage/index.html
```

## CI Pipeline

### Main CI (`.github/workflows/ci.yml`)

Runs on push/PR to main/develop:

1. Lint → Type check → Unit tests + coverage → Benchmarks → Data validation → Build
2. E2E tests (separate job, runs after CI passes)

### Framework Tests (`.github/workflows/framework-tests.yml`)

Runs cross-framework integration tests for React, Vue, and Angular sample apps on Node 18 and 20.

## Adding New Tests

1. **Unit test for a new module:** Create `<module>.test.ts` next to the source file
2. **New fixture:** Add factory function to the appropriate file in `src/tests/fixtures/`
3. **New benchmark:** Add `bench()` calls to existing bench files or create a new `.bench.ts`
4. **New snapshot:** Add `toMatchSnapshot()` assertion in `src/tests/snapshots/`
5. **New fuzz test:** Add `fc.property()` assertion in `src/tests/fuzz/`
6. **New E2E test:** Create `.spec.ts` in `tests/e2e/`

Always run `npm run test:ci && npm run lint` before committing to ensure nothing is broken.
