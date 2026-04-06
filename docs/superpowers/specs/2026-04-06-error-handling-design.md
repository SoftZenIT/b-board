# Error Handling & Recovery Paths — Design Spec

**Epic:** BBOARD-56  
**Date:** 2026-04-06  
**Status:** Approved

## Problem Statement

The b-board keyboard component has error handling infrastructure (6 custom error classes, an ErrorHandler factory, a `bboard-error` event type, a logger) but none of it is wired up. `_loadLayout()` in `benin-keyboard.ts` has unguarded `Promise.all` calls — any `DataLoaderError`, `ValidationError`, or `IntegrityError` propagates as an unhandled rejection. Consumers have no way to detect or recover from errors programmatically.

## Approach

Public ErrorCode enum + expanded core handler. Error codes are part of the public API (`src/public/`), respecting module boundaries. Error handling is integrated into the existing element and state machine — no new module layer.

## Design Decisions

- **File structure:** Follow existing codebase patterns — errors stay in their modules, ErrorCode enum in `src/public/`
- **Retry strategy:** Hybrid — auto-retry once silently (1s delay), then emit error with `retry()` method
- **Error display:** Inline error banner in shadow DOM (self-contained)
- **Language:** French (target audience: Francophone West Africa)

---

## 1. ErrorCode Enum & Recovery Suggestions (BBOARD-84)

**File:** `src/public/error-codes.ts` (new)

