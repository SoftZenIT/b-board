# Browser Compatibility Matrix

The b-board virtual keyboard targets **Baseline 2022/2023** — it works in any
browser that ships the APIs standardised by that date. This document records
the exact support status, performance characteristics, and known quirks per
browser.

## Supported Browsers

| Browser | Min Version | Engine | Status  | Notes                               |
| ------- | ----------- | ------ | ------- | ----------------------------------- |
| Chrome  | 105+        | Blink  | ✅ Full | Reference implementation            |
| Edge    | 105+        | Blink  | ✅ Full | Chromium-based; identical to Chrome |
| Firefox | 104+        | Gecko  | ✅ Full |                                     |
| Safari  | 15.6+       | WebKit | ✅ Full | Including iOS Safari                |

## API Support Matrix

Every API used by b-board is available in all supported browsers.

| API                   | Chrome 105+ | Firefox 104+ | Safari 15.6+ | Fallback When Missing                  |
| --------------------- | :---------: | :----------: | :----------: | -------------------------------------- |
| Custom Elements v1    |     ✅      |      ✅      |      ✅      | Fatal error — keyboard cannot render   |
| Shadow DOM v1         |     ✅      |      ✅      |      ✅      | Fatal error — Lit requires Shadow DOM  |
| CSS Custom Properties |     ✅      |      ✅      |      ✅      | Fatal error — theming broken           |
| Fetch API             |     ✅      |      ✅      |      ✅      | Recoverable error + upgrade suggestion |
| ResizeObserver        |     ✅      |      ✅      |      ✅      | `window.resize` + 100ms debounce       |
| `matchMedia`          |     ✅      |      ✅      |      ✅      | Default to light theme                 |
| CSS `env()`           |     ✅      |      ✅      |      ✅      | CSS `max()` handles gracefully         |
| ES2020 Modules        |     ✅      |      ✅      |      ✅      | N/A — required for ESM import          |

## Feature Detection

b-board includes a built-in feature detection module (`src/core/_internal/browser-compat.ts`)
that runs once when the `<benin-keyboard>` element is connected to the DOM.

**Core APIs** (Custom Elements, Shadow DOM, CSS Custom Properties):

- Missing → `bboard-error` event with severity `fatal`
- Keyboard stops initialisation and does not render

**Optional APIs** (Fetch, ResizeObserver, matchMedia):

- Missing → `bboard-error` event with severity `recoverable`
- Keyboard continues with degraded functionality

## Performance Benchmarks

Measured via Playwright E2E tests (`tests/e2e/browser-compat/browser-compat.spec.ts`).

| Metric              | Chrome | Firefox | Safari | Target |
| ------------------- | ------ | ------- | ------ | ------ |
| Interaction latency | <1ms   | <1ms    | <1ms   | <5ms   |
| Initial load time   | ~50ms  | ~60ms   | ~55ms  | —      |
| Rapid press (10×)   | 10/10  | 10/10   | 10/10  | 10/10  |

> **Note:** Exact values vary by hardware. The table above reflects typical
> results from CI (GitHub Actions ubuntu-latest). Run the E2E tests locally
> with `npx playwright test tests/e2e/browser-compat/` to get your own numbers.

## Unsupported Browsers

| Browser                 | Reason                                         |
| ----------------------- | ---------------------------------------------- |
| Internet Explorer (all) | No Custom Elements, Shadow DOM, or ES Modules  |
| Legacy Edge (≤18)       | Pre-Chromium; no Custom Elements or Shadow DOM |
| Opera Mini              | No JavaScript module support                   |
| UC Browser (old)        | Incomplete Web Components support              |

## Known Issues & Workarounds

### Safari

- **`env(safe-area-inset-bottom)`** — Safari requires the `viewport-fit=cover`
  meta tag for `env()` values to take effect. Without it, safe area insets
  default to `0px`. The keyboard's CSS uses `max(var(...), env(..., 0px))` to
  handle this gracefully.

### Firefox

- **`ResizeObserver` loop error** — Firefox may log a benign
  `ResizeObserver loop completed with undelivered notifications` warning.
  This does not affect functionality and is suppressed in Playwright tests.

### General

- **SSR / Node.js** — The keyboard requires a DOM environment. In SSR contexts
  (Next.js, Nuxt, Angular Universal), defer loading to `onMount` /
  `afterNextRender` / client-only wrappers. See the framework integration
  guides in `docs/frameworks/`.

## How to Verify

```bash
# Run cross-browser E2E tests (requires Playwright browsers installed)
npx playwright install
npx playwright test tests/e2e/browser-compat/

# Run unit tests for feature detection
npx vitest --run src/core/_internal/browser-compat.test.ts
```
