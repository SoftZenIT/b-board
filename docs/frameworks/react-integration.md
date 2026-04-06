# React Integration Guide

This guide shows how to integrate `<benin-keyboard>` into a React application.

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

## Type Declarations

Create a `bboard.d.ts` file in your `src/` directory:

```ts
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

## Event Handling

### React 18 (ref + addEventListener)

React 18 does not natively forward custom events from web components. Use a `ref` and `useEffect`:

```tsx
import { useEffect, useRef, useCallback, useState } from 'react';

function KeyboardDemo() {
  const keyboardRef = useRef<HTMLElement>(null);
  const [text, setText] = useState('');

  const handleKeyPress = useCallback((e: Event) => {
    const { char } = (e as CustomEvent).detail;
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
      <benin-keyboard ref={keyboardRef} language="yoruba" />
    </>
  );
}
```

### React 19+

React 19 supports custom element events natively. You can use `onBboardKeyPress` directly:

```tsx
function KeyboardDemo() {
  const [text, setText] = useState('');

  return (
    <>
      <textarea value={text} readOnly />
      <benin-keyboard
        language="yoruba"
        onBboardKeyPress={(e) => setText((prev) => prev + e.detail.char)}
      />
    </>
  );
}
```

## Property Binding

Set attributes directly in JSX:

```tsx
<benin-keyboard
  language={language}
  theme={theme}
  layout-variant="desktop-azerty"
  disabled={isDisabled}
/>
```

## Available Events

| Event Name               | Detail                                            | Description          |
| ------------------------ | ------------------------------------------------- | -------------------- |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | Key was pressed      |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Keyboard initialized |
| `bboard-language-change` | `{ languageId: string }`                          | Language changed     |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Theme changed        |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Error occurred       |

## Handling Composition

The keyboard handles tone and nasal modifiers internally. When a user types a base letter followed by a modifier, the `bboard-key-press` event emits the composed character directly:

```tsx
// Typing 'e' then '´' emits char: 'é' (not two separate events)
const handleKeyPress = useCallback((e: Event) => {
  const { char } = (e as CustomEvent).detail;
  // char is already the composed character
  setText((prev) => prev + char);
}, []);
```

## Theming

Use CSS custom properties to customize appearance:

```tsx
<benin-keyboard
  language="yoruba"
  theme="dark"
  style={
    {
      '--bboard-color-surface-base': '#1e1e1e',
      '--bboard-color-surface-key': '#2d2d2d',
      '--bboard-color-text-primary': '#ffffff',
    } as React.CSSProperties
  }
/>
```

## SSR Considerations (Next.js)

Custom elements require the DOM to be available. In Next.js:

```tsx
'use client';

import { useEffect, useState } from 'react';

function KeyboardWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import('b-board');
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading keyboard...</div>;

  return <benin-keyboard language="yoruba" />;
}
```

## Full Example

See [`examples/react-sample-app/`](../../examples/react-sample-app/) for a complete working example.
