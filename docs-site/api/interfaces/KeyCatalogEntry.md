[**b-board**](../README.md)

---

[b-board](../README.md) / KeyCatalogEntry

# Interface: KeyCatalogEntry

Defined in: [data/language.types.ts:30](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L30)

A single entry in a language's key catalog, mapping a key to its outputs.

## Example

```ts
const entry = createKeyEntry(createKeyId('key-a'), 'a', 'A');
```

## Properties

### altGrChar?

> `readonly` `optional` **altGrChar?**: `string`

Defined in: [data/language.types.ts:38](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L38)

Character produced by the AltGr layer.

---

### baseChar

> `readonly` **baseChar**: `string`

Defined in: [data/language.types.ts:34](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L34)

Character produced by the base layer.

---

### composition?

> `readonly` `optional` **composition?**: [`CompositionRule`](CompositionRule.md)[]

Defined in: [data/language.types.ts:40](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L40)

Composition rules triggered from this key.

---

### keyId

> `readonly` **keyId**: [`KeyId`](../type-aliases/KeyId.md)

Defined in: [data/language.types.ts:32](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L32)

The key this entry describes.

---

### longPress?

> `readonly` `optional` **longPress?**: readonly `string`[]

Defined in: [data/language.types.ts:42](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L42)

Related characters for long-press menus.

---

### shiftChar?

> `readonly` `optional` **shiftChar?**: `string`

Defined in: [data/language.types.ts:36](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L36)

Character produced by the shift layer.
