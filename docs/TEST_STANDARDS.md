# BBOARD Test Standards

---

## File Location

Tests are **co-located** with their source files:

```
src/data/loader.ts
src/data/loader.test.ts   ← co-located
```

Integration tests that span multiple modules live in `tests/integration/`.

---

## Naming Conventions

```typescript
// Test suite = the function/class under test
describe('createDataLoader', () => {

  // Test case = "should [behavior] when [condition]"
  it('should throw DataLoaderError when HTTP 404 is returned', async () => {

  })
})
```

Or equivalently, use the noun form for simple behavior:
```typescript
it('returns cached result on second call with same ids', () => {})
```

---

## Test Data

- Define minimal fixtures at the top of each test file as `const`
- Fixtures should be the smallest valid object that satisfies the schema
- Derive variations with spread: `const bad = { ...validLayout, id: 'unknown' }`
- Never mutate shared fixtures — always spread

---

## Mocking

- Mock `fetch` with `vi.stubGlobal('fetch', ...)` and restore with `vi.unstubAllGlobals()` in `afterEach`
- Never mock the AJV validator — test with real validation (it's fast)
- Never mock `import.meta.glob` — use the real bundler path in integration tests

---

## Coverage Thresholds

Configured in `vitest.config.ts`:
- Lines: ≥ 90%
- Functions: ≥ 90%
- Statements: ≥ 90%
- Branches: ≥ 85%

Run `npm run test:coverage` to see the coverage report.

---

## Test Template

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { functionUnderTest } from './module.js'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const validInput = { /* minimal valid fixture */ }

// ── Happy path ───────────────────────────────────────────────────────────────

describe('functionUnderTest', () => {
  it('returns expected result for valid input', () => {
    const result = functionUnderTest(validInput)
    expect(result).toEqual(/* expected */)
  })

  // ── Error paths ─────────────────────────────────────────────────────────────

  it('throws SpecificError when input is invalid', () => {
    expect(() => functionUnderTest(invalidInput)).toThrow(SpecificError)
    expect(() => functionUnderTest(invalidInput)).toThrow(/expected message/)
  })
})
```
