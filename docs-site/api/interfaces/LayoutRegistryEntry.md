[**b-board**](../README.md)

---

[b-board](../README.md) / LayoutRegistryEntry

# Interface: LayoutRegistryEntry

Defined in: [data/registry.types.ts:21](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L21)

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

Defined in: [data/registry.types.ts:23](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L23)

Layout variant identifier.

---

### path

> **path**: `string`

Defined in: [data/registry.types.ts:25](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L25)

Relative path to the layout JSON file.
