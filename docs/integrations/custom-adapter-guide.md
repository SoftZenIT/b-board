# Custom Editor Adapter Guide

This guide explains how to implement a B-Board adapter for 3rd-party rich-text editors (e.g., Quill, TipTap, Monaco).

## Steps to Implement

### 1. Extend `BaseAdapter`
The `BaseAdapter` provides the constructor and standard `focus`/`blur` implementations.

```typescript
import { BaseAdapter, TargetHandle } from '@b-board/core/adapters';

export class MyEditorAdapter extends BaseAdapter {
  constructor(handle: TargetHandle, private editorInstance: any) {
    // element is the container div of the editor
    super(handle, editorInstance.container); 
  }
}
```

### 2. Map Selection State
Implement `getSelection()` to translate your editor's internal selection model to `NormalizedSelection`.

```typescript
getSelection() {
  const range = this.editorInstance.getSelection();
  if (!range) return null;
  return {
    position: range.index,
    length: range.length,
    direction: 'none'
  };
}
```

### 3. Implement Atomic Operations
Implement `applyOperation(op)`. You should use the editor's official API (e.g., `insertText`) rather than direct DOM manipulation to ensure the editor's internal state stays in sync.

```typescript
applyOperation(operation) {
  try {
    if (operation.type === 'insert') {
      this.editorInstance.insertText(this.getSelection().position, operation.text);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: { code: 'MY_ERR', message: e.message } };
  }
}
```

## Security Best Practices

- **Never use `innerHTML`:** Always use the editor's text-only insertion methods.
- **Sync State:** Ensure the editor's internal model is updated alongside the DOM.
- **Validation:** Rely on the `OperationDispatcher` to validate target safety before your adapter is called.
