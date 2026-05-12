[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutShape

# Interface: LayoutShape

Defined in: [data/layout.types.ts:46](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L46)

The full shape of a keyboard layout variant.

## Example

```ts
const shape = createLayoutShape('desktop-azerty', 'desktop', [baseLayer], 'light');
```

## Properties

### id

> **id**: `"desktop-azerty"` \| `"mobile-default"`

Defined in: [data/layout.types.ts:48](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L48)

Unique identifier for this variant.

---

### layers

> **layers**: [`LayoutLayer`](LayoutLayer.md)[]

Defined in: [data/layout.types.ts:52](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L52)

Ordered layers; typically base + shift (+ altGr on desktop).

---

### theme

> **theme**: `"light"` \| `"dark"` \| `"auto"`

Defined in: [data/layout.types.ts:54](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L54)

Default theme applied to this layout.

---

### variant

> **variant**: `"desktop"` \| `"mobile"`

Defined in: [data/layout.types.ts:50](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/layout.types.ts#L50)

Platform type: desktop or mobile.
