# Vue 3 Integration Guide

This guide shows how to integrate `<benin-keyboard>` into a Vue 3 application using the Composition API.

## Installation

```bash
npm install b-board
```

## Setup

### 1. Configure Vite to recognize the custom element

In `vite.config.ts`, tell Vue's template compiler to treat `<benin-keyboard>` as a native custom element:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'benin-keyboard',
        },
      },
    }),
  ],
});
```

### 2. Import the package

Register the custom element in your entry file:

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'b-board';

createApp(App).mount('#app');
```

## Type Declarations

Create `bboard.d.ts` in your `src/` directory:

```ts
type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardProps {
  language?: LanguageId;
  theme?: ThemeId;
  'layout-variant'?: 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode'?: 'transition' | 'hint';
  open?: boolean;
  disabled?: boolean;
  'show-physical-echo'?: boolean;
}

declare module 'vue' {
  interface GlobalComponents {
    'benin-keyboard': BeninKeyboardProps;
  }
}

export {};
```

## Event Handling

Vue 3 supports custom element events via `v-on` (or `@` shorthand):

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  const { char } = (e as CustomEvent).detail;
  text.value += char;
}
</script>

<template>
  <textarea v-model="text" />
  <benin-keyboard language="yoruba" @bboard-key-press="onKeyPress" />
</template>
```

## Property Binding

Use `v-bind` (or `:` shorthand) to bind attributes reactively:

```vue
<script setup lang="ts">
import { ref } from 'vue';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
const language = ref<LanguageId>('yoruba');
const theme = ref<'light' | 'dark'>('light');
</script>

<template>
  <benin-keyboard :language="language" :theme="theme" layout-variant="desktop-azerty" />
</template>
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

The keyboard handles tone and nasal modifiers internally. Composed characters are emitted directly:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  const { char } = (e as CustomEvent).detail;
  // char is already the composed character (e.g., 'é' not 'e' + '´')
  text.value += char;
}
</script>

<template>
  <benin-keyboard @bboard-key-press="onKeyPress" />
</template>
```

## Theming

Apply CSS custom properties via inline styles or a class:

```vue
<template>
  <benin-keyboard
    language="yoruba"
    theme="dark"
    :style="{
      '--bboard-color-surface-base': '#1e1e1e',
      '--bboard-color-surface-key': '#2d2d2d',
    }"
  />
</template>
```

## Nuxt Considerations

In Nuxt 3, configure the Vue compiler in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

Import `b-board` in a client-only plugin:

```ts
// plugins/bboard.client.ts
import 'b-board';
export default defineNuxtPlugin(() => {});
```

Wrap the keyboard in `<ClientOnly>`:

```vue
<template>
  <ClientOnly>
    <benin-keyboard language="yoruba" />
  </ClientOnly>
</template>
```

## Full Example

See [`examples/vue3-sample-app/`](../../examples/vue3-sample-app/) for a complete working example.
