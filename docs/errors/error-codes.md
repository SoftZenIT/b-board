# Error Codes Reference

Every error emitted by `<benin-keyboard>` carries an `ErrorCode` that identifies the root cause. These codes appear in:

- The `bboard-error` custom event (`event.detail.code`)
- The inline error banner displayed inside the keyboard component
- Console log messages

---

## Error Code Table

| Code                   | Category     | Severity    | Description                                |
| ---------------------- | ------------ | ----------- | ------------------------------------------ |
| `NETWORK_ERROR`        | Data Loading | Recoverable | Fetch failed — no response from the server |
| `HTTP_ERROR`           | Data Loading | Recoverable | Server responded with a non-2xx status     |
| `DATA_NOT_FOUND`       | Data Loading | Fatal       | Requested data file does not exist         |
| `PARSE_ERROR`          | Data Loading | Fatal       | Data file contains invalid JSON            |
| `SCHEMA_VALIDATION`    | Validation   | Fatal       | Data does not match the expected schema    |
| `INTEGRITY_CHECK`      | Validation   | Fatal       | Cross-file consistency check failed        |
| `INVALID_LANGUAGE`     | Validation   | Fatal       | Language ID is not registered              |
| `INVALID_LAYOUT`       | Validation   | Fatal       | Layout variant is not registered           |
| `INVALID_TRANSITION`   | State        | Fatal       | Invalid state machine transition attempted |
| `INVARIANT_VIOLATION`  | State        | Fatal       | Internal invariant broken                  |
| `COMPOSITION_ERROR`    | Composition  | Recoverable | Composition rule evaluation failed         |
| `INVALID_OPERATION`    | Composition  | Fatal       | Malformed input operation                  |
| `RENDER_ERROR`         | Runtime      | Recoverable | Keyboard failed to render                  |
| `EVENT_DISPATCH_ERROR` | Runtime      | Recoverable | An event listener threw                    |
| `UNKNOWN_ERROR`        | Runtime      | Recoverable | Unrecognized error                         |

### Severity Levels

| Severity        | Meaning                   | Behavior                                            |
| --------------- | ------------------------- | --------------------------------------------------- |
| **Recoverable** | May resolve on retry      | Auto-retried once, then shown with a "Retry" button |
| **Fatal**       | Will not resolve on retry | Shown immediately with no retry option              |

---

## Using Error Codes in Consumer Code

```typescript
import { ErrorCode } from 'b-board';

const keyboard = document.querySelector('benin-keyboard');

keyboard.addEventListener('bboard-error', (e) => {
  const { code, message, recoverySuggestion } = e.detail;

  switch (code) {
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.HTTP_ERROR:
      showOfflineBanner(recoverySuggestion);
      break;

    case ErrorCode.DATA_NOT_FOUND:
      console.error(`Missing data: ${message}`);
      break;

    default:
      console.warn(`Keyboard error [${code}]: ${message}`);
  }
});
```

---

## Recovery Suggestions

Each code maps to a developer-facing recovery suggestion accessible via `RECOVERY_SUGGESTIONS[code]`:

| Code                   | Suggestion                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `NETWORK_ERROR`        | Check network connectivity and ensure the data server is reachable.                                 |
| `HTTP_ERROR`           | Verify the data file URL returns a 2xx status. Check server logs for errors.                        |
| `DATA_NOT_FOUND`       | Ensure the requested layout or language data file exists at the expected path.                      |
| `PARSE_ERROR`          | The data file contains invalid JSON. Regenerate or fix the data file.                               |
| `SCHEMA_VALIDATION`    | The data file does not match the expected schema. Run the schema validator to identify issues.      |
| `INTEGRITY_CHECK`      | Cross-file data consistency check failed. Check for duplicate keyIds or circular composition rules. |
| `INVALID_LANGUAGE`     | The specified language ID is not supported. Use one of the registered language IDs.                 |
| `INVALID_LAYOUT`       | The specified layout variant is not supported. Use one of the registered layout variants.           |
| `INVALID_TRANSITION`   | Check the valid transitions for the current state before calling transition().                      |
| `INVARIANT_VIOLATION`  | Ensure all required substates and engine conditions are met before the operation.                   |
| `COMPOSITION_ERROR`    | A composition rule failed. Check the composition rules catalog for the active language.             |
| `INVALID_OPERATION`    | The input operation is malformed. Verify operation type, text, and selection fields.                |
| `RENDER_ERROR`         | The keyboard failed to render. This is usually transient — try re-opening the keyboard.             |
| `EVENT_DISPATCH_ERROR` | An event listener threw an error. Check your bboard event handlers for exceptions.                  |
| `UNKNOWN_ERROR`        | An unexpected error occurred. Check the browser console for details.                                |
