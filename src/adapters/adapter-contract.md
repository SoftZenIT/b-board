# Target Adapter Contract

This document defines the formal contract between the B-Board Engine and host target elements (inputs, textareas, editors).

## Overview

The Adapter System provides a normalized interface for text manipulation, abstracting away the differences between standard HTML form elements and complex `contenteditable` or Rich Text Editor structures.

## Core Types

### TargetHandle
An opaque, branded string used to uniquely identify an attached target. 
- Created via `createTargetHandle(id)`.
- Prevents the engine from accidentally handling unverified or raw DOM nodes.

### InputOperation
The system only allows three atomic operations:
1. `insert`: Appends or inserts plain text at the current cursor.
2. `delete`: Deletes `n` characters backwards from the cursor.
3. `replace`: Replaces a specific `NormalizedSelection` with new text.

**Security Note:** Adapters MUST NOT accept HTML strings. All input is treated as raw text.

### NormalizedSelection
Normalizes browser-specific selection states:
- `position`: Absolute character offset.
- `length`: Selection length (0 for cursor).
- `direction`: `forward`, `backward`, or `none`.

## Interface: TargetAdapter

All adapters must implement the following methods:

| Method | Description |
| :--- | :--- |
| `getSelection()` | Returns the current `NormalizedSelection` or `null`. |
| `applyOperation(op)` | Executes an `InputOperation` and returns an `OperationResult`. |
| `focus()` | Moves browser focus to the host element. |
| `blur()` | Removes browser focus from the host element. |

## Security Constraints

1. **No innerHTML:** Implementation must use `value`, `setRangeText`, or `insertText` commands.
2. **Validation:** All operations must be gated by the `TargetValidator` to check for `readonly`, `disabled`, or `stale` states.
3. **Atoms:** Operations must be atomic. If an insertion fails, the DOM state must remain unchanged.
