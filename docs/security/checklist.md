# B-Board Security Checklist

Use this checklist during code reviews when modifying the adapter layer, dispatcher, or public API.

## Input & Output Validation

- [ ] New adapters ONLY accept `insert`, `delete`, or `replace` operations.
- [ ] Adapters NEVER use `innerHTML`, `outerHTML`, or `insertAdjacentHTML` for inserting user text.
- [ ] Native APIs (`setRangeText`, `execCommand('insertText')`) are exclusively used for DOM mutation.

## Target Validation

- [ ] `TargetValidation` is applied before ANY mutation operation.
- [ ] `stale` (detached) elements are rejected.
- [ ] `readonly` and `disabled` states are respected by `TargetValidation`.

## API & Integration

- [ ] The dispatcher delegates mutation handling to `InsertionPipeline`.
- [ ] Public events do not leak sensitive internal state objects (use frozen/cloned payloads).
- [ ] External inputs to `BeninKeyboard` properties are validated against strict type guards before internal state updates.
