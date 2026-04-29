# Accessibility

b-board is designed to meet **WCAG 2.1 Level AA** as its baseline accessibility target. This guide describes what is built in, how to test it, and what integrators need to do to keep the overall experience accessible.

## What Is Built In

### Keyboard navigation

The keyboard element supports full keyboard operation without a mouse or touch input:

- **Tab / Shift+Tab** — moves focus through keys in row order (roving tabindex pattern)
- **Arrow keys** — navigate the 2-D key grid; movement stops at edges
- **Enter / Space** — activates the focused key
- **Escape** — cancels an active composition (armed dead-key state) or dismisses the long-press popup on mobile
- **Focus indicator** — a 2 px `outline` using `--bboard-color-focus-ring` (#007aff in light mode, #0a84ff in dark mode) is visible on all focused keys, meeting the 3:1 minimum contrast ratio for non-text UI components (WCAG 2.1 §1.4.11)

### ARIA roles and labels

- Every key is rendered as a `<button>` element
- The keyboard container carries `role="group"` and an `aria-description` with usage instructions in French ("Utilisez Tab et les touches fléchées pour naviguer, Entrée ou Espace pour activer une touche"), the primary language of the target user base in Francophone West Africa
- The keyboard container has a `lang` attribute set to the BCP 47 code matching the active language (`yo` for Yoruba, `fon` for Fon/Adja, `bba` for Baatɔnum, `ddn` for Dendi)
- Action keys (Backspace, Shift, Enter, AltGr) have human-readable `aria-label` values, not icon labels
- Toggle keys (Shift, AltGr, CapsLock) carry `aria-pressed` to reflect their active state; character keys do not

### Screen reader announcements

Two ARIA live regions (one polite, one assertive) are embedded inside the shadow DOM. They announce:

| Event                 | Message (French)             | Level     |
| --------------------- | ---------------------------- | --------- |
| Language changed      | "Langue : Yoruba"            | polite    |
| Tone modifier armed   | "Modificateur de ton activé" | polite    |
| Nasal modifier armed  | "Modificateur nasal activé"  | polite    |
| Composition cancelled | "Modificateur annulé"        | polite    |
| Invalid composition   | "Combinaison invalide"       | assertive |

### High-contrast and reduced-motion

- `@media (prefers-contrast: more)` — adds stronger box shadows and widens focus outlines to 3 px
- `@media (forced-colors: active)` — uses CSS system colors (`ButtonText`, `Highlight`, `HighlightText`) for Windows High Contrast Mode
- `@media (prefers-reduced-motion: reduce)` — disables all transitions and animations with `transition: none !important`

## Testing with axe-core

The recommended automated accessibility test uses `@axe-core/playwright` in your Playwright test suite.

**Install the dependency:**

```bash
npm install -D @axe-core/playwright
```

**Example test:**

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('benin-keyboard accessibility', () => {
  test('passes axe audit (desktop)', async ({ page }) => {
    await page.goto('/');
    // Wait for the keyboard to initialise
    await page.waitForSelector('benin-keyboard');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('passes axe audit (mobile layout)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.querySelector('benin-keyboard')?.setAttribute('layout-variant', 'mobile-default');
    });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Tab moves focus through keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('benin-keyboard');

    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() =>
      document
        .querySelector('benin-keyboard')
        ?.shadowRoot?.activeElement?.getAttribute('data-key-id')
    );
    expect(firstFocused).toBeTruthy();

    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() =>
      document
        .querySelector('benin-keyboard')
        ?.shadowRoot?.activeElement?.getAttribute('data-key-id')
    );
    expect(secondFocused).not.toBe(firstFocused);
  });

  test('language change announces to screen reader', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('benin-keyboard');

    await page.evaluate(() => {
      document.querySelector('benin-keyboard')?.setAttribute('language', 'fon-adja');
    });

    const announcement = await page.evaluate(
      () =>
        document.querySelector('benin-keyboard')?.shadowRoot?.querySelector('[aria-live="polite"]')
          ?.textContent
    );
    expect(announcement).toContain('Langue');
  });
});
```

::: tip Shadow DOM
axe-core does not pierce shadow DOM by default in all configurations. Verify your `AxeBuilder` version supports shadow DOM analysis, or use the `include` option to target the host element.
:::

## Manual Testing Checklist

Run through these scenarios with a real screen reader (NVDA + Firefox on Windows, VoiceOver + Safari on macOS/iOS) before each release:

- [ ] Tab into the keyboard from the preceding focusable element
- [ ] Screen reader announces the keyboard role and usage instructions on first focus
- [ ] Tab through all keys — each announces its label (character or action name)
- [ ] Press a tone modifier key — screen reader announces "Modificateur de ton activé"
- [ ] Press a vowel — screen reader announces the composed character
- [ ] Press Escape — screen reader announces "Modificateur annulé"
- [ ] Switch language via attribute — screen reader announces the new language name
- [ ] Enable Windows High Contrast Mode — all keys remain visible with clear borders
- [ ] Enable `prefers-reduced-motion` in OS settings — key press animations are absent

## Best Practices for Integrators

### Label the connected input

b-board does not label the text input that receives key presses. You must provide a visible or accessible label for it:

```html
<!-- Visible label -->
<label for="my-input">Enter text in Yoruba</label>
<input id="my-input" type="text" />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Without a label, screen reader users arrive at the input with no context about what to type.

### Use the `open` attribute, not `display: none`

Hiding the keyboard with CSS `display: none` or `visibility: hidden` prevents the browser from computing accessible names and removes the element from the accessibility tree entirely. Use the `open` attribute instead — b-board handles the show/hide transition and keeps the element in the accessibility tree when closed:

```html
<!-- Show the keyboard -->
<benin-keyboard open language="yoruba"></benin-keyboard>

<!-- Hide the keyboard — do this, not display:none -->
<benin-keyboard language="yoruba"></benin-keyboard>
```

### contenteditable requirements

If you connect the keyboard to a `contenteditable` element, ensure the element has an accessible name:

```html
<div
  role="textbox"
  aria-label="Text editor"
  aria-multiline="true"
  contenteditable="true"
  id="editor"
></div>
<benin-keyboard input-id="editor" language="yoruba"></benin-keyboard>
```

Without `role="textbox"` and `aria-label`, screen reader users cannot identify the editable area as an input.

### Do not suppress focus outlines

b-board's focus ring is rendered inside the shadow DOM and cannot be overridden by host-page CSS rules targeting `:focus-visible`. Do not add `outline: none` to `benin-keyboard` itself — this has no effect on the internal focus ring but could inadvertently suppress other focus indicators on your page.

## Colour Contrast Note

The default theme uses the following foreground/background colour pairs for key labels. All pairs meet the WCAG 2.1 §1.4.3 minimum ratio of 4.5:1 for normal text:

| Context               | Foreground | Background | Ratio |
| --------------------- | ---------- | ---------- | ----- |
| Character key (light) | #1a1a2e    | #e2e4e9    | ≥ 7:1 |
| Action key (light)    | #1a1a2e    | #c8cdd8    | ≥ 5:1 |
| Character key (dark)  | #e8eaf0    | #1e2030    | ≥ 7:1 |
| Action key (dark)     | #e8eaf0    | #2a2d42    | ≥ 5:1 |

If you override design tokens via CSS custom properties, verify that your colour combinations maintain at least a 4.5:1 contrast ratio using a tool such as the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
