# BBOARD Error Message Standards

---

## Format

```
[Module] Action: detail
```

| Part       | Description                                  | Example                              |
| ---------- | -------------------------------------------- | ------------------------------------ |
| `[Module]` | PascalCase name of the module or error class | `[DataLoader]`, `[IntegrityError]`   |
| `Action`   | What was attempted                           | `Failed to load`, `HTTP 404 loading` |
| `detail`   | Specific context — file, id, value           | `'desktop-azerty': network timeout`  |

---

## Examples by Error Class

```
[DataLoader] HTTP 404 loading 'data/layouts/desktop-azerty.json'
[DataLoader] Network error loading 'data/languages/yoruba.json': check console for details
[IntegrityError] Layout 'desktop-azerty' has duplicate keyId 'key-a'
[IntegrityError] Language 'yoruba' references unknown keyId 'key-xyz' not found in layout 'desktop-azerty'
[IntegrityError] Language 'yoruba' has circular composition: result 'á' is also a trigger
[ValidationError] Invalid LanguageProfile:
  .languageId: must be equal to one of the allowed values
    allowed: yoruba, fon-adja, baatonum, dendi
```

---

## Error Classification

| Class                 | Meaning                                    | Recovery                  |
| --------------------- | ------------------------------------------ | ------------------------- |
| **User error**        | Bad input from the consumer of the library | Fix the call site         |
| **System error**      | File not found, network failure            | Retry, check connectivity |
| **Programming error** | Bug — precondition violated                | Fix the code              |

---

## Production Sanitization

Never expose internal file paths or stack traces to production consumers:

```typescript
const detail =
  import.meta.env?.DEV === true
    ? err.message // full detail in dev
    : 'check console for details'; // sanitized in prod
```

---

## What NOT to Do

```typescript
// ❌ No module prefix
throw new Error('fetch failed');

// ❌ No context
throw new DataLoaderError('load error');

// ❌ Leaks internal path in production
throw new DataLoaderError(`Failed: ${internalFilePath}`);
```

---

## See Also

- [Error Codes Reference](./errors/error-codes.md) — canonical `ErrorCode` enum values and recovery suggestions
- [Error Handling Guide](./errors/error-handling-guide.md) — retry logic, error events, and inline banner behavior
