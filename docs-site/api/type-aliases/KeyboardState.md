[**b-board**](../README.md)

---

[b-board](../README.md) / KeyboardState

# Type Alias: KeyboardState

> **KeyboardState** = _typeof_ `KEYBOARD_STATES`\[`number`\]

Defined in: [core/state.types.ts:17](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/state.types.ts#L17)

The top-level lifecycle state of the keyboard engine.

- `uninitialized` — created but not yet initialized
- `initializing` — `initialize()` called, async setup in progress
- `ready` — fully operational
- `error` — a recoverable error occurred; engine can be re-initialized
- `destroyed` — engine torn down; create a new instance to reuse
