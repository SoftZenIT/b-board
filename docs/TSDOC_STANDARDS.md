# BBOARD TSDoc Standards

Extends `docs/TSDOC_STYLE.md` with additional tags and a completeness checklist.
All exported symbols in `src/` must have TSDoc comments.

---

## Required Tags by Symbol Type

| Symbol | Required tags |
|--------|--------------|
| Interface | description, `@example` |
| Interface field | inline `/** */` description |
| Type alias | description, `@example` |
| Public function | description, `@param` (if non-obvious), `@returns` (if non-void and non-obvious), `@throws` (if it throws) |
| Type guard | one-liner: `Type guard for {@link X}.` |
| Error class constructor | one-liner: `@example throw new XxxError(...)` |

---

## `@throws` Standard

Document every public function that can throw. Use the error class name:

```typescript
/**
 * Loads and validates a layout shape from the configured source.
 * @throws {DataLoaderError} if the file cannot be fetched or imported.
 * @throws {ValidationError} if the fetched data fails schema validation.
 * @throws {IntegrityError} if the layout contains duplicate keyIds.
 */
async loadLayoutShape(id: LayoutVariantId): Promise<LayoutShape>
```

---

## Checklist (run before committing public API changes)

- [ ] Every exported function has a description
- [ ] Every exported interface has a description + `@example`
- [ ] Every interface field has an inline `/** */` comment
- [ ] All `@param` tags present for non-obvious parameters
- [ ] `@throws` present for every function that can throw
- [ ] `@example` uses factory functions, not object literals
- [ ] TSDoc renders correctly in VS Code (hover over symbol to verify)

---

## What NOT to Document

- Private/internal helpers not exported from `src/data/index.ts` or `src/public/index.ts`
- Test files
- Configuration files
- Barrel files (`index.ts`)
