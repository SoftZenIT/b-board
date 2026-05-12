[**b-board**](../README.md)

---

[b-board](../README.md) / DataLayerImpl

# Class: DataLayerImpl

Defined in: [data/data-layer.ts:33](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/data-layer.ts#L33)

Default [DataLayer](../interfaces/DataLayer.md) implementation — loads JSON files from the package's
`data/` directory via fetch. Pass a custom `baseUrl` if hosting data files
on a CDN.

## Example

```ts
const data = new DataLayerImpl();
const profile = await data.loadLanguageProfile('yoruba');
```

## Implements

- [`DataLayer`](../interfaces/DataLayer.md)

## Constructors

### Constructor

> **new DataLayerImpl**(`baseUrl?`): `DataLayerImpl`

Defined in: [data/data-layer.ts:36](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/data-layer.ts#L36)

#### Parameters

##### baseUrl?

`string`

#### Returns

`DataLayerImpl`

## Methods

### loadLanguageProfile()

> **loadLanguageProfile**(`id`): `Promise`\<[`LanguageProfile`](../interfaces/LanguageProfile.md)\>

Defined in: [data/data-layer.ts:40](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/data-layer.ts#L40)

Loads a language profile by its [LanguageId](../type-aliases/LanguageId.md).

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`LanguageProfile`](../interfaces/LanguageProfile.md)\>

#### Throws

if `id` is not a valid [LanguageId](../type-aliases/LanguageId.md)

#### Implementation of

[`DataLayer`](../interfaces/DataLayer.md).[`loadLanguageProfile`](../interfaces/DataLayer.md#loadlanguageprofile)

---

### loadLayoutShape()

> **loadLayoutShape**(`id`): `Promise`\<[`LayoutShape`](../interfaces/LayoutShape.md)\>

Defined in: [data/data-layer.ts:47](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/data/data-layer.ts#L47)

Loads a layout shape by its [LayoutVariantId](../type-aliases/LayoutVariantId.md).

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`LayoutShape`](../interfaces/LayoutShape.md)\>

#### Throws

if `id` is not a valid [LayoutVariantId](../type-aliases/LayoutVariantId.md)

#### Implementation of

[`DataLayer`](../interfaces/DataLayer.md).[`loadLayoutShape`](../interfaces/DataLayer.md#loadlayoutshape)
