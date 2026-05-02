[**b-board**](../README.md)

---

[b-board](../README.md) / CompositionRulesCatalog

# Interface: CompositionRulesCatalog

Defined in: [data/registry.types.ts:64](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L64)

Global catalog of dead-key triggers used across all language profiles.

## Example

```ts
const catalog: CompositionRulesCatalog = { version: '1.0.0', triggers: [...] }
```

## Properties

### triggers

> **triggers**: [`CompositionTriggerEntry`](CompositionTriggerEntry.md)[]

Defined in: [data/registry.types.ts:68](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L68)

All registered dead-key triggers.

---

### version

> **version**: `string`

Defined in: [data/registry.types.ts:66](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/registry.types.ts#L66)

Semantic version of the catalog.
