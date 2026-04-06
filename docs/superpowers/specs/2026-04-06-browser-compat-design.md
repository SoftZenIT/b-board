# Browser Compatibility & Baseline 2022/2023 Compliance — Design Spec

**Epic:** BBOARD-103
**Date:** 2026-04-06
**Status:** Approved

## Problem Statement

The b-board virtual keyboard library uses modern browser APIs (Custom Elements v1, Shadow DOM, CSS Custom Properties, ResizeObserver, matchMedia, Fetch) without any feature detection or fallback handling. If a user loads the keyboard in an unsupported browser, it fails silently or throws cryptic errors. This epic adds a compatibility layer that detects missing APIs, provides clear error messages, validates behavior across Chrome/Firefox/Safari, and documents the browser support matrix.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Fallback strategy | Detect & Warn | Baseline 2022/2023 guarantees core Web Components APIs; polyfills unnecessary |
| Testing depth | E2E + Performance benchmarks | Validates functional correctness and interaction latency (<5ms target) |
| Module placement | `src/core/_internal/` | Avoids new module boundary; core already accesses public types and error handling |
| Implementation approach | 3 phases | Audit+Code → Testing → Docs, commit after each phase |

## Phase 1: Audit + Feature Detection + Fallbacks (BBOARD-157, 158, 159)

### Baseline 2022/2023 API Inventory

| API | Used In | Baseline Year | Detection Needed? |
|-----|---------|--------------|-------------------|
| Custom Elements v1 | `benin-keyboard.ts` | 2020 | Yes (fatal guard) |
| Shadow DOM v1 | `benin-keyboard.ts` | 2020 | Yes (fatal guard) |
| CSS Custom Properties | theme tokens | 2017 | Yes (fatal guard) |
| Fetch API | `data/loader.ts` | 2017 | Yes (recoverable) |
| ResizeObserver | `benin-keyboard.ts` | 2020 | Yes (recoverable) |
| matchMedia | `theme-manager.ts` | 2015 | Yes (recoverable) |
| CSS `env()` | mobile safe areas | 2020 | No (CSS graceful degradation) |
| ES2020 features | everywhere | 2020 | No (transpiled by Vite) |

All core APIs are Baseline 2020 or earlier — guaranteed present in any Baseline 2022/2023 browser. Detection exists to handle truly legacy environments gracefully.

### Feature Detection Module

**File:** `src/core/_internal/browser-compat.ts`

```typescript
interface BrowserCompatReport {
  customElements: boolean;
  shadowDOM: boolean;
  cssCustomProperties: boolean;
  fetchAPI: boolean;
  resizeObserver: boolean;
  matchMedia: boolean;
}

function supportsCustomElements(): boolean;
function supportsShadowDOM(): boolean;
function supportsCSSCustomProperties(): boolean;
function supportsFetchAPI(): boolean;
function supportsResizeObserver(): boolean;
function supportsMatchMedia(): boolean;

function checkBrowserCompatibility(): BrowserCompatReport;
function validateBrowserOrThrow(): void;
```

- Detection results cached after first call (no repeated DOM probing)
- `validateBrowserOrThrow()` called during `connectedCallback()` of `<benin-keyboard>`
- Emits `bboard-error` with severity `fatal` for core API gaps, `recoverable` for secondary ones

### Fallback Strategies

| Missing API | Severity | Fallback Behavior |
|-------------|----------|-------------------|
| Custom Elements v1 | `fatal` | Emit `bboard-error`, render nothing |
| Shadow DOM v1 | `fatal` | Emit `bboard-error`, render nothing |
| CSS Custom Properties | `fatal` | Emit `bboard-error`, theming broken |
| Fetch API | `recoverable` | Emit `bboard-error` with upgrade suggestion |
| ResizeObserver | `recoverable` | Fall back to `window.addEventListener('resize')` with debounce |
| matchMedia | `recoverable` | Default to `light` theme, skip `prefers-color-scheme` detection |

For fatal errors in truly legacy browsers where Custom Elements aren't registered: a plain HTML fallback message is injected without relying on Shadow DOM.

For recoverable errors: the existing error event system dispatches `bboard-error` with `recoverySuggestion`.

### Integration Points

- `benin-keyboard.ts` `connectedCallback()` → calls `validateBrowserOrThrow()` before rendering
- `benin-keyboard.ts` ResizeObserver setup (~line 563) → gated by `supportsResizeObserver()`, falls back to window resize
- `theme-manager.ts` matchMedia usage (~line 18) → gated by `supportsMatchMedia()`, defaults to light theme

## Phase 2: Cross-Browser E2E Testing + Performance (BBOARD-160, 161, 162)

### Test Structure

**File:** `tests/e2e/browser-compat/browser-compat.spec.ts`

Uses Playwright's multi-project config to run the same suite on Chromium, Firefox, and WebKit.

### Functional Tests (per browser)

- Keyboard renders and becomes interactive
- Key press emits `bboard-key-press` with correct `char`
- Language switching works (all 4 languages)
- Theme toggle works (light → dark → auto)
- Custom properties applied correctly (computed styles match tokens)
- Error events fire when expected
- Feature detection runs without false negatives

### Performance Benchmarks (per browser)

| Metric | Target | Method |
|--------|--------|--------|
| Interaction latency | <5ms | Time from click to `bboard-key-press` event |
| Initial load time | Measured | Time from page load to `bboard-ready` event |
| Memory baseline | Measured | `performance.measureUserAgentSpecificMemory()` where available |

Results logged as test metadata and included in the compatibility matrix.

### Test Reporting

- Each browser's results captured in Playwright's HTML reporter
- Performance metrics extracted for the compatibility matrix document
- Screenshots taken only on failure for debugging

## Phase 3: Browser Compatibility Matrix (BBOARD-163)

**File:** `docs/browser-compatibility-matrix.md`

### Structure

- **Supported Browsers**: Chrome 105+, Firefox 104+, Safari 15.6+, Edge 105+ (all Baseline 2022/2023)
- **API Support Matrix**: Per-browser table showing support status and fallback for each API
- **Performance Benchmarks**: Per-browser metrics table (populated from Phase 2 results)
- **Unsupported Browsers**: IE, Legacy Edge, browsers without ES2020 module support
- **Known Issues & Workarounds**: Browser-specific quirks discovered during testing

## Files Created/Modified

| Action | File | Purpose |
|--------|------|---------|
| Create | `docs/browser-baseline.md` | API audit document |
| Create | `src/core/_internal/browser-compat.ts` | Feature detection + validation |
| Create | `src/core/_internal/browser-compat.test.ts` | Unit tests for detection |
| Create | `tests/e2e/browser-compat/browser-compat.spec.ts` | Cross-browser E2E + perf tests |
| Create | `docs/browser-compatibility-matrix.md` | Final compatibility matrix |
| Modify | `src/element/benin-keyboard.ts` | Add `validateBrowserOrThrow()` + ResizeObserver fallback |
| Modify | `src/theme/theme-manager.ts` | Add matchMedia fallback guard |

## Branch Strategy

New branch `feature/bboard-103-browser-compat` from `feature/bboard-57-framework-interop`. One commit per phase.

## Testing Strategy

- Phase 1: Unit tests for all detection functions (mock missing APIs via vitest)
- Phase 2: E2E tests on all 3 browser engines via Playwright
- All 426 existing tests must continue to pass at each phase
