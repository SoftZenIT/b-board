[**b-board**](../README.md)

---

[b-board](../README.md) / StateSnapshot

# Interface: StateSnapshot

Defined in: [core/state.types.ts:23](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/state.types.ts#L23)

A point-in-time snapshot of engine state and substates.
Useful for serialization, debugging, and testing.

## Properties

### previous

> **previous**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"` \| `null`

Defined in: [core/state.types.ts:27](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/state.types.ts#L27)

State before the last transition, or null if no transition has occurred.

---

### state

> **state**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

Defined in: [core/state.types.ts:25](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/state.types.ts#L25)

Current state.

---

### timestamp

> **timestamp**: `number`

Defined in: [core/state.types.ts:29](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/state.types.ts#L29)

Unix timestamp (ms) of the last transition.
