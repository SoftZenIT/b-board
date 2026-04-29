[**b-board**](../README.md)

---

[b-board](../README.md) / ResolvedKey

# Interface: ResolvedKey

Defined in: [data/runtime.types.ts:22](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L22)

Represents a key's full behavior across all layers and interactions.

## Example

```ts
const rk = createResolvedKey('key-a', { base: outA, shift: outShiftA });
```

## Properties

### keyId

> `readonly` **keyId**: [`KeyId`](../type-aliases/KeyId.md)

Defined in: [data/runtime.types.ts:24](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L24)

The unique key identifier.

---

### layers

> `readonly` **layers**: `Record`\<[`LayerId`](../type-aliases/LayerId.md), [`KeyOutput`](KeyOutput.md)\>

Defined in: [data/runtime.types.ts:26](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L26)

Map of LayerId to its specific output.

---

### longPress

> `readonly` **longPress**: readonly `string`[]

Defined in: [data/runtime.types.ts:28](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/runtime.types.ts#L28)

Array of characters for the long-press menu.
