---
title: Démarrage rapide
---

# Démarrage rapide

b-board est un clavier virtuel framework-agnostic pour les langues africaines du Bénin. Il se présente sous la forme d'un Web Component (`<benin-keyboard>`) qui fonctionne avec n'importe quel framework JavaScript ou du HTML ordinaire.

## Installation

```bash
npm install b-board
```

## Démarrage rapide

### 1. Enregistrer l'élément personnalisé

```ts
import 'b-board';
```

### 2. Ajouter le clavier dans votre HTML

```html
<input id="my-input" type="text" /> <benin-keyboard language="yoruba" theme="auto"></benin-keyboard>
```

### 3. Écouter les pressions de touches

```ts
const keyboard = document.querySelector('benin-keyboard');
keyboard.addEventListener('bboard-key-press', (e) => {
  console.log(e.detail.char); // le caractère inséré
});
```

## Configuration

| Attribut                | Type                  | Défaut             | Description                                |
| ----------------------- | --------------------- | ------------------ | ------------------------------------------ |
| `language`              | `LanguageId`          | `'yoruba'`         | Profil de langue actif                     |
| `theme`                 | `ThemeId`             | `'auto'`           | Thème de couleur (`light`, `dark`, `auto`) |
| `layout-variant`        | `LayoutVariantId`     | `'desktop-azerty'` | Disposition du clavier                     |
| `modifier-display-mode` | `ModifierDisplayMode` | `'transition'`     | Animation des touches modificatrices       |
| `open`                  | `boolean`             | `true`             | Indique si le clavier est visible          |
| `disabled`              | `boolean`             | `false`            | Désactive toute interaction                |
| `show-physical-echo`    | `boolean`             | `false`            | Affiche les pressions physiques à l'écran  |

## Langues prises en charge

| Identifiant de langue | Langue     |
| --------------------- | ---------- |
| `yoruba`              | Yoruba     |
| `fon-adja`            | Fon / Adja |
| `baatonum`            | Baatɔnum   |
| `dendi`               | Dendi      |

## Événements

| Événement                | Détail                                            | Description               |
| ------------------------ | ------------------------------------------------- | ------------------------- |
| `bboard-ready`           | `{ state }`                                       | Moteur initialisé         |
| `bboard-key-press`       | `{ keyId, char }`                                 | Une touche a été pressée  |
| `bboard-language-change` | `{ languageId }`                                  | Langue changée            |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Thème changé              |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Une erreur s'est produite |

## Guides par framework

- [React](/fr/guides/react)
- [Vue 3](/fr/guides/vue)
- [Angular](/fr/guides/angular)
- [Vanilla JS/TS](/fr/guides/vanilla)

## Prochaines étapes

- [Référence API](/api/) — référence complète générée par TypeDoc
- [Personnalisation des langues](/guides/language-customization) — ajouter votre propre langue
- [Dépannage](/reference/troubleshooting) — problèmes courants et solutions
