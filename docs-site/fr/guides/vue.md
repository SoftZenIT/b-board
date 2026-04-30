---
title: Intégration Vue 3
---

# Intégration Vue 3

Ce guide couvre l'intégration de `<benin-keyboard>` dans une application Vue 3 avec la Composition API. Le clavier est un Web Component — une petite configuration suffit pour indiquer à Vue de le traiter comme un élément natif plutôt qu'un composant Vue.

## Installation

```bash
npm install b-board
```

## Configuration

### 1. Configurer Vite pour reconnaître l'élément personnalisé

Sans cette configuration, Vue génère l'avertissement `[Vue warn]: Failed to resolve component: benin-keyboard`.

Dans `vite.config.ts`, indiquez au compilateur de templates de Vue que `<benin-keyboard>` est un élément personnalisé :

```ts
// vite.config.ts
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

### 2. Enregistrer l'élément personnalisé

Importez `b-board` dans votre fichier d'entrée pour enregistrer l'élément avant le rendu de tout composant :

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'b-board';

createApp(App).mount('#app');
```

## Types TypeScript

Créez `src/bboard.d.ts` pour obtenir des liaisons d'attributs typées dans les templates Vue :

```ts
// src/bboard.d.ts
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
  floating?: boolean;
}

declare module 'vue' {
  interface GlobalComponents {
    'benin-keyboard': BeninKeyboardProps;
  }
}

export {};
```

## Utilisation de base

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  const { char } = (e as CustomEvent<{ char: string }>).detail;
  text.value += char;
}
</script>

<template>
  <textarea :value="text" readonly />
  <benin-keyboard language="yoruba" theme="auto" @bboard-key-press="onKeyPress" />
</template>
```

Vue 3 transmet les événements DOM personnalisés via `v-on` (ou le raccourci `@`) sans aucune configuration supplémentaire.

## Modèle de liaison `v-model`

`v-model` attend qu'un composant émette `update:modelValue`. Les Web Components ne suivent pas cette convention, donc `v-model` sur `<benin-keyboard>` ne fonctionnera pas. Maintenez plutôt votre propre ref réactive et mettez-la à jour manuellement :

```vue
<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');

function onKeyPress(e: Event) {
  text.value += (e as CustomEvent<{ char: string }>).detail.char;
}
</script>

<template>
  <!-- v-model sur le textarea fonctionne normalement -->
  <textarea v-model="text" />
  <!-- Écouter les événements bboard et mettre à jour text manuellement -->
  <benin-keyboard @bboard-key-press="onKeyPress" language="yoruba" />
</template>
```

## Changement de langue réactif

Utilisez une ref réactive pour l'attribut `language`. Les changements de la ref mettent automatiquement à jour l'attribut DOM :

```vue
<script setup lang="ts">
import { ref } from 'vue';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

const language = ref<LanguageId>('yoruba');
const theme = ref<'light' | 'dark' | 'auto'>('auto');
const text = ref('');

function onKeyPress(e: Event) {
  text.value += (e as CustomEvent<{ char: string }>).detail.char;
}
</script>

<template>
  <div class="controls">
    <button @click="language = 'yoruba'">Yoruba</button>
    <button @click="language = 'fon-adja'">Fon / Adja</button>
    <button @click="language = 'baatonum'">Baatɔnum</button>
    <button @click="language = 'dendi'">Dendi</button>
  </div>
  <textarea v-model="text" />
  <benin-keyboard
    :language="language"
    :theme="theme"
    layout-variant="desktop-azerty"
    @bboard-key-press="onKeyPress"
  />
</template>
```

> **Conseil :** Utilisez toujours `:language` (raccourci v-bind) plutôt que de définir l'attribut impérativement avec `el.setAttribute(...)`. Contourner la liaison réactive de Vue signifie que Vue ne suivra pas le changement et l'interface peut se désynchroniser.

## Afficher et masquer le clavier

Liez `open` à une ref réactive. Vue définit la propriété DOM directement avec `:open`, donc la valeur booléenne s'applique sans contournement :

```vue
<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(true);
const text = ref('');

function onKeyPress(e: Event) {
  text.value += (e as CustomEvent<{ char: string }>).detail.char;
}
</script>

<template>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? 'Masquer le clavier' : 'Afficher le clavier' }}
  </button>
  <textarea v-model="text" rows="4" />
  <benin-keyboard language="yoruba" theme="auto" :open="isOpen" @bboard-key-press="onKeyPress" />
</template>
```

## Mode flottant

Définissez `floating` pour détacher le clavier du flux du document. Il s'affiche en superposition fixe centrée en bas de la fenêtre avec une poignée de déplacement en haut. L'utilisateur peut le repositionner en le faisant glisser.

```vue
<script setup lang="ts">
import { ref } from 'vue';

const floating = ref(false);
const isOpen = ref(true);
</script>

<template>
  <label> <input v-model="floating" type="checkbox" /> Clavier flottant </label>
  <benin-keyboard language="yoruba" theme="auto" :open="isOpen" :floating="floating" />
</template>
```

> **Conseil :** Avec Vue, `:floating="false"` retire correctement l'attribut — contrairement à React, le motif d'étalement conditionnel n'est pas nécessaire ici.

## Tous les événements

| Événement                | Détail                                            | Description                  |
| ------------------------ | ------------------------------------------------- | ---------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Moteur de clavier initialisé |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | Une touche a été pressée     |
| `bboard-language-change` | `{ languageId: string }`                          | Langue active changée        |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Thème changé                 |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Une erreur s'est produite    |

## Propriétés CSS personnalisées

Personnalisez l'apparence du clavier avec des propriétés CSS personnalisées :

```vue
<template>
  <benin-keyboard
    language="yoruba"
    theme="dark"
    :style="{
      '--bboard-color-surface-base': '#1e1e1e',
      '--bboard-color-surface-key': '#2d2d2d',
      '--bboard-color-text-primary': '#ffffff',
    }"
  />
</template>
```

## Nuxt 3

Pour Nuxt 3, configurez le compilateur Vue dans `nuxt.config.ts` et importez le package dans un plugin client uniquement :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

```ts
// plugins/bboard.client.ts
import 'b-board';
export default defineNuxtPlugin(() => {});
```

Enveloppez le clavier dans `<ClientOnly>` pour éviter les erreurs SSR :

```vue
<template>
  <ClientOnly>
    <benin-keyboard language="yoruba" />
  </ClientOnly>
</template>
```

## Pièges courants

| Problème                                      | Cause                                                       | Solution                                                            |
| --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `Failed to resolve component: benin-keyboard` | Configuration `isCustomElement` manquante                   | L'ajouter dans `vite.config.ts`                                     |
| `v-model` sur le clavier ne fonctionne pas    | Les Web Components n'émettent pas `update:modelValue`       | Écouter `bboard-key-press` et mettre à jour une ref manuellement    |
| L'attribut de langue ne se met pas à jour     | Un appel direct à `setAttribute` contourne Vue              | Utiliser la liaison `:language` à la place                          |
| Le contenu des slots est ignoré               | `<benin-keyboard>` utilise le Shadow DOM                    | Utiliser les propriétés CSS personnalisées pour la personnalisation |
| Le HMR affiche un clavier obsolète            | `customElements.define()` ne peut pas être appelé deux fois | Effectuer un rechargement complet de la page (Cmd/Ctrl+Shift+R)     |

## Démonstration en direct

<StackBlitzEmbed framework="vue" />

## Exemple autonome

Un exemple fonctionnel complet est disponible dans [`examples/vue3-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/vue3-sample-app).
