[**b-board**](../README.md)

---

[b-board](../README.md) / EngineOperation

# Interface: EngineOperation

Defined in: [data/runtime.types.ts:67](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L67)

A single operation to apply to the host input element.

## Example

```ts
const op = createEngineOperation('insert', 'á');
```

## Properties

### data

> `readonly` **data**: `string`

Defined in: [data/runtime.types.ts:71](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L71)

The text payload (empty string for delete).

---

### selectionStart?

> `readonly` `optional` **selectionStart?**: `number`

Defined in: [data/runtime.types.ts:73](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L73)

Optional cursor/selection position hint.

---

### type

> `readonly` **type**: `"insert"` \| `"delete"`

Defined in: [data/runtime.types.ts:69](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L69)

What to do: insert text or delete selection.
