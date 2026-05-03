# Mobile Keyboard Visual Redesign & VirtualKeyboard API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mobile keyboard so it looks and behaves like a real mobile keyboard — fixed to the bottom of the screen, full-width, with a Gboard-inspired visual style, a restructured 4-row layout (no AltGr), and proper OS keyboard suppression via the VirtualKeyboard API.

**Architecture:** CSS changes on the `benin-keyboard` element in mobile mode (position:fixed), a redesigned `mobile-default.json` layout, updated CSS tokens, and `virtualkeyboardpolicy="manual"` with `navigator.virtualKeyboard.overlaysContent = true` in `attach()`/`detach()`.

**Tech Stack:** Lit, TypeScript, CSS custom properties, VirtualKeyboard API (Chrome 94+), `inputmode="none"` fallback.

**Branch:** `fix/bboard-special-keys` (current branch)

---

## Design Decisions

### 1. Positioning — Self-managed fixed position

`benin-keyboard` applies `position: fixed; bottom: 0; left: 0; right: 0` automatically when in mobile mode (`layout-variant="mobile-default"`). The host app drops in the element and does nothing else. Safe-area insets (`env(safe-area-inset-*)`) are handled inside the component.

### 2. OS Keyboard Suppression — VirtualKeyboard API with fallback

On `attach(target)`:

1. If `'virtualKeyboard' in navigator`: set `target.setAttribute('virtualkeyboardpolicy', 'manual')` and `navigator.virtualKeyboard.overlaysContent = true`.
2. Else: set `target.setAttribute('inputmode', 'none')` (existing behaviour).

On `detach()`: restore the original `virtualkeyboardpolicy` / `inputmode` attribute value (or remove if absent), set `navigator.virtualKeyboard.overlaysContent = false` if API was used.

### 3. Visual Style — Gboard-inspired with lavender theme

- **Keyboard background:** `#ede7f6` (lavender purple)
- **Character key background:** `#ffffff`
- **Action key background:** `#d1c4e9` (purple-tinted)
- **Key border-radius:** `12px`
- **Key label color:** `#1a1a2e`
- **Long-press dot color:** `#b39ddb`
- **Number hint color:** `#b39ddb` (top-right corner of row 1 keys)
- All values exposed as CSS custom properties so host apps can override.
- No box-shadow — flat style (color differentiation only, no depth).

### 4. Layout — 4 rows, no AltGr, Ẹ in row 3, Ọ in bottom row

```
Row 1 (full width):  A  Z  E  R  T  Y  U  I  O  P      (10 equal keys, number hints)
Row 2 (full width):  Q  S  D  F  G  H  J  K  L  M      (10 equal keys)
Row 3 (inset 2px):   ⇧  W  X  C  V  B  N  Ẹ  ⌫         (shift×1.5 + 7 chars + backspace×1.5)
Row 4 (centered):         Ọ  [  Yoruba  ]  ⏎             (compact, not full width)
```

**Key changes from previous layout:**

- `key-altgr` removed entirely — desktop concept, not needed on mobile.
- `key-o-dot` (Ọ/ɔ) moves from the old action row to **row 4 left** as a character key.
- `key-e-dot` (Ẹ/ɛ) stays in row 3 position 8 (replacing apostrophe slot).
- Row 4 is compact and centered (fixed-width keys, not stretched to fill the viewport).
- Space bar shows the active language name (e.g. "Yoruba", "Fon").
- Shift uses an upward-arrow SVG icon; Backspace uses a left-arrow-with-X SVG icon; Enter uses a return-arrow SVG icon.

**Long-press coverage (no AltGr needed):**

- Yoruba: ọ accessible via long-press on O; ẹ accessible via long-press on E and on Ẹ key.
- Fon/Adja: ɛ = key-e-dot; ɔ = key-o-dot — dedicated keys in rows 3 and 4.
- Dendi: same as Fon.
- Baatonum: same pattern.

### 5. Row 4 width — compact and centered (zty.pe inspiration)

Row 4 does not stretch to full viewport width. It uses fixed-width keys centered horizontally:

- Ọ: `72px`
- Space bar: `160px` (shows language name)
- Enter: `72px`
- Gap between keys: `10px`
- Total: `314px` — leaves breathing room on both sides on a 390px viewport.

---

## Scope

### In scope

- `data/layouts/mobile-default.json` — restructure rows (remove AltGr, move Ọ to row 4, add Ẹ to row 3)
- `src/element/benin-keyboard.ts` — apply `position:fixed` styles in mobile mode, upgrade `attach()`/`detach()` to use VirtualKeyboard API
- `src/theme/tokens.css` — add/update mobile CSS tokens (colors, border-radius)
- Mobile key/row CSS — update `.bboard-mobile-keyboard`, `.bboard-mobile-key`, `.bboard-mobile-row` styles
- `examples/vue3-sample-app/src/App.vue` — already fixed (mobile detection for initial layoutVariant)

### Out of scope

- Shift layer layout (update separately if needed — mirrors base layer structure)
- Number/symbol toggle row (?123) — not in this release
- Dark mode variant for mobile — existing `theme-dark` tokens apply

---

## Affected Files

| File                                     | Change                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| `data/layouts/mobile-default.json`       | Restructure base + shift layers                          |
| `src/element/benin-keyboard.ts`          | Fixed positioning + VirtualKeyboard API in attach/detach |
| `src/theme/tokens.css`                   | New mobile color tokens, border-radius token             |
| `src/element/benin-keyboard.ts` (styles) | `.bboard-mobile-keyboard` → position:fixed               |
| `examples/vue3-sample-app/src/App.vue`   | Already done                                             |

---

## CSS Tokens (new / updated)

```css
/* Mobile keyboard shell */
--bboard-mobile-bg: #ede7f6;
--bboard-mobile-key-bg: #ffffff;
--bboard-mobile-action-bg: #d1c4e9;
--bboard-mobile-key-radius: 12px;
--bboard-mobile-key-color: #1a1a2e;
--bboard-mobile-hint-color: #b39ddb; /* number hints + long-press dots */

/* Row 4 fixed widths */
--bboard-mobile-r4-special-width: 72px;
--bboard-mobile-r4-space-width: 160px;
--bboard-mobile-r4-gap: 10px;
```

---

## VirtualKeyboard API Integration

```ts
// In attach():
if ('virtualKeyboard' in navigator) {
  this._suppressionMethod = 'virtualKeyboard';
  this._savedVKPolicy = target.getAttribute('virtualkeyboardpolicy');
  target.setAttribute('virtualkeyboardpolicy', 'manual');
  (navigator as any).virtualKeyboard.overlaysContent = true;
} else {
  this._suppressionMethod = 'inputmode';
  this._savedInputMode = target.getAttribute('inputmode');
  target.setAttribute('inputmode', 'none');
}

// In detach():
if (this._suppressionMethod === 'virtualKeyboard') {
  if (this._savedVKPolicy == null) target.removeAttribute('virtualkeyboardpolicy');
  else target.setAttribute('virtualkeyboardpolicy', this._savedVKPolicy);
  (navigator as any).virtualKeyboard.overlaysContent = false;
} else {
  if (this._savedInputMode == null) target.removeAttribute('inputmode');
  else target.setAttribute('inputmode', this._savedInputMode);
}
```

New private fields: `_suppressionMethod: 'virtualKeyboard' | 'inputmode' | null`, `_savedVKPolicy: string | null | undefined`.

---

## Visual Note

The visual design direction is approved but not pixel-perfect — the implementation phase will use live browser preview to iterate on spacing, key heights, and typography. The CSS tokens above are the starting point; adjustments are expected during implementation.