```typescript
export enum ErrorCode {
  // Data loading
  NETWORK_ERROR = 'NETWORK_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',

  // Validation
  SCHEMA_VALIDATION = 'SCHEMA_VALIDATION',
  INTEGRITY_CHECK = 'INTEGRITY_CHECK',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  INVALID_LAYOUT = 'INVALID_LAYOUT',

  // State
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  INVARIANT_VIOLATION = 'INVARIANT_VIOLATION',

  // Composition
  COMPOSITION_ERROR = 'COMPOSITION_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // Runtime
  RENDER_ERROR = 'RENDER_ERROR',
  EVENT_DISPATCH_ERROR = 'EVENT_DISPATCH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

**Recovery suggestions:** A `RECOVERY_SUGGESTIONS: Record<ErrorCode, string>` map providing human-readable guidance for each code. Exported alongside the enum.

**Export:** Both `ErrorCode` and `RECOVERY_SUGGESTIONS` exported from `src/public/index.ts`.

---

## 2. Error State Transitions (BBOARD-85)

**Existing states:** `uninitialized → loading → ready → destroyed`

**New state:** `error` — entered when a recoverable error occurs after retry exhaustion.

**Transitions:**
| From | To | Trigger |
|------|----|---------|
| any | `error` | Recoverable error (after auto-retry fails) |
| any | `destroyed` | Fatal error |
| `error` | `loading` | `retry()` called |
| `error` | `destroyed` | `destroy()` called or fatal escalation |

**Error context:** The `KeyboardError` (with code, message, suggestions) is preserved on the state machine so the UI can render the error banner.

**Files modified:** `src/core/_internal/state-machine.ts`, `src/core/state.types.ts`

---

## 3. Recoverable vs Fatal Distinction (BBOARD-86)

### Classification

| Severity | Error Codes | Rationale |
|----------|-------------|-----------|
| Recoverable | `NETWORK_ERROR`, `HTTP_ERROR`, `DATA_NOT_FOUND`, `RENDER_ERROR`, `EVENT_DISPATCH_ERROR`, `COMPOSITION_ERROR` | Transient issues that may resolve |
| Fatal | `SCHEMA_VALIDATION`, `INTEGRITY_CHECK`, `INVARIANT_VIOLATION`, `INVALID_LANGUAGE`, `INVALID_LAYOUT`, `INVALID_OPERATION`, `PARSE_ERROR` | Data or operation is fundamentally wrong |
| Unknown → Recoverable | `UNKNOWN_ERROR` | Optimistic fallback |

### Retry Flow (in `benin-keyboard.ts`)

1. Catch error in `_loadLayout()` → classify via `ErrorHandler`
2. If recoverable: auto-retry once silently (1s delay)
3. If retry fails: transition to `error` state, emit `bboard-error`, render error banner with "Retry" button
4. If fatal: transition to `destroyed`, emit `bboard-error`, render permanent error banner (no retry)

### Public API

```typescript
// On <benin-keyboard> element
retry(): void  // Retries from error state → loading
```

---

## 4. Error Event Emission (BBOARD-87)

### Enhanced Event Detail

```typescript
export interface BBoardErrorEventDetail {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly recoverySuggestion: string;
  readonly cause?: Error;  // dev-only (stripped when NODE_ENV === 'production')
}
```

### Emission Points

All via existing `dispatchBBoardEvent('bboard-error', detail)`:

- `_loadLayout()` failure → after retry exhaustion
- State transition errors → immediately
- Composition errors → immediately
- Operation validation errors → immediately

### Production Sanitization

- `cause` field omitted in production (existing pattern in ErrorHandler)
- Error messages follow existing `[Module] Action: detail` format from `docs/ERROR_MESSAGE_STANDARDS.md`

---

## 5. Graceful Degradation — Error UI (BBOARD-88)

### Error Banner

Inline banner in the keyboard's shadow DOM, replacing the key grid:

- **Recoverable:** Warning-styled banner — "Le clavier n'a pas pu se charger. [Réessayer]"
- **Fatal:** Error-styled banner — "Le clavier a rencontré une erreur critique."

### Banner Properties

- `role="alert"` for immediate screen reader announcement
- ARIA live region also announces the error message
- Styled within shadow DOM
- Respects `prefers-contrast: more` and `forced-colors: active`
- Retry button (recoverable only) calls `retry()` internally

### No Silent Failures

Every error path does all three:
1. Renders the error banner (replaces key grid)
2. Emits a `bboard-error` event (for consumer handling)
3. Logs to console via existing logger

**Note:** `RECOVERY_SUGGESTIONS` map values are in English (developer-facing API). The error banner UI text is in French (user-facing).

---

## 6. Error Documentation (BBOARD-89)

### New Files

- **`docs/errors/error-codes.md`** — Reference table: ErrorCode, severity, description, recovery suggestion, example trigger
- **`docs/errors/error-handling-guide.md`** — Developer guide: listening for events, using `retry()`, distinguishing recoverable/fatal, code examples

### Updated Files

- **`docs/ERROR_MESSAGE_STANDARDS.md`** — Add reference to the new ErrorCode system and link to `docs/errors/`

---

## Files Summary

| File | Action | Task |
|------|--------|------|
| `src/public/error-codes.ts` | Create | BBOARD-84 |
| `src/public/index.ts` | Modify (export) | BBOARD-84 |
| `src/core/_internal/error-handler.ts` | Modify (ErrorCode mapping) | BBOARD-84, 86 |
| `src/core/_internal/state-machine.ts` | Modify (error state) | BBOARD-85 |
| `src/core/state.types.ts` | Modify (error state type) | BBOARD-85 |
| `src/public/events.types.ts` | Modify (enhanced detail) | BBOARD-87 |
| `src/element/benin-keyboard.ts` | Modify (error boundary, banner, retry) | BBOARD-85, 86, 87, 88 |
| `src/core/_internal/error-handler.test.ts` | Modify (new tests) | BBOARD-84, 86 |
| `src/core/_internal/state-machine.test.ts` | Modify (error state tests) | BBOARD-85 |
| `docs/errors/error-codes.md` | Create | BBOARD-89 |
| `docs/errors/error-handling-guide.md` | Create | BBOARD-89 |
| `docs/ERROR_MESSAGE_STANDARDS.md` | Modify | BBOARD-89 |

## Test Coverage

- ErrorCode enum completeness — every code has a recovery suggestion
- ErrorHandler maps known error classes to correct ErrorCodes
- State machine: error state transitions (any→error, error→loading, error→destroyed, any→destroyed)
- Retry logic: auto-retry once, then manual retry
- Error event emission with correct payload (dev vs production)
- Error banner rendering (recoverable vs fatal)
- Screen reader announcement of errors
- Integration: `_loadLayout()` failure → full error flow
