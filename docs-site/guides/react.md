---
title: React Integration
---

# React Integration

This guide covers integrating `<benin-keyboard>` into a React application. The keyboard is a Web Component, so there are a few React-specific considerations — especially around event handling and TypeScript types.

## Installation

```bash
npm install b-board
```

## Setup

Import the package in your entry file to register the custom element:

```tsx
// main.tsx
import 'b-board';
```

## TypeScript Type Declaration

React does not automatically recognize custom elements. Create a `src/bboard.d.ts` file to add JSX type support:

```ts
// src/bboard.d.ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardAttributes {
  language?: LanguageId;
  theme?: ThemeId;
  'layout-variant'?: 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode'?: 'transition' | 'hint';
  open?: boolean;
  disabled?: boolean;
  'show-physical-echo'?: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'benin-keyboard': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & BeninKeyboardAttributes,
        HTMLElement
      >;
    }
  }
}
```

## Basic Usage

```tsx
import 'b-board';

export default function App() {
  return (
    <div>
      <h1>My App</h1>
      <benin-keyboard language="yoruba" theme="auto" />
    </div>
  );
}
```

## Event Handling

### Why `addEventListener` instead of JSX event props?

React 18's synthetic event system does not forward custom events dispatched by web components. Using `onBboardKeyPress` as a JSX prop will silently do nothing in React 18.

The correct approach is to attach a native DOM listener using a `ref` and `useEffect`:

```tsx
import { useEffect, useRef, useCallback, useState } from 'react';
import 'b-board';

export default function KeyboardDemo() {
  const keyboardRef = useRef<HTMLElement>(null);
  const [text, setText] = useState('');

  const handleKeyPress = useCallback((e: Event) => {
    const { char } = (e as CustomEvent<{ char: string }>).detail;
    setText((prev) => prev + char);
  }, []);

  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;

    el.addEventListener('bboard-key-press', handleKeyPress);
    return () => el.removeEventListener('bboard-key-press', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <>
      <textarea value={text} readOnly />
      <benin-keyboard ref={keyboardRef} language="yoruba" theme="auto" />
    </>
  );
}
```

> **Note:** Always use functional state updates (`prev => prev + char`) when updating state inside event handlers. This avoids stale closure bugs where the handler captures an outdated value of `text`.

> **Note:** Always return a cleanup function from `useEffect` to remove the listener on unmount. Forgetting cleanup causes duplicate handlers and memory leaks if the component remounts.

### React 19+

React 19 adds native support for custom element events. You can use the camelCase event name directly in JSX:

```tsx
<benin-keyboard
  language="yoruba"
  onBboardKeyPress={(e) => setText((prev) => prev + e.detail.char)}
/>
```

## Controlled Input Pattern

To insert characters at the cursor position (rather than always appending), use a `ref` on the textarea and the selection range API:

```tsx
import { useEffect, useRef, useCallback } from 'react';
import 'b-board';

export default function ControlledInput() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyboardRef = useRef<HTMLElement>(null);

  const handleKeyPress = useCallback((e: Event) => {
    const { char } = (e as CustomEvent<{ char: string }>).detail;
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    // Insert at cursor position
    const newValue = el.value.slice(0, start) + char + el.value.slice(end);

    // Use nativeInputValueSetter to work with React's controlled input
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )!.set!;
    nativeInputValueSetter.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    // Restore cursor position after the inserted character
    const newPos = start + char.length;
    el.selectionStart = newPos;
    el.selectionEnd = newPos;
    el.focus();
  }, []);

  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;
    el.addEventListener('bboard-key-press', handleKeyPress);
    return () => el.removeEventListener('bboard-key-press', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <>
      <textarea ref={inputRef} placeholder="Type here..." />
      <benin-keyboard ref={keyboardRef} language="yoruba" />
    </>
  );
}
```

## Language Switching

Switch the active language by updating the `language` attribute:

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import 'b-board';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'yoruba', label: 'Yoruba' },
  { id: 'fon-adja', label: 'Fon / Adja' },
  { id: 'baatonum', label: 'Baatɔnum' },
  { id: 'dendi', label: 'Dendi' },
];

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<LanguageId>('yoruba');
  const [text, setText] = useState('');
  const keyboardRef = useRef<HTMLElement>(null);

  const handleKeyPress = useCallback((e: Event) => {
    const { char } = (e as CustomEvent<{ char: string }>).detail;
    setText((prev) => prev + char);
  }, []);

  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;
    el.addEventListener('bboard-key-press', handleKeyPress);
    return () => el.removeEventListener('bboard-key-press', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div>
      <div>
        {LANGUAGES.map(({ id, label }) => (
          <button key={id} onClick={() => setLanguage(id)}>
            {label}
          </button>
        ))}
      </div>
      <textarea value={text} readOnly />
      <benin-keyboard ref={keyboardRef} language={language} theme="auto" />
    </div>
  );
}
```

## Boolean Attribute Binding

React's handling of boolean attributes on custom elements can be surprising. Setting `disabled={false}` may still add the attribute to the DOM. Use conditional spreading to avoid this:

```tsx
// May still add disabled="" to the DOM:
<benin-keyboard disabled={false} />

// Correct — attribute is absent when false:
<benin-keyboard {...(isDisabled ? { disabled: true } : {})} />
```

## SSR / Next.js

Custom elements require a browser environment. In Next.js, add the `'use client'` directive and defer the import:

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function KeyboardWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import('b-board');
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading keyboard…</div>;

  return <benin-keyboard language="yoruba" />;
}
```

## Common Pitfalls

| Pitfall                           | Cause                                  | Fix                                         |
| --------------------------------- | -------------------------------------- | ------------------------------------------- |
| Events never fire                 | React 18 doesn't forward custom events | Use `ref` + `addEventListener`              |
| Duplicate events                  | Missing cleanup in `useEffect`         | Always return a cleanup function            |
| Stale state in handler            | Inline handler with stale closure      | Use `useCallback` + functional state update |
| Keyboard loses state on re-render | Unstable `key` prop                    | Use a stable or absent `key`                |
| `disabled={false}` still disables | React booleans on custom elements      | Use conditional attribute spreading         |
| SSR hydration mismatch            | Server doesn't know custom elements    | Use `'use client'` + deferred import        |

## Live Demo

<StackBlitzEmbed framework="react" />

## Standalone Example

A complete working example is available at [`examples/react-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/react-sample-app).
