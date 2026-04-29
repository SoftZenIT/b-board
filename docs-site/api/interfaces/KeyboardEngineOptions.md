[**b-board**](../README.md)

---

[b-board](../README.md) / KeyboardEngineOptions

# Interface: KeyboardEngineOptions

Defined in: [core/engine.ts:22](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L22)

Options passed to [createKeyboardEngine](../functions/createKeyboardEngine.md).

## Properties

### checkInvariants?

> `optional` **checkInvariants?**: `boolean`

Defined in: [core/engine.ts:30](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L30)

Whether to run invariant checks on every state transition.
Disable in production for a small performance gain.

#### Default Value

`true`

---

### resolvedLayout

> **resolvedLayout**: [`ResolvedLayout`](ResolvedLayout.md)

Defined in: [core/engine.ts:24](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/core/engine.ts#L24)

A fully resolved layout produced by the data layer's resolve function.
