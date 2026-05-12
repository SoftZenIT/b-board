[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutLayer

# Interface: LayoutLayer

Defined in: [data/layout.types.ts:34](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L34)

A named keyboard layer (shift state) containing rows.

## Example

```ts
const layer = createLayoutLayer('base', [row1, row2]);
```

## Properties

### name

> **name**: `"base"` \| `"shift"` \| `"altGr"`

Defined in: [data/layout.types.ts:36](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L36)

The shift state this layer represents.

---

### rows

> **rows**: [`LayoutRow`](LayoutRow.md)[]

Defined in: [data/layout.types.ts:38](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L38)

Ordered rows, top to bottom.
