# Baseline 2022/2023 API Audit — b-board

This document catalogues every browser API that the b-board virtual keyboard
library relies on, maps each API to its Baseline availability year, and records
whether feature detection or a fallback is implemented.

## Methodology

APIs were identified by static analysis of the `src/` tree. "Baseline year"
follows the [web-platform-dx/web-features](https://github.com/nicolo-ribaudo/tc39-proposal-structs) convention: the year in which an API
became available in the latest versions of all four major engines (Chrome,
Firefox, Safari, Edge).

## API Inventory

| #   | API                            | Where Used                                              | Baseline Year | Baseline ≤ 2023? | Detection                       | Fallback                       |
| --- | ------------------------------ | ------------------------------------------------------- | ------------- | ---------------- | ------------------------------- | ------------------------------ |
| 1   | Custom Elements v1             | `src/element/benin-keyboard.ts` (`@customElement`)      | 2020          | ✅               | `supportsCustomElements()`      | Fatal error message            |
| 2   | Shadow DOM v1                  | `src/element/benin-keyboard.ts` (LitElement)            | 2020          | ✅               | `supportsShadowDOM()`           | Fatal error message            |
| 3   | CSS Custom Properties          | Theme tokens throughout `src/`                          | 2017          | ✅               | `supportsCSSCustomProperties()` | Fatal error message            |
| 4   | Fetch API                      | `src/data/loader.ts` (`fetch()`)                        | 2017          | ✅               | `supportsFetchAPI()`            | Recoverable error + suggestion |
| 5   | ResizeObserver                 | `src/element/benin-keyboard.ts` (mobile layout)         | 2020          | ✅               | `supportsResizeObserver()`      | `window.resize` + debounce     |
| 6   | `window.matchMedia`            | `src/theme/theme-manager.ts` (dark mode)                | 2015          | ✅               | `supportsMatchMedia()`          | Default to light theme         |
| 7   | CSS `env()`                    | `src/element/benin-keyboard.ts` (safe-area-inset)       | 2020          | ✅               | N/A                             | CSS `max()` handles gracefully |
| 8   | ES2020 syntax                  | Entire codebase (optional chaining, nullish coalescing) | 2020          | ✅               | N/A                             | Transpiled by Vite build       |
| 9   | `HTMLElement.dataset`          | `src/element/benin-keyboard.ts` (data attributes)       | 2012          | ✅               | N/A                             | Universal support              |
| 10  | `EventTarget.addEventListener` | Throughout `src/`                                       | 2006          | ✅               | N/A                             | Universal support              |

## Key Findings

1. **All APIs used are Baseline 2020 or earlier**, meaning they are guaranteed
   present in any browser that meets Baseline 2022/2023.
2. **No polyfills are required** for Baseline 2022/2023 targets.
3. Feature detection is still valuable for:
   - Providing clear error messages on truly legacy browsers
   - Enabling graceful degradation for secondary APIs (ResizeObserver, matchMedia)
   - Documenting API requirements for consumers

## Minimum Browser Versions (Baseline 2022/2023)

| Browser | Minimum Version | Release Date |
| ------- | --------------- | ------------ |
| Chrome  | 105             | Aug 2022     |
| Firefox | 104             | Aug 2022     |
| Safari  | 15.6            | Jul 2022     |
| Edge    | 105             | Sep 2022     |

## Unsupported Environments

- Internet Explorer (all versions) — no Custom Elements or Shadow DOM
- Legacy Edge (≤18, non-Chromium) — no Custom Elements or Shadow DOM
- Node.js without DOM shims — no `window`, `document`, or `customElements`
