---
title: Migration Guide
---

# Migration Guide

## Current Version

b-board is currently at **v0.1.0**. The library is in active pre-1.0 development. The public API is stabilising but breaking changes may still occur on minor version bumps until v1.0.0 is released.

---

## Versioning Policy

| Release type       | Version bump    | Guarantees                                               |
| ------------------ | --------------- | -------------------------------------------------------- |
| Bug fix            | Patch (`0.1.x`) | No API changes                                           |
| New feature        | Minor (`0.x.0`) | Backwards-compatible additions; may include deprecations |
| **Stable release** | **`1.0.0`**     | **Full semantic versioning (SemVer) begins here**        |

Until v1.0.0, treat every minor version as potentially containing breaking changes and review the [CHANGELOG](../../CHANGELOG.md) before upgrading.

---

## Breaking Changes

There are no breaking changes in the current release.

---

## Deprecation Notices

There are no active deprecations in the current release.

---

## CHANGELOG

A full list of changes for every release is tracked in [CHANGELOG.md](../../CHANGELOG.md).

---

## Migration Checklist Template

When a new version with breaking changes ships, use the following checklist to guide your upgrade:

```markdown
## Upgrade checklist: v<OLD> → v<NEW>

### Before upgrading

- [ ] Read the CHANGELOG entry for v<NEW>
- [ ] Identify any deprecated APIs you are currently using
- [ ] Run your existing test suite against the current version to establish a baseline

### Dependency update

- [ ] Update the `b-board` package: `npm install b-board@<NEW>`
- [ ] Check for peer-dependency changes in the release notes

### API changes

- [ ] Replace removed APIs with their documented alternatives
- [ ] Update any import paths that have changed
- [ ] Apply attribute renames on `<benin-keyboard>` if listed in the changelog
- [ ] Update TypeScript types that have been renamed or narrowed

### Framework adapters

- [ ] Verify React wrapper props still match (if using `@b-board/react`)
- [ ] Verify Vue directive still works (if using `@b-board/vue`)
- [ ] Verify Angular module import is up to date (if using `@b-board/angular`)

### Validation

- [ ] Run `npm run type-check` — resolve any new type errors
- [ ] Run `npm test` — all existing tests should pass
- [ ] Run `npm run e2e` — end-to-end keyboard interaction still works
- [ ] Smoke-test each supported language (yoruba, fon-adja, baatonum, dendi)
- [ ] Smoke-test each supported theme (light, dark, auto)
```
