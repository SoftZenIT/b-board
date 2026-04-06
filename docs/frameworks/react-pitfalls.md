# React Common Pitfalls

Common issues when using `<benin-keyboard>` in React applications and how to fix them.

## 1. Event Listener Not Cleaned Up

**Problem:** Attaching event listeners in `useEffect` without cleanup causes memory leaks and duplicate handlers.

```tsx
// ❌ Wrong — no cleanup
useEffect(() => {
  const el = keyboardRef.current;
  el?.addEventListener('bboard-key-press', handleKeyPress);
}, []);
```

**Solution:** Return a cleanup function from `useEffect`:

```tsx
// ✅ Correct — cleanup on unmount
useEffect(() => {
  const el = keyboardRef.current;
  if (!el) return;

  el.addEventListener('bboard-key-press', handleKeyPress);
  return () => el.removeEventListener('bboard-key-press', handleKeyPress);
}, [handleKeyPress]);
```

## 2. React Re-rendering Destroying Custom Element State

**Problem:** When a parent component re-renders with a new key, React destroys and recreates the custom element, losing its internal state (current layout, composition buffer).

```tsx
// ❌ Wrong — key changes on every render
<benin-keyboard key={Math.random()} language={lang} />
```

**Solution:** Use a stable key or no key at all:

```tsx
// ✅ Correct — stable identity
<benin-keyboard language={lang} />

// Or with a meaningful, stable key
<benin-keyboard key="main-keyboard" language={lang} />
```

## 3. Boolean Attribute Binding

**Problem:** React treats boolean attributes differently than the DOM. Setting `disabled={false}` still adds the attribute to the DOM.

```tsx
// ❌ May still add disabled="" to the DOM
<benin-keyboard disabled={false} />
```

**Solution:** Conditionally render the attribute:

```tsx
// ✅ Correct — attribute is absent when false
<benin-keyboard {...(isDisabled ? { disabled: true } : {})} />
```

## 4. SSR Hydration Mismatch

**Problem:** In Next.js or SSR environments, the server renders `<benin-keyboard>` as an unknown HTML element. On hydration, React may warn about mismatches.

```tsx
// ❌ Wrong — renders on server where customElements is undefined
export default function Page() {
  return <benin-keyboard language="yoruba" />;
}
```

**Solution:** Dynamically import and render only on the client:

```tsx
// ✅ Correct — client-only rendering
'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import('b-board');
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading keyboard...</div>;
  return <benin-keyboard language="yoruba" />;
}
```

## 5. Custom Events Not Forwarded by React

**Problem:** React's synthetic event system does not forward custom events like `bboard-key-press`. Using `onBboardKeyPress` in JSX only works in React 19+.

```tsx
// ❌ Wrong in React 18 — event handler is never called
<benin-keyboard onBboardKeyPress={(e) => console.log(e)} />
```

**Solution:** In React 18, use ref + addEventListener (see [integration guide](./react-integration.md#event-handling)):

```tsx
// ✅ Correct for React 18
const ref = useRef<HTMLElement>(null);

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const handler = (e: Event) => {
    const { char } = (e as CustomEvent).detail;
    setText((prev) => prev + char);
  };
  el.addEventListener('bboard-key-press', handler);
  return () => el.removeEventListener('bboard-key-press', handler);
}, []);

<benin-keyboard ref={ref} language="yoruba" />;
```

## 6. Handler Identity Causes Stale Closures

**Problem:** Creating event handlers inline without `useCallback` causes stale closure issues — the handler captures old state.

```tsx
// ❌ Wrong — handler captures stale `text` value
useEffect(() => {
  const handler = (e: Event) => {
    const { char } = (e as CustomEvent).detail;
    setText(text + char); // `text` is stale!
  };
  el.addEventListener('bboard-key-press', handler);
}, []); // Empty deps = never re-attaches
```

**Solution:** Use `useCallback` with functional state updates:

```tsx
// ✅ Correct — functional update doesn't need current state
const handleKeyPress = useCallback((e: Event) => {
  const { char } = (e as CustomEvent).detail;
  setText((prev) => prev + char); // Functional update = always current
}, []);
```
