[**b-board**](../README.md)

---

[b-board](../README.md) / DataLayer

# Interface: DataLayer

Defined in: [data/data-layer.ts:10](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/data-layer.ts#L10)

The public data-loading contract for language profiles and layout shapes.
Implement this interface to provide a custom data source.

## Methods

### loadLanguageProfile()

> **loadLanguageProfile**(`id`): `Promise`\<[`LanguageProfile`](LanguageProfile.md)\>

Defined in: [data/data-layer.ts:15](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/data-layer.ts#L15)

Loads a language profile by its [LanguageId](../type-aliases/LanguageId.md).

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`LanguageProfile`](LanguageProfile.md)\>

#### Throws

if `id` is not a valid [LanguageId](../type-aliases/LanguageId.md)

---

### loadLayoutShape()

> **loadLayoutShape**(`id`): `Promise`\<[`LayoutShape`](LayoutShape.md)\>

Defined in: [data/data-layer.ts:20](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/data/data-layer.ts#L20)

Loads a layout shape by its [LayoutVariantId](../type-aliases/LayoutVariantId.md).

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`LayoutShape`](LayoutShape.md)\>

#### Throws

if `id` is not a valid [LayoutVariantId](../type-aliases/LayoutVariantId.md)
