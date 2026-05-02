[**b-board**](../README.md)

---

[b-board](../README.md) / KeyId

# Type Alias: KeyId

> **KeyId** = `string` & `object`

Defined in: [public/types.ts:24](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/public/types.ts#L24)

A unique identifier for a keyboard key.
Must be created via [createKeyId](../functions/createKeyId.md) to carry the brand.

## Type Declaration

### \[\_\_\_keyIdBrand\]

> `readonly` **\[\_\_\_keyIdBrand\]**: `void`

## Example

```ts
const id: KeyId = createKeyId('key-a');
```
