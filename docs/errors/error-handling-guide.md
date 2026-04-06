# Error Handling Guide

This guide explains how `<benin-keyboard>` handles errors internally and how consumers can respond to them.

---

## Architecture Overview

```
Thrown error
  │
  ├─ classifyError()     → ErrorCode + auto-severity
  │
  ├─ handle()            → KeyboardError (normalized)
  │
  ├─ isRecoverable()?
  │   ├─ yes → auto-retry once (1 s delay)
  │   │         └─ still fails → banner + event + log
  │   └─ no  → banner + event + log (immediately)
  │
  └─ Consumer receives `bboard-error` event
```

### Error Flow

1. **Classification** — Every thrown value is classified into an `ErrorCode` with an auto-detected severity (`recoverable` or `fatal`).
2. **Normalization** — The raw error is wrapped in a `KeyboardError` with a sanitized message, code, severity, and recovery suggestion.
3. **Retry** — Recoverable errors are retried once automatically after a 1-second delay. If the retry succeeds, no error is surfaced.
4. **Surface** — If the retry fails (or the error is fatal), the error is surfaced via three channels:
   - **Inline banner** inside the keyboard's shadow DOM
   - **`bboard-error` custom event** on the element
   - **Console log** via the internal logger

---

## Listening for Errors

```typescript
const keyboard = document.querySelector('benin-keyboard');

keyboard.addEventListener('bboard-error', (e) => {
  console.log(e.detail.code); // e.g. 'NETWORK_ERROR'
  console.log(e.detail.message); // Human-readable message
  console.log(e.detail.recoverySuggestion); // Actionable hint
  console.log(e.detail.severity); // 'recoverable' | 'fatal'
  console.log(e.detail.cause); // Original Error (dev only)
});
```

The event is a standard `CustomEvent<BBoardErrorEventDetail>`. It does **not** bubble and is **not** cancellable — it is informational only.

---

## Programmatic Retry

When a recoverable error is displayed, consumers can trigger a retry:

```typescript
keyboard.retry();
```

This re-invokes the layout loading pipeline. The error banner is cleared automatically if the retry succeeds.

---

## Error Banner

The keyboard displays an inline error banner inside its shadow DOM:

- **Recoverable errors** — yellow/orange warning banner with a "Réessayer" (Retry) button
- **Fatal errors** — red error banner with no retry option

The banner includes:

- Error message
- Recovery suggestion
- Error code (small, muted text)

### Styling

The banner uses CSS custom properties that can be overridden:

| Custom property         | Default                                 | Description  |
| ----------------------- | --------------------------------------- | ------------ |
| `--bboard-error-bg`     | `#fff3cd` (warning) / `#f8d7da` (fatal) | Background   |
| `--bboard-error-color`  | `#856404` (warning) / `#721c24` (fatal) | Text color   |
| `--bboard-error-border` | `#ffc107` (warning) / `#f5c6cb` (fatal) | Border color |

The banner also supports:

- `@media (prefers-contrast: more)` — thicker borders, bolder text
- `@media (forced-colors: active)` — system colors via `forced-color-adjust: none`

---

## Public API

### Exports from `b-board`

```typescript
import {
  ErrorCode, // Enum of all error codes
  RECOVERY_SUGGESTIONS, // Record<ErrorCode, string>
  RECOVERABLE_CODES, // ReadonlySet<ErrorCode>
} from 'b-board';
```

### `BBoardErrorEventDetail`

```typescript
interface BBoardErrorEventDetail {
  code: ErrorCode;
  severity: 'recoverable' | 'fatal' | 'unknown';
  message: string;
  recoverySuggestion: string;
  cause?: Error; // Only present in development builds
}
```

---

## Error Classification Rules

| Error class                                      | ErrorCode             | Severity    |
| ------------------------------------------------ | --------------------- | ----------- |
| `DataLoaderError` (HTTP 4xx)                     | `HTTP_ERROR`          | Fatal       |
| `DataLoaderError` (HTTP 5xx+)                    | `HTTP_ERROR`          | Recoverable |
| `DataLoaderError` (message contains "not found") | `DATA_NOT_FOUND`      | Fatal       |
| `DataLoaderError` (other)                        | `NETWORK_ERROR`       | Recoverable |
| `ValidationError`                                | `SCHEMA_VALIDATION`   | Fatal       |
| `IntegrityError`                                 | `INTEGRITY_CHECK`     | Fatal       |
| `StateTransitionError`                           | `INVALID_TRANSITION`  | Fatal       |
| `InvariantViolationError`                        | `INVARIANT_VIOLATION` | Fatal       |
| `SyntaxError` (JSON parse failure)               | `PARSE_ERROR`         | Fatal       |
| Unknown / other                                  | `UNKNOWN_ERROR`       | Recoverable |

> **Note:** The `engine.handleError()` method always passes `severity: 'recoverable'` as an override, meaning errors during `initialize()` are always treated as recoverable regardless of their auto-classified severity.

---

## See Also

- [Error Codes Reference](./error-codes.md) — full table of codes and recovery suggestions
- [Error Message Standards](../ERROR_MESSAGE_STANDARDS.md) — formatting conventions for error messages
