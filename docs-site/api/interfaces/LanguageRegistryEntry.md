[**b-board**](../README.md)

---

[b-board](../README.md) / LanguageRegistryEntry

# Interface: LanguageRegistryEntry

Defined in: [data/registry.types.ts:9](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L9)

A single entry in the registry pointing to a data file.

## Example

```ts
const entry: LanguageRegistryEntry = { id: 'yoruba', path: 'data/languages/yoruba.json' };
```

## Properties

### id

> **id**: `"yoruba"` \| `"fon-adja"` \| `"baatonum"` \| `"dendi"`

Defined in: [data/registry.types.ts:11](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L11)

Language identifier.

---

### path

> **path**: `string`

Defined in: [data/registry.types.ts:13](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L13)

Relative path to the language JSON file.
