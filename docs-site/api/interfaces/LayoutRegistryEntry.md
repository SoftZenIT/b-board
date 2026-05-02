[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutRegistryEntry

# Interface: LayoutRegistryEntry

Defined in: [data/registry.types.ts:21](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L21)

A single layout entry in the registry.

## Example

```ts
const entry: LayoutRegistryEntry = {
  id: 'desktop-azerty',
  path: 'data/layouts/desktop-azerty.json',
};
```

## Properties

### id

> **id**: `"desktop-azerty"` \| `"mobile-default"`

Defined in: [data/registry.types.ts:23](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L23)

Layout variant identifier.

---

### path

> **path**: `string`

Defined in: [data/registry.types.ts:25](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L25)

Relative path to the layout JSON file.
