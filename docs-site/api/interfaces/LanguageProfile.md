[**b-board**](../README.md)

---

[b-board](../README.md) / LanguageProfile

# Interface: LanguageProfile

Defined in: [data/language.types.ts:50](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L50)

A full language profile including its key catalog and composition rules.

## Example

```ts
const profile = createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', entries, rules);
```

## Properties

### characters

> **characters**: [`KeyCatalogEntry`](KeyCatalogEntry.md)[]

Defined in: [data/language.types.ts:58](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L58)

All keyed characters for this language.

---

### compositionRules

> **compositionRules**: [`CompositionRule`](CompositionRule.md)[]

Defined in: [data/language.types.ts:60](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L60)

Composition rules (tone marks, nasal marks, dead keys).

---

### languageId

> **languageId**: `"yoruba"` \| `"fon-adja"` \| `"baatonum"` \| `"dendi"`

Defined in: [data/language.types.ts:52](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L52)

Unique language identifier.

---

### name

> **name**: `string`

Defined in: [data/language.types.ts:54](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L54)

English name of the language.

---

### nativeName

> **nativeName**: `string`

Defined in: [data/language.types.ts:56](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/language.types.ts#L56)

Name in the language itself.
