# Contributing to b-board

Thank you for your interest in contributing. This document covers everything you need to get started, from setting up your development environment to opening a pull request.

## Development Setup

### Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later

### Clone and install

```bash
git clone <repo-url>
cd b-board
npm install
```

### Day-to-day commands

| Command                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server with hot reload            |
| `npm run test`          | Run unit tests in watch mode (Vitest)                |
| `npm run test:ci`       | Run unit tests once with coverage report             |
| `npm run test:ui`       | Open Vitest UI in the browser                        |
| `npm run e2e`           | Run Playwright end-to-end tests                      |
| `npm run lint`          | Check for ESLint errors                              |
| `npm run format`        | Auto-format with Prettier                            |
| `npm run type-check`    | Full TypeScript type validation                      |
| `npm run build`         | Produce `dist/bboard.es.js` and `dist/bboard.umd.js` |
| `npm run validate:data` | Validate all language and layout JSON files          |
| `npm run docs:dev`      | Start the VitePress docs site in dev mode            |
| `npm run docs:build`    | Build the static docs site                           |

## Project Structure

```
b-board/
├── src/
│   ├── core/           # State machine, event bus, lifecycle
│   ├── data/           # Data loading, schema validation, type factories
│   ├── composition/    # Dead-key composition engine
│   ├── ui/             # Lit templates for desktop and mobile layouts
│   │   ├── desktop/    # Desktop key render model and templates
│   │   └── mobile/     # Mobile key render model and templates
│   ├── adapters/       # Framework-specific wrappers (if any)
│   ├── security/       # Input sanitisation and CSP helpers
│   └── public/         # Public API surface — types.ts, index.ts
├── data/
│   ├── languages/      # Language profile JSON files
│   ├── layouts/        # Layout shape JSON files
│   ├── schemas/        # JSON Schema files (authoritative)
│   └── registry.json   # Master registry of languages and layouts
├── tests/
│   ├── unit/           # Vitest unit tests (coverage threshold: 90%)
│   ├── e2e/            # Playwright end-to-end tests
│   └── a11y/           # Playwright + axe-core accessibility tests
├── docs-site/          # VitePress documentation source
└── docs/               # Internal design docs and specs
```

## Coding Standards

### TypeScript

- `strict: true` is enforced — no `any`, no implicit `any`
- All exported symbols must have TSDoc comments following the standard:

````typescript
/**
 * Loads a keyboard layout from JSON.
 *
 * @param languageId - One of the registered language IDs
 * @returns The resolved keyboard layout
 * @throws {KeyboardLoadError} If the layout file is missing or invalid
 *
 * @example
 * ```ts
 * const layout = await loadLayout('yoruba')
 * ```
 */
export async function loadLayout(languageId: LanguageId): Promise<ResolvedLayout> { ... }
````

### Module boundaries

The project enforces module boundary rules via ESLint. The key rules are:

- Code in `src/public/` may not import from internal modules
- Code in `src/ui/` may not import from `src/core/` directly — use the adapter interfaces
- `src/data/` and `src/composition/` are internal; do not re-export their types from `src/public/`

ESLint will catch violations: `npm run lint` before every PR.

### Commit message format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add state machine transition validation
fix(data): handle missing language profile gracefully
test(ui): add desktop keyboard render snapshot
docs(architecture): update module boundary diagram
```

Format: `type(scope): short description`

Valid types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `perf`

## Testing Requirements

### Unit tests

- All unit tests live in `tests/unit/`
- Coverage must not decrease — the threshold is 90% line coverage
- Run `npm run test:ci` to see coverage output
- Tests use [Vitest](https://vitest.dev/) with happy-dom

### E2E tests

- E2E tests live in `tests/e2e/` and use [Playwright](https://playwright.dev/)
- Run `npm run e2e` locally; CI runs the same suite
- Each framework integration (React, Vue, Angular, Vanilla) has a corresponding E2E file

### Accessibility tests

- A11y tests live in `tests/a11y/` and use `@axe-core/playwright`
- Any change to the UI must not introduce axe-core violations
- Run: `npm run e2e -- --project=a11y` (or configure your Playwright project filter)

## Adding a Language

Adding a language requires changes to both the type system and the data layer. See the full walkthrough in the [Language Customization Guide](./guides/language-customization.md).

The short version:

1. Add the language ID to `LANGUAGE_IDS` in `src/public/types.ts`
2. Create `data/languages/<id>.json` conforming to the language profile schema
3. Add an entry to `data/registry.json`
4. Run `npm run bootstrap:schemas` to regenerate JSON Schema enums
5. Run `npm run validate:data` and fix any errors

## Pull Request Process

### Before you start

1. Check the issue tracker and the Jira board to avoid duplicate work
2. For significant changes, open an issue or Jira ticket first to discuss the approach

### Branch naming

Branch from `develop` using the pattern:

```
feat/BBOARD-XX-short-description
fix/BBOARD-XX-short-description
docs/BBOARD-XX-short-description
```

Example: `feat/BBOARD-107-documentation`

### Before opening a PR

Run the full verification suite locally:

```bash
npm run lint && npm run type-check && npm run test:ci && npm run build
```

All four commands must pass with no errors.

### PR checklist

- [ ] Branch is up to date with `develop`
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run test:ci` passes and coverage has not decreased
- [ ] `npm run build` succeeds
- [ ] New public symbols have TSDoc comments
- [ ] PR description references the Jira ticket: `Closes BBOARD-XX`

### Review

- PRs require one approval before merge
- CI must pass (lint, type-check, unit tests, E2E tests)
- Address all review comments before requesting re-review

### Jira workflow

- Mark the task **In Progress** when you start work
- Mark it **In Review** when the PR is open
- Mark it **Done** after the PR is merged

## Code of Conduct

We are committed to making b-board a welcoming project for contributors from all backgrounds, particularly those from the West African communities whose languages the library serves.

**Expected behaviour:**

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the project and its users

**Unacceptable behaviour:**

- Harassment or discriminatory language of any kind
- Personal attacks or insults
- Publishing others' private information without consent
- Any conduct that would be considered inappropriate in a professional setting

Instances of unacceptable behaviour may be reported by opening a private issue or contacting the maintainers directly. All reports will be reviewed and investigated promptly.
