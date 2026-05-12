[**b-board**](../README.md)

---

[b-board](../README.md) / LifecycleEventMap

# Interface: LifecycleEventMap

Defined in: [core/lifecycle.types.ts:5](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L5)

## Properties

### destroyed

> **destroyed**: `object`

Defined in: [core/lifecycle.types.ts:9](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L9)

#### timestamp

> **timestamp**: `number`

---

### error

> **error**: `object`

Defined in: [core/lifecycle.types.ts:8](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L8)

#### error

> **error**: `KeyboardError`

#### recoverable

> **recoverable**: `boolean`

#### timestamp

> **timestamp**: `number`

---

### initialized

> **initialized**: `object`

Defined in: [core/lifecycle.types.ts:6](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L6)

#### state

> **state**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

#### timestamp

> **timestamp**: `number`

---

### ready

> **ready**: `object`

Defined in: [core/lifecycle.types.ts:7](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L7)

#### state

> **state**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

#### substates

> **substates**: [`ReadySubstates`](ReadySubstates.md)

#### timestamp

> **timestamp**: `number`

---

### state-change

> **state-change**: `object`

Defined in: [core/lifecycle.types.ts:10](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/core/lifecycle.types.ts#L10)

#### from

> **from**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`

#### timestamp

> **timestamp**: `number`

#### to

> **to**: `"uninitialized"` \| `"initializing"` \| `"ready"` \| `"error"` \| `"destroyed"`
