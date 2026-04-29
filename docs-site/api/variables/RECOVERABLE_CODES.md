[**b-board**](../README.md)

---

[b-board](../README.md) / RECOVERABLE_CODES

# Variable: RECOVERABLE_CODES

> `const` **RECOVERABLE_CODES**: `ReadonlySet`\<[`ErrorCode`](../enumerations/ErrorCode.md)\>

Defined in: [public/error-codes.ts:79](https://github.com/SoftZenIT/b-board/blob/c22afb247f8482392c5e7a60d8facd4174dd8352/src/public/error-codes.ts#L79)

Maps an [ErrorCode](../enumerations/ErrorCode.md) to whether it is considered recoverable.
Recoverable errors may resolve on retry; fatal errors indicate
fundamentally broken data or configuration.
