# B-Board Theming Guide

B-Board features a robust, CSS-variable-based theming system that supports light mode, dark mode, and automatic system detection.

## Theme Modes

The keyboard supports three theme modes:

1.  **`light`**: Forces the light theme.
2.  **`dark`**: Forces the dark theme (adds `.theme-dark` class to the element).
3.  **`auto`** (Default): Automatically switches between light and dark based on the user's system preferences (`prefers-color-scheme`).

## Programmatic API

You can control the theme via the `<benin-keyboard>` custom element API.

### Properties

```typescript
const keyboard = document.querySelector('benin-keyboard');

// Set the theme
keyboard.theme = 'dark';

// Get the current theme mode
console.log(keyboard.theme); // 'dark'
```

### Methods

```typescript
// Set the theme via method
keyboard.setTheme('auto');
```

### Events

The element emits a `bboard-theme-change` event whenever the mode or the effective theme changes.

```typescript
keyboard.addEventListener('bboard-theme-change', (event) => {
  const { theme, effectiveTheme } = event.detail;
  console.log(`Mode: ${theme}, Active: ${effectiveTheme}`);
});
```

## CSS Customization

B-Board themes are powered by CSS Design Tokens. You can override these tokens at the `:root` level or on the element itself.

```css
/* Custom primary color for the whole application */
:root {
  --bboard-color-primary-base: #ff5722;
}

/* Custom surface for a specific keyboard instance */
benin-keyboard {
  --bboard-color-surface-base: #f0f0f0;
}
```

For a full list of available tokens, see the [Token Reference](./TOKEN_REFERENCE.md).

## Framework Integration

### React

```tsx
import React, { useEffect, useRef } from 'react';
import '@google/b-board';

export const Keyboard = () => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    const handler = (e: any) => console.log('Theme changed', e.detail);
    el?.addEventListener('bboard-theme-change', handler);
    return () => el?.removeEventListener('bboard-theme-change', handler);
  }, []);

  return <benin-keyboard ref={ref} theme="auto" />;
};
```

### Vue

```vue
<template>
  <benin-keyboard :theme="myTheme" @bboard-theme-change="onThemeChange" />
</template>

<script setup>
import { ref } from 'vue';
import '@google/b-board';

const myTheme = ref('auto');
const onThemeChange = (event) => {
  console.log('New effective theme:', event.detail.effectiveTheme);
};
</script>
```

## Custom Theme Creation

You can create a completely custom theme by overriding the design tokens in a
scoped CSS class.

```css
.theme-ocean {
  --bboard-color-surface-base: #e0f7fa;
  --bboard-color-surface-key: #ffffff;
  --bboard-color-primary-base: #00796b;
  --bboard-color-text-primary: #004d40;
}
```

Then apply it to the element:

```html
<benin-keyboard class="theme-ocean" theme="light"></benin-keyboard>
```

## Troubleshooting

### Theme not applying?

1. Ensure `tokens.css` is imported in your application.
2. Check if you have an explicit `theme="dark"` or `theme="light"` attribute
   overriding the system preference.
3. Verify that the `.theme-dark` class is present on the `<benin-keyboard>`
   element when in dark mode.

### Specific key colors not changing?

Some keys might have higher specificity or specific tokens. Ensure you are
overriding the correct semantic token (e.g., `--bboard-color-surface-special`
for modifier keys).

## Auto-Detection Behavior

When in `auto` mode, B-Board uses the `window.matchMedia` API to listen for system theme changes.
The switching is instantaneous and does not require a page reload.
The CSS variables respond directly via `@media (prefers-color-scheme: dark)` in `tokens.css`.
