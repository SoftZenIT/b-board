# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone <repo>
cd b-board
npm install
```

## Development Workflow

```bash
npm run dev        # Start Vite dev server (hot reload)
npm run test       # Run Vitest in watch mode
npm run lint       # Check for lint errors
npm run type-check # TypeScript validation
```

## Testing

### Unit Tests (Vitest)
```bash
npm run test           # Watch mode
npm run test:ci        # Single run + coverage
npm run test:ui        # Vitest UI in browser
```

Tests live in `tests/unit/`. Coverage threshold is 90%.

### E2E Tests (Playwright)
```bash
npm run e2e
```

Tests live in `tests/e2e/`.

## Building

```bash
npm run build
```

Outputs to `dist/`:
- `bboard.es.js` — ES Module
- `bboard.umd.js` — UMD

## TSDoc Standards

All exported symbols must have TSDoc comments:

```ts
/**
 * Loads a keyboard layout from JSON.
 *
 * @param languageId - BCP 47 language tag (e.g. `"yo"` for Yoruba)
 * @returns The resolved keyboard layout
 * @throws {KeyboardLoadError} If the layout file is missing or invalid
 *
 * @example
 * ```ts
 * const layout = await loadLayout('yo')
 * ```
 */
export async function loadLayout(languageId: LanguageId): Promise<ResolvedLayout> { ... }
```

## Debugging Tips

- Use `npm run test:ui` for a visual test runner with filtering
- TypeScript errors: `npm run type-check` for full diagnostics
- Build issues: check `vite.config.ts` — Vue is externalized (not bundled)
