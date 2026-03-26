# BBOARD TSDoc Style Guide

All exported symbols in `src/` must have TSDoc comments. This guide defines the standard.

---

## Required Tags

| Tag | Required for | Purpose |
|-----|-------------|---------|
| `/** ... */` | All exports | Description |
| `@example` | Interfaces, factory functions | Usage sample |
| `@param` | Functions with non-obvious parameters | Parameter meaning |
| `@returns` | Non-void functions where the return isn't obvious | What is returned |

---

## Interface Standard

```typescript
/**
 * One sentence describing what this interface represents.
 * Second sentence if needed for domain context.
 *
 * @example
 * const slot = createLayoutSlot(createKeyId('key-a'), 1)
 */
export interface LayoutSlot {
  /** The key this slot renders. */
  keyId: KeyId
  /** Relative width multiplier (1 = standard key unit). */
  width: number
  /** Optional visible label override. */
  label?: string
}
```

Rules:
- Interface doc: one descriptive sentence, optionally two.
- Every field must have an inline `/** ... */` comment.
- `@example` shows the factory function, not direct object literal construction.

---

## Type Alias Standard

```typescript
/**
 * Identifies a supported language.
 * @example const lang: LanguageId = 'yoruba'
 */
export type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi'
```

Rules:
- One line description + inline `@example`.

---

## Factory Function Standard

```typescript
/**
 * Creates a {@link LayoutSlot}.
 * @param keyId - The key this slot will render.
 * @param width - Relative width multiplier.
 * @param label - Optional display label override.
 */
export function createLayoutSlot(keyId: KeyId, width: number, label?: string): LayoutSlot {
  return label !== undefined ? { keyId, width, label } : { keyId, width }
}
```

Rules:
- One-line summary referencing the type with `{@link}`.
- `@param` for each parameter when the name alone is not self-documenting.
- No `@returns` needed when the return type is the linked interface.

---

## Type Guard Standard

```typescript
/** Type guard for {@link LanguageId}. */
export function isLanguageId(val: unknown): val is LanguageId {
  ...
}
```

Rules:
- Minimal one-liner: `Type guard for {@link X}.`
- No `@param` needed — `val: unknown` is self-explanatory.

---

## What NOT to Document

- Private/internal helpers not exported from `src/data/index.ts` or `src/public/index.ts`
- Test files
- Configuration files (`vite.config.ts`, `vitest.config.ts`, etc.)

---

## Linting

TSDoc is not currently enforced by ESLint. A `eslint-plugin-tsdoc` rule is tracked in BBOARD-37 (Code Style Guide). Until then, follow this guide manually when authoring or reviewing code.
