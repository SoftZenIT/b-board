[**b-board**](../README.md)

---

[b-board](../README.md) / CompositionRule

# Interface: CompositionRule

Defined in: [data/language.types.ts:14](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L14)

A composition rule — maps a trigger + base to a composed result.

## Example

```ts
const rule = createCompositionRule('´', 'a', 'á', 'tone');
```

## Properties

### base

> **base**: `string`

Defined in: [data/language.types.ts:18](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L18)

The base character to combine with.

---

### mode

> **mode**: [`CompositionRuleMode`](../type-aliases/CompositionRuleMode.md)

Defined in: [data/language.types.ts:22](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L22)

Whether this is a tone or nasal composition.

---

### result

> **result**: `string`

Defined in: [data/language.types.ts:20](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L20)

The resulting composed character.

---

### trigger

> **trigger**: `string`

Defined in: [data/language.types.ts:16](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/language.types.ts#L16)

The dead key or modifier that arms composition.
