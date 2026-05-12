[**b-board**](../README.md)

---

[b-board](../README.md) / KeyOutput

# Interface: KeyOutput

Defined in: [data/runtime.types.ts:10](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L10)

The resolved output for a single key at a specific layer.

## Example

```ts
const out = createKeyOutput('á', toneRule);
```

## Properties

### char

> `readonly` **char**: `string`

Defined in: [data/runtime.types.ts:12](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L12)

The character this key produces at this layer.

---

### composition?

> `readonly` `optional` **composition?**: [`CompositionRule`](CompositionRule.md)

Defined in: [data/runtime.types.ts:14](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L14)

The composition rule attached to this key at this layer, if any.
