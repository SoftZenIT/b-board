[**b-board**](../README.md)

---

[b-board](../README.md) / RegistryData

# Interface: RegistryData

Defined in: [data/registry.types.ts:34](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L34)

Root index of all available language and layout data files.
Loaded once at startup to discover available data without loading all files.

## Example

```ts
const registry: RegistryData = { version: '1.0.0', languages: [...], layouts: [...] }
```

## Properties

### languages

> **languages**: [`LanguageRegistryEntry`](LanguageRegistryEntry.md)[]

Defined in: [data/registry.types.ts:38](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L38)

All registered language profiles.

---

### layouts

> **layouts**: [`LayoutRegistryEntry`](LayoutRegistryEntry.md)[]

Defined in: [data/registry.types.ts:40](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L40)

All registered layout variants.

---

### version

> **version**: `string`

Defined in: [data/registry.types.ts:36](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L36)

Semantic version of the data set.
