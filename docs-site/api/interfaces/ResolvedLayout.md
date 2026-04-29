[**b-board**](../README.md)

---

[b-board](../README.md) / ResolvedLayout

# Interface: ResolvedLayout

Defined in: [data/runtime.types.ts:37](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L37)

A fully resolved keyboard — layout + language + key-to-output map.
Built at runtime by the data loader once a language + layout pair is selected.

## Example

```ts
const resolved = createResolvedLayout(shape, profile, keyMap, compositionMap);
```

## Properties

### compositionMap

> `readonly` **compositionMap**: `Map`\<`string`, [`CompositionRule`](CompositionRule.md)[]\>

Defined in: [data/runtime.types.ts:45](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L45)

Maps each trigger character to all composition rules for that trigger.

---

### keyMap

> `readonly` **keyMap**: `Map`\<[`KeyId`](../type-aliases/KeyId.md), [`ResolvedKey`](ResolvedKey.md)\>

Defined in: [data/runtime.types.ts:43](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L43)

Maps each KeyId to its multi-layer resolved behavior.

---

### language

> `readonly` **language**: [`LanguageProfile`](LanguageProfile.md)

Defined in: [data/runtime.types.ts:41](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L41)

The active language profile.

---

### layout

> `readonly` **layout**: [`LayoutShape`](LayoutShape.md)

Defined in: [data/runtime.types.ts:39](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/runtime.types.ts#L39)

The layout shape (structure).
