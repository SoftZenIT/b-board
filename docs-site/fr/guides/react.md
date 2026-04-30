---
title: Intégration React
---

# Intégration React

Ce guide couvre l'intégration de `<benin-keyboard>` dans une application React. Le clavier est un Web Component, ce qui implique quelques considérations spécifiques à React — notamment pour la gestion des événements et les types TypeScript.

## Installation

```bash
npm install b-board
```

## Configuration

Importez le package dans votre fichier d'entrée pour enregistrer l'élément personnalisé :

```tsx
// main.tsx
import 'b-board';
```

## Déclaration de types TypeScript

React ne reconnaît pas automatiquement les éléments personnalisés. Créez un fichier `src/bboard.d.ts` pour ajouter la prise en charge des types JSX :

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

## Utilisation de base

```tsx
import 'b-board';

export default function App() {
  return (
    <div>
      <h1>Mon application</h1>
      <benin-keyboard language="yoruba" theme="auto" />
    </div>
  );
}
```

## Gestion des événements

### Pourquoi `addEventListener` plutôt que les props d'événement JSX ?

Le système d'événements synthétiques de React 18 ne transmet pas les événements personnalisés émis par les Web Components. Utiliser `onBboardKeyPress` comme prop JSX ne fera rien silencieusement dans React 18.

La bonne approche consiste à attacher un écouteur DOM natif via un `ref` et `useEffect` :

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

> **Remarque :** Utilisez toujours des mises à jour d'état fonctionnelles (`prev => prev + char`) lorsque vous mettez à jour l'état dans des gestionnaires d'événements. Cela évite les bugs de fermeture obsolète où le gestionnaire capture une valeur périmée de `text`.

> **Remarque :** Retournez toujours une fonction de nettoyage depuis `useEffect` pour supprimer l'écouteur au démontage. Oublier le nettoyage provoque des gestionnaires en double et des fuites mémoire si le composant est remonté.

### React 19+

React 19 ajoute la prise en charge native des événements d'éléments personnalisés. Vous pouvez utiliser le nom d'événement en camelCase directement dans JSX :

```tsx
<benin-keyboard
  language="yoruba"
  onBboardKeyPress={(e) => setText((prev) => prev + e.detail.char)}
/>
```

## Modèle d'entrée contrôlée

Pour insérer des caractères à la position du curseur (plutôt que toujours en fin de texte), utilisez un `ref` sur le textarea et l'API de plage de sélection :

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

## Changement de langue

Changez la langue active en mettant à jour l'attribut `language` :

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

## Liaison d'attributs booléens

La gestion des attributs booléens par React sur les éléments personnalisés peut être surprenante. Définir `disabled={false}` peut quand même ajouter l'attribut au DOM. Utilisez un étalement conditionnel pour éviter cela :

```tsx
// Peut quand même ajouter disabled="" au DOM :
<benin-keyboard disabled={false} />

// Correct — l'attribut est absent quand false :
<benin-keyboard {...(isDisabled ? { disabled: true } : {})} />
```

## SSR / Next.js

Les éléments personnalisés nécessitent un environnement navigateur. Dans Next.js, ajoutez la directive `'use client'` et différez l'import :

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function KeyboardWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import('b-board');
    setMounted(true);
  }, []);

  if (!mounted) return <div>Chargement du clavier…</div>;

  return <benin-keyboard language="yoruba" />;
}
```

## Pièges courants

| Problème                                | Cause                                                 | Solution                                                  |
| --------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Les événements ne se déclenchent jamais | React 18 ne transmet pas les événements personnalisés | Utilisez `ref` + `addEventListener`                       |
| Événements en double                    | Nettoyage manquant dans `useEffect`                   | Retournez toujours une fonction de nettoyage              |
| État obsolète dans le gestionnaire      | Gestionnaire en ligne avec fermeture obsolète         | Utilisez `useCallback` + mise à jour d'état fonctionnelle |
| Le clavier perd son état au re-rendu    | Prop `key` instable                                   | Utilisez une `key` stable ou absente                      |
| `disabled={false}` désactive quand même | Booléens React sur les éléments personnalisés         | Utilisez l'étalement conditionnel d'attributs             |
| Incompatibilité d'hydratation SSR       | Le serveur ne connaît pas les éléments personnalisés  | Utilisez `'use client'` + import différé                  |

## Démonstration en direct

<StackBlitzEmbed framework="react" />

## Exemple autonome

Un exemple fonctionnel complet est disponible dans [`examples/react-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/react-sample-app).
