---
title: Démarrage rapide
---

# Démarrage rapide

b-board est un clavier virtuel framework-agnostic pour les langues africaines du Bénin. Il se présente sous la forme d'un Web Component (`<benin-keyboard>`) qui fonctionne avec n'importe quel framework JavaScript ou du HTML ordinaire.

## Installation

```bash
npm install b-board
```

### Configuration via CDN (sans outil de build)

Pour utiliser `b-board` sans étape de build, chargez le bundle UMD directement depuis jsDelivr :

```html
<!-- Épingler à une version spécifique (recommandé en production) -->
<script src="https://cdn.jsdelivr.net/npm/b-board@0.1.0/dist/bboard.umd.js"></script>

<!-- Ou toujours charger la dernière version (pratique pour les prototypes) -->
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>

<!-- Puis utiliser l'élément directement -->
<benin-keyboard language="yoruba" theme="auto" open></benin-keyboard>
```

Aucun `import` ni bundler nécessaire. L'élément personnalisé s'enregistre automatiquement au chargement du script.

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

| Attribut                | Type                  | Défaut             | Description                                                                 |
| ----------------------- | --------------------- | ------------------ | --------------------------------------------------------------------------- |
| `language`              | `LanguageId`          | `'yoruba'`         | Profil de langue actif                                                      |
| `theme`                 | `ThemeId`             | `'auto'`           | Thème de couleur (`light`, `dark`, `auto`)                                  |
| `layout-variant`        | `LayoutVariantId`     | `'desktop-azerty'` | Disposition du clavier                                                      |
| `modifier-display-mode` | `ModifierDisplayMode` | `'transition'`     | Animation des touches modificatrices (`transition` ou `hint`)               |
| `open`                  | `boolean`             | `true`             | Afficher ou masquer le clavier ; mettre à `false` pour le replier           |
| `disabled`              | `boolean`             | `false`            | Désactive toute interaction                                                 |
| `show-physical-echo`    | `boolean`             | `false`            | Met en surbrillance la touche virtuelle correspondant à une touche physique |
| `floating`              | `boolean`             | `false`            | Détache le clavier en superposition fixe ; déplaçable via sa poignée        |

### Afficher et masquer le clavier

L'attribut `open` contrôle la visibilité. Retirer cet attribut (ou le mettre à `false`) replie le clavier tout en le conservant dans le DOM — l'état, la langue et le thème sont préservés.

```html
<!-- Replié au chargement de la page -->
<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>

<button id="toggle">Afficher le clavier</button>
```

```ts
const kb = document.querySelector('benin-keyboard')!;
const btn = document.getElementById('toggle')!;

btn.addEventListener('click', () => {
  if (kb.hasAttribute('open')) {
    kb.removeAttribute('open');
    btn.textContent = 'Afficher le clavier';
  } else {
    kb.setAttribute('open', '');
    btn.textContent = 'Masquer le clavier';
  }
});
```

### Mode flottant

Lorsque `floating` est défini, le clavier se détache du flux du document et s'affiche en superposition fixe centré en bas de la fenêtre. Une poignée de déplacement apparaît en haut — l'utilisateur peut repositionner le clavier n'importe où sur l'écran en le faisant glisser.

```html
<benin-keyboard language="yoruba" theme="auto" open floating></benin-keyboard>
```

Retirer `floating` ramène le clavier à sa position en ligne par défaut.

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
