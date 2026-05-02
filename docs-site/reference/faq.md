# Frequently Asked Questions

## Does b-board work without a framework?

Yes. b-board is a Web Component built with Lit. It works in any environment that supports the Custom Elements API — plain HTML, Vanilla JavaScript, and TypeScript projects all work with no framework required:

```html
<script type="module" src="/node_modules/b-board/dist/bboard.es.js"></script>
<benin-keyboard language="yoruba"></benin-keyboard>
```

Framework adapters (React, Vue, Angular) provide convenience helpers but are not required for core functionality.

---

## Which languages are supported?

b-board currently supports four Beninese languages:

| Language ID | English Name | Native Name     |
| ----------- | ------------ | --------------- |
| `yoruba`    | Yoruba       | Yorùbá          |
| `fon-adja`  | Fon/Adja     | Fɔngbè / Ajagbe |
| `baatonum`  | Baatɔnum     | Baatɔnum        |
| `dendi`     | Dendi        | Dendi           |

You can add your own language profile without forking the project. See [Adding a new language](../guides/language-customization.md#step-by-step-adding-a-new-language).

---

## Why are Fon and Adja combined into a single language profile?

Fon (Fɔngbè) and Adja (Ajagbe) are both Gbe languages in the Niger-Congo family. Historically the Fon people descended from Adja migrants who founded the Dahomey kingdom, and linguistically the two languages have developed in lockstep: they share an identical consonant inventory (ɖ, ɣ, ʋ, gb, kp), the same vowel inventory (ɛ, ɔ), the same nasal vowel system (ã, ẽ, ɛ̃, ĩ, õ, ɔ̃, ũ), and the same tonal system with identical orthographic conventions established by Beninese linguistic authorities.

Because there is no keyboard-level difference between the two languages — every character, tone mark, and composition rule is shared — a single profile (`fon-adja`) serves both perfectly. Splitting them would produce two identical profiles with no practical benefit for keyboard users.

They are distinct languages (not dialects), and this grouping does not imply that they are the same. If you need to distinguish them at the application level, you can inspect or override the profile; the keyboard itself is agnostic about which of the two the user is typing.

---

## How do I hide or show the keyboard?

Toggle the `open` attribute. When `open` is absent the keyboard collapses; when it is present the keyboard is visible. The element stays in the DOM either way, so language, theme, and composition state are preserved across show/hide cycles.

```ts
const keyboard = document.querySelector('benin-keyboard')!;

// Hide
keyboard.removeAttribute('open');

// Show
keyboard.setAttribute('open', '');
```

In React use conditional spreading to avoid `open="false"` being written as a string:

```tsx
<benin-keyboard language="yoruba" {...(isOpen ? { open: true } : {})} />
```

In Vue and Angular the framework handles booleans correctly via `:open="isOpen"` and `[attr.open]="isOpen ? '' : null"` respectively.

---

## How do I make the keyboard float over the page content?

Set the `floating` attribute. The keyboard detaches from the document flow and renders as a fixed overlay centered at the bottom of the viewport. A drag handle appears at the top — the user can drag it anywhere on screen.

```html
<benin-keyboard language="yoruba" theme="auto" open floating></benin-keyboard>
```

Remove `floating` to return the keyboard to its normal inline position; any drag offset is reset automatically.

> **Accessibility note:** In floating mode, ensure the keyboard is not the only way to interact with your application. Users with assistive technologies may find a fixed overlay disorienting if there is no way to dismiss it.

---

## Can I use b-board in a mobile app?

b-board is a DOM-based web component, so it runs wherever a full browser engine is available.

| Platform         | Supported | Notes                                                                                                                       |
| ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| React Native     | No        | React Native uses a JavaScript bridge to native views, not a DOM. The web component cannot render there.                    |
| Ionic            | Yes       | Ionic runs inside a WebView (Capacitor or Cordova). Import b-board as you would in any web app.                             |
| Capacitor        | Yes       | Use b-board in the web layer of your Capacitor app exactly as you would in a browser.                                       |
| React Native Web | Partial   | If your app renders to a real DOM (e.g. via `react-native-web`), b-board can work — but this is not a tested configuration. |

---

## Is it free?

Yes. b-board is open source and released under the MIT licence. You may use it in personal, commercial, and non-profit projects at no cost. Attribution is appreciated but not required.

---

## How does tone mark composition work?

b-board uses a **dead key sequence** model. When you press a tone modifier key (e.g. the acute accent ´), the engine enters an armed state — no character is inserted yet. When you press the next key, the engine looks up a `CompositionRule` matching the trigger and the base character. If a rule exists, the composed character (e.g. `á`) is inserted. If no rule matches, the trigger character and the base character are inserted separately.

Example for Yoruba:

1. Press ´ → engine armed (no output)
2. Press e → engine finds `{ trigger: "´", base: "e", result: "é" }` → inserts `é`

Pressing Escape while the engine is armed cancels the sequence without inserting anything.

See the [Composition Engine section](../guides/language-customization.md#how-the-composition-engine-works) for a deeper explanation.

---

## Can I add my own language?

Yes. Language profiles are JSON files — no TypeScript changes required for the data itself. You need to:

1. Add your language ID to the `LANGUAGE_IDS` tuple in `src/public/types.ts`
2. Create `data/languages/<id>.json` following the `LanguageProfile` schema
3. Register it in `data/registry.json`
4. Run `npm run validate:data` to confirm correctness

Full instructions are in the [Language Customization Guide](../guides/language-customization.md).

---

## Does b-board support RTL scripts?

Not currently. The keyboard layout engine is designed for left-to-right orthographies. All four supported Beninese languages use Latin-script LTR writing systems. RTL support is not on the current roadmap, but contributions are welcome.

---

## Can I use a custom layout?

The layout shape (key positions, row heights, slot widths) is defined by `LayoutShape` JSON files in `data/layouts/`. You can create a custom layout by:

1. Adding a `LayoutVariantId` to `src/public/types.ts`
2. Creating `data/layouts/<id>.json` following the `LayoutShape` schema
3. Registering it in `data/registry.json`
4. Passing your variant ID via the `layout-variant` attribute

```html
<benin-keyboard language="yoruba" layout-variant="my-custom-layout"></benin-keyboard>
```

See `docs/DATA_SCHEMA.md` for the full `LayoutShape` field reference.

---

## Does it work offline?

b-board fetches language profile and layout JSON at runtime. This means an initial network request is required the first time a language is loaded. After that:

- If you have a service worker that caches the data files, subsequent loads work offline
- If you bundle and serve the data files yourself (e.g. by copying `data/` to your web root), the keyboard works without any external network access

There is no built-in service worker — offline caching is the responsibility of the host application.

---

## What browsers are supported?

b-board targets browsers that support the Custom Elements v1 specification and the CSS Shadow Parts specification. In practice this means:

| Browser          | Minimum version |
| ---------------- | --------------- |
| Chrome / Edge    | 67+             |
| Firefox          | 63+             |
| Safari           | 10.1+           |
| iOS Safari       | 10.3+           |
| Samsung Internet | 6.0+            |

Internet Explorer is not supported.

---

## What Node.js version is required?

**Node.js 20 or later** is required for development (building the library, running tests, and building the docs site). The compiled output (`dist/bboard.es.js` and `dist/bboard.umd.js`) can be consumed in any environment that supports ES2020 — no Node.js requirement for end users.
