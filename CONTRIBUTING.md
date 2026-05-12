# Contributing to b-board

## Code Style

- TypeScript strict mode — no `any`, explicit types everywhere
- ESLint + Prettier enforced (run `npm run lint` and `npm run format`)
- Follow the TSDoc standard for all public symbols (see [TSDoc Standards](docs/DEVELOPMENT.md#tsdoc))

## Pull Request Process

1. Branch from `develop`: `git checkout -b feat/BBOARD-XX-description`
2. Implement the feature with tests (TDD preferred)
3. Verify: `npm run lint && npm run type-check && npm run test:ci && npm run build`
4. Open PR against `develop` — CI must pass before merge
5. PRs require one approval

## Commit Message Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/). Commit messages directly control automated versioning — the release pipeline reads your commits to determine the next version number.

Format: `type(scope): short description`

### Version bump rules

| Commit type                             | Example                                   | Version bump                  |
| --------------------------------------- | ----------------------------------------- | ----------------------------- |
| `feat:`                                 | `feat(core): add dendi language profile`  | **minor** (`0.1.0` → `0.2.0`) |
| `fix:`                                  | `fix(data): handle missing tone mark`     | **patch** (`0.1.0` → `0.1.1`) |
| `BREAKING CHANGE:` in footer            | any commit + `BREAKING CHANGE: removed X` | **major** (`0.1.0` → `1.0.0`) |
| `chore:`, `docs:`, `test:`, `refactor:` | —                                         | **no release**                |

### Examples

```
feat(core): add state machine transition validation
fix(data): handle missing language profile gracefully
test(ui): add desktop keyboard render snapshot
docs(architecture): update module boundary diagram
```

A dry-run of the release pipeline runs on every PR — the CI output shows exactly what version your commits would produce before merging.

## Task Workflow

Each PR should reference a Jira task: `Closes BBOARD-XX` in the PR description.

Mark the Jira task **In Progress** when you start, **In Review** when a PR is open, **Done** when merged.
