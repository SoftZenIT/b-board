[**b-board**](../README.md)

---

[b-board](../README.md) / CompositionState

# Interface: CompositionState

Defined in: [data/runtime.types.ts:53](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L53)

Live state of the composition engine between keystrokes.

## Example

```ts
const state = createCompositionState('tone-armed', '´', true);
```

## Properties

### armed

> `readonly` **armed**: `boolean`

Defined in: [data/runtime.types.ts:59](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L59)

Whether a dead key has been pressed and is waiting for a base key.

---

### buffer

> `readonly` **buffer**: `string`

Defined in: [data/runtime.types.ts:57](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L57)

Characters accumulated so far in the composition buffer.

---

### mode

> `readonly` **mode**: `"none"` \| `"tone-armed"` \| `"nasal-armed"`

Defined in: [data/runtime.types.ts:55](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L55)

Current composition mode.
