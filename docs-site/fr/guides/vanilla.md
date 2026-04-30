---
title: Vanilla JS / TS
---

# Vanilla JS / TS

`<benin-keyboard>` fonctionne dans tout environnement qui prend en charge les Web Components — aucun framework requis. Ce guide montre comment l'utiliser avec du JavaScript ou TypeScript ordinaire, couvre l'insertion tenant compte de la position du curseur, et liste tous les événements disponibles.

## Installation

```bash
npm install b-board
```

## Import ESM

Enregistrez l'élément une seule fois au point d'entrée de votre application :

```ts
import 'b-board';
```

Après cet import, l'élément personnalisé `<benin-keyboard>` est défini et prêt à être utilisé n'importe où sur la page.

```html
<textarea id="output"></textarea>
<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

<script type="module">
  import 'b-board';

  const keyboard = document.querySelector('benin-keyboard');
  const output = document.getElementById('output');

  keyboard.addEventListener('bboard-key-press', (e) => {
    output.value += e.detail.char;
  });
</script>
```

## Utilisation via CDN / UMD

Si vous n'utilisez pas de bundler, vous pouvez charger b-board directement depuis un CDN :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Exemple b-board via CDN</title>
  </head>
  <body>
    <textarea id="output"></textarea>
    <benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

    <!-- Chargement depuis un CDN compatible ESM (ex. esm.sh ou unpkg) -->
    <script type="module">
      import 'https://esm.sh/b-board';

      const keyboard = document.querySelector('benin-keyboard');
      const output = document.getElementById('output');

      keyboard.addEventListener('bboard-key-press', (e) => {
        output.value += e.detail.char;
      });
    </script>
  </body>
</html>
```

## Déclaration de type TypeScript

TypeScript ne connaît pas les éléments personnalisés par défaut. Ajoutez une déclaration globale pour que `querySelector` et `getElementById` retournent le bon type :

```ts
// src/bboard.d.ts
type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardElement extends HTMLElement {
  language: LanguageId;
  theme: ThemeId;
  'layout-variant': 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode': 'transition' | 'hint';
  open: boolean;
  disabled: boolean;
  'show-physical-echo': boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboardElement;
  }
}
```

Avec cette déclaration, `document.querySelector('benin-keyboard')` retourne `BeninKeyboardElement | null`, vous donnant un accès typé à ses propriétés.

## Gestion de la position du curseur

Simplement ajouter à `textarea.value` perd la position du curseur. Utilisez l'API de plage de sélection pour insérer le caractère exactement là où se trouve le curseur :

```ts
import 'b-board';

const output = document.getElementById('output') as HTMLTextAreaElement;
const keyboard = document.getElementById('kb')!;

keyboard.addEventListener('bboard-key-press', (e) => {
  const { char } = (e as CustomEvent<{ char: string }>).detail;

  // Read current cursor / selection
  const start = output.selectionStart ?? output.value.length;
  const end = output.selectionEnd ?? output.value.length;

  // Replace selected text (or insert at cursor when start === end)
  output.value = output.value.slice(0, start) + char + output.value.slice(end);

  // Move cursor to just after the inserted character
  output.selectionStart = output.selectionEnd = start + char.length;

  // Keep focus on the text area
  output.focus();
});
```

Ce modèle :

- Remplace tout texte sélectionné par le nouveau caractère.
- Insère au niveau du curseur lorsque rien n'est sélectionné.
- Restaure le focus pour que les pressions suivantes atterrissent au bon endroit.

## Changement de langue et de thème

Définissez les attributs directement sur l'élément pour changer la langue active ou le thème à l'exécution :

```ts
const keyboard = document.querySelector('benin-keyboard')!;

// Switch language
keyboard.setAttribute('language', 'fon-adja');

// Switch theme
keyboard.setAttribute('theme', 'dark');

// Disable the keyboard
keyboard.setAttribute('disabled', '');

// Re-enable
keyboard.removeAttribute('disabled');
```

Exemple avec des contrôles `<select>` :

```html
<select id="lang-select">
  <option value="yoruba">Yoruba</option>
  <option value="fon-adja">Fon / Adja</option>
  <option value="baatonum">Baatɔnum</option>
  <option value="dendi">Dendi</option>
</select>
<select id="theme-select">
  <option value="auto">Auto</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
<benin-keyboard id="kb" language="yoruba" theme="auto"></benin-keyboard>
```

```ts
const keyboard = document.getElementById('kb')!;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;

langSelect.addEventListener('change', () => {
  keyboard.setAttribute('language', langSelect.value);
});

themeSelect.addEventListener('change', () => {
  keyboard.setAttribute('theme', themeSelect.value);
});
```

## Tous les événements

Écoutez n'importe quel événement avec `addEventListener`. Tous les événements se propagent et sont composés (ils traversent les frontières du Shadow DOM).

| Événement                | Détail                                                                            | Description                                                    |
| ------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                                                        | Moteur initialisé — lecture des propriétés du clavier possible |
| `bboard-key-press`       | `{ keyId: string, char: string }`                                                 | Une touche pressée ; `char` est le caractère composé           |
| `bboard-language-change` | `{ languageId: string }`                                                          | Langue active changée                                          |
| `bboard-theme-change`    | `{ theme: string, effectiveTheme: string }`                                       | Thème changé (`effectiveTheme` résout `'auto'`)                |
| `bboard-error`           | `{ code: string, severity: string, message: string, recoverySuggestion: string }` | Une erreur s'est produite                                      |

```ts
const keyboard = document.querySelector('benin-keyboard')!;

keyboard.addEventListener('bboard-ready', (e) => {
  console.log('Keyboard ready', (e as CustomEvent).detail.state);
});

keyboard.addEventListener('bboard-language-change', (e) => {
  console.log('Language changed to', (e as CustomEvent).detail.languageId);
});

keyboard.addEventListener('bboard-error', (e) => {
  const { code, message, recoverySuggestion } = (e as CustomEvent).detail;
  console.error(`[${code}] ${message}. ${recoverySuggestion}`);
});
```

## Propriétés CSS personnalisées

Personnalisez l'apparence visuelle du clavier avec des propriétés CSS personnalisées :

```css
benin-keyboard {
  --bboard-color-surface-base: #f5f5f5;
  --bboard-color-surface-key: #ffffff;
  --bboard-color-text-primary: #1a1a1a;
}
```

Ou en ligne via JavaScript :

```ts
const keyboard = document.querySelector('benin-keyboard') as HTMLElement;
keyboard.style.setProperty('--bboard-color-surface-base', '#1e1e1e');
```

## Démonstration en direct

<StackBlitzEmbed framework="vanilla" />

## Exemple autonome

Un exemple fonctionnel complet est disponible dans [`examples/vanilla/`](https://github.com/b-board/b-board/tree/main/examples/vanilla).
