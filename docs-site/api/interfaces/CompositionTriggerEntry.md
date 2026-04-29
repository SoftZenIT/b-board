[**b-board**](../README.md)

---

[b-board](../README.md) / CompositionTriggerEntry

# Interface: CompositionTriggerEntry

Defined in: [data/registry.types.ts:48](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L48)

A single dead-key trigger entry in the global composition rules catalog.

## Example

```ts
const t: CompositionTriggerEntry = { trigger: '´', name: 'acute', mode: 'tone' };
```

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [data/registry.types.ts:56](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L56)

Optional description shown in documentation.

---

### mode

> **mode**: [`CompositionRuleMode`](../type-aliases/CompositionRuleMode.md)

Defined in: [data/registry.types.ts:54](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L54)

Whether this trigger produces a tone mark or a nasal mark.

---

### name

> **name**: `string`

Defined in: [data/registry.types.ts:52](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L52)

Human-readable name for the trigger (e.g. 'acute').

---

### trigger

> **trigger**: `string`

Defined in: [data/registry.types.ts:50](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/registry.types.ts#L50)

The dead-key character that arms composition.
