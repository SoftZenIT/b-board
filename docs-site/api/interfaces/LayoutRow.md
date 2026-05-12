[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutRow

# Interface: LayoutRow

Defined in: [data/layout.types.ts:22](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L22)

A horizontal row of key slots.

## Example

```ts
const row = createLayoutRow([slotA, slotB]);
```

## Properties

### height?

> `optional` **height?**: `number`

Defined in: [data/layout.types.ts:26](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L26)

Optional height in pixels.

---

### slots

> **slots**: [`LayoutSlot`](LayoutSlot.md)[]

Defined in: [data/layout.types.ts:24](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L24)

Ordered slots in the row, left to right.
