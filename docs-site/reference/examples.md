---
title: Examples
---

# Examples

Interactive examples for every supported framework. Each embed is a fully runnable project — you can edit the code live in the browser.

---

## React

<StackBlitzEmbed framework="react" :height="560" />

A standalone version of this app is available at [`examples/react-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/react-sample-app).

---

## Vue

<StackBlitzEmbed framework="vue" :height="560" />

A standalone version of this app is available at [`examples/vue3-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/vue3-sample-app).

---

## Angular

<StackBlitzEmbed framework="angular" :height="560" />

A standalone version of this app is available at [`examples/angular-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/angular-sample-app).

---

## Vanilla JS

<StackBlitzEmbed framework="vanilla" :height="520" />

A standalone version of this app is available at [`examples/vanilla-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/vanilla-sample-app).

---

## Code Snippets

### Minimal CDN Setup

The quickest way to add b-board to any HTML page without a build step:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>b-board CDN demo</title>
  </head>
  <body>
    <input id="my-input" type="text" placeholder="Type here…" />
    <benin-keyboard language="yoruba" target="#my-input"></benin-keyboard>

    <script type="module" src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.es.js"></script>
  </body>
</html>
```

For environments that require a UMD bundle (legacy scripts, no `type="module"` support):

```html
<script src="https://cdn.jsdelivr.net/npm/b-board/dist/bboard.umd.js"></script>
```

---

### Language Switching at Runtime

Switch the active language by updating the `language` attribute:

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

### Theme Switching at Runtime

Switch between light, dark, and system themes by updating the `theme` attribute:

```js
import 'b-board';

const keyboard = document.querySelector('benin-keyboard');

document.querySelector('#theme-select').addEventListener('change', (event) => {
  keyboard.setAttribute('theme', event.target.value);
});
```

```html
<select id="theme-select">
  <option value="auto">Auto (system)</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

<benin-keyboard language="yoruba" theme="auto"></benin-keyboard>
```

The `auto` value mirrors the OS-level `prefers-color-scheme` preference and updates automatically when the user changes their system theme.
