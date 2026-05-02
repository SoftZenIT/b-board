[**b-board**](../README.md)

---

[b-board](../README.md) / RECOVERABLE_CODES

# Variable: RECOVERABLE_CODES

> `const` **RECOVERABLE_CODES**: `ReadonlySet`\<[`ErrorCode`](../enumerations/ErrorCode.md)\>

Defined in: [public/error-codes.ts:79](https://github.com/SoftZenIT/b-board/blob/fbde7c09877b4cf77622343e6f26b0c36b001484/src/public/error-codes.ts#L79)

Maps an [ErrorCode](../enumerations/ErrorCode.md) to whether it is considered recoverable.
Recoverable errors may resolve on retry; fatal errors indicate
fundamentally broken data or configuration.
