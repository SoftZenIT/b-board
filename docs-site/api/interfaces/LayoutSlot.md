[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutSlot

# Interface: LayoutSlot

Defined in: [data/layout.types.ts:8](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/layout.types.ts#L8)

A single key slot within a keyboard row.

## Example

```ts
const slot = createLayoutSlot(createKeyId('key-a'), 1);
```

## Properties

### keyId

> **keyId**: [`KeyId`](../type-aliases/KeyId.md)

Defined in: [data/layout.types.ts:10](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/layout.types.ts#L10)

The key this slot renders.

---

### label?

> `optional` **label?**: `string`

Defined in: [data/layout.types.ts:14](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/layout.types.ts#L14)

Optional visible label override.

---

### width

> **width**: `number`

Defined in: [data/layout.types.ts:12](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/layout.types.ts#L12)

Relative width multiplier (1 = standard key unit).
