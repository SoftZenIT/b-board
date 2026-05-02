---
title: Exemples
---

# Exemples

Exemples interactifs pour tous les frameworks pris en charge. Chaque intégration est un projet entièrement fonctionnel — vous pouvez modifier le code en direct dans le navigateur.

---

## React

<StackBlitzEmbed framework="react" :height="560" />

Une version autonome de cette application est disponible dans [`examples/react-sample-app/`](https://github.com/SoftZenIT/b-board/tree/main/examples/react-sample-app).

---

## Vue

<StackBlitzEmbed framework="vue" :height="560" />

Une version autonome de cette application est disponible dans [`examples/vue3-sample-app/`](https://github.com/SoftZenIT/b-board/tree/main/examples/vue3-sample-app).

---

## Angular

<StackBlitzEmbed framework="angular" :height="560" />

Une version autonome de cette application est disponible dans [`examples/angular-sample-app/`](https://github.com/SoftZenIT/b-board/tree/main/examples/angular-sample-app).

---

## Vanilla JS

<StackBlitzEmbed framework="vanilla" :height="520" />

Une version autonome de cette application est disponible dans [`examples/vanilla-sample-app/`](https://github.com/SoftZenIT/b-board/tree/main/examples/theming).

---

## Extraits de code

### Configuration CDN minimale

La façon la plus rapide d'ajouter b-board à n'importe quelle page HTML sans étape de build :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>b-board CDN demo</title>
  </head>
  <body>
    <input id="my-input" type="text" placeholder="Tapez ici…" />
    <benin-keyboard language="yoruba" target="#my-input"></benin-keyboard>

    <script type="module" src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.es.js"></script>
  </body>
</html>
```

Pour les environnements qui nécessitent un bundle UMD (scripts legacy, pas de support `type="module"`) :

```html
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>
```

---

### Changement de langue à l'exécution

Changez la langue active en mettant à jour l'attribut `language` :

```js
import 'b-board';

const keyboard = document.querySelector('benin-keyboard');

document.querySelector('#lang-select').addEventListener('change', (event) => {
  keyboard.setAttribute('language', event.target.value);
});
```

```html
<select id="lang-select">
  <option value="yoruba">Yorùbá</option>
  <option value="fon-adja">Fon / Adjà</option>
  <option value="baatonum">Baatɔnum</option>
  <option value="dendi">Dendi</option>
</select>

<benin-keyboard language="yoruba"></benin-keyboard>
```

---

### Changement de thème à l'exécution

Basculez entre les thèmes clair, sombre et système en mettant à jour l'attribut `theme` :

```js
import 'b-board';

const keyboard = document.querySelector('benin-keyboard');

document.querySelector('#theme-select').addEventListener('change', (event) => {
  keyboard.setAttribute('theme', event.target.value);
});
```

```html
<select id="theme-select">
  <option value="auto">Auto (système)</option>
  <option value="light">Clair</option>
  <option value="dark">Sombre</option>
</select>

<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>
```

La valeur `auto` reflète la préférence `prefers-color-scheme` au niveau du système et se met à jour automatiquement lorsque l'utilisateur change son thème système.
