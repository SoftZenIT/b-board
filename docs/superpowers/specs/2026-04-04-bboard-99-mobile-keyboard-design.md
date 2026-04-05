# Mobile Keyboard UI & Rendering — Design Spec

**Epic:** BBOARD-99  
**Date:** 2026-04-04  
**Status:** Approved  
**Scope:** Tasks BBOARD-125 through BBOARD-135

---

## Problem Statement

The `<benin-keyboard>` Lit component currently only supports desktop rendering (`src/ui/desktop/`). Mobile users need a touch-optimised keyboard with 44×44px minimum touch targets, thumb-zone-aware key sizing, a long-press alternate character menu, responsive width buckets, and full safe-area support for notched devices.

Swipe gestures and a prediction/suggestion UI were explicitly **deferred** to a future epic (see BBOARD-99 comment dated 2026-04-04).

---

## Decisions

| Question                 | Decision                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Renderer structure       | Parallel `src/ui/mobile/` module — mirrors desktop, no shared code forced              |
| Mobile mode activation   | Layout-variant naming: `mobile-*` variants automatically route to mobile renderer      |
| Long-press menu style    | Horizontal strip (iOS-style) above the held key; slide left/right to select            |
| Thumb-zone sizing        | Render model assigns `thumbComfort` per row; CSS scales key heights via data attribute |
| Swipe gestures           | Deferred — not in scope for this epic                                                  |
| Prediction/suggestion UI | Deferred — not in scope for this epic                                                  |

---

## Architecture

### Module Structure

```
src/ui/mobile/
  render-model.ts     Pure fn: ResolvedLayout + MobileRenderState → MobileRenderModel
  key.ts              Renders one touch key as Lit TemplateResult
  rows.ts             Renders a row of keys
  long-press.ts       Long-press popup strip renderer
  mobile-state.ts     Touch state (active layer, pressed key, long-press timer, bucket)
```

No `physical-key-map.ts` — physical keyboard echo is desktop-only.

### Mode Activation

In `benin-keyboard.ts`, the resolved layout variant name determines the renderer:

```ts
const isMobile = this.layoutVariant.startsWith('mobile-');
// delegates to src/ui/mobile/ or src/ui/desktop/ accordingly
```

No new public API attribute is needed.

---

## Data Model

### Layout JSON Extension

`mobile-default.json` key entries gain an optional `longPress` array in the `keyMap`:

```json
{
  "keyId": "key-a",
  "chars": { "base": "a", "shift": "A" },
  "longPress": ["à", "â", "ã", "á", "ä"]
}
```

`longPress` is optional. Keys without it show no popup and no indicator dot. This is a non-breaking addition to the existing schema.

### MobileRenderState

```ts
interface MobileRenderState {
  activeLayer: LayerId;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  focusedKeyId: KeyId | null;
  activeModifierKeyIds: ReadonlySet<KeyId>;
  longPressKeyId: KeyId | null;
  longPressVisible: boolean;
  widthBucket: 'xs' | 'sm' | 'md';
}
```

### MobileRenderKey

```ts
interface MobileRenderKey {
  keyId: KeyId;
  width: number; // normalised unit width (same convention as desktop)
  primaryLabel: string;
  secondaryLabel: string;
  hidden: boolean;
  disabled: boolean;
  active: boolean;
  tabStop: boolean;
  thumbComfort: 'high' | 'medium' | 'low'; // → data-thumb-comfort attribute
  hasLongPress: boolean; // true when keyMap entry has non-empty longPress[]
  longPressChars: string[]; // populated when hasLongPress=true
}
```

### MobileRenderModel

```ts
interface MobileRenderRow {
  keys: MobileRenderKey[];
  height: number; // px, from layout JSON row.height
}

interface MobileRenderModel {
  rows: MobileRenderRow[];
  widthBucket: 'xs' | 'sm' | 'md';
  longPressPopup: LongPressPopupModel | null;
}

interface LongPressPopupModel {
  anchorKeyId: KeyId;
  items: string[];
  selectedIndex: number;
}
```

### Responsive Width Buckets

Buckets are computed by a `ResizeObserver` on the keyboard container element (not the viewport, so the component works correctly when embedded in a partial-width layout):

| Bucket | Container width | Key height | Row gap |
| ------ | --------------- | ---------- | ------- |
| `xs`   | < 375px         | 44px       | 8px     |
| `sm`   | 375–768px       | 52px       | 12px    |
| `md`   | ≥ 768px         | 60px       | 16px    |

All values are exposed as CSS custom properties (`--key-height`, `--row-gap`) set on the keyboard container. No hardcoded pixel values in templates.

---

## Touch & Long-Press Interaction

### Touch Event Flow

Handled in `benin-keyboard.ts` touch handlers delegated to `mobile-state.ts`:

```
touchstart  → record keyId, start 300ms timer
touchmove   → if timer fired: update highlighted index in popup strip
touchend    → if timer fired: insert highlighted char, hide popup
            → if timer pending: cancel timer, dispatch bboard-key-press (normal tap)
touchcancel → cancel timer, hide popup, no dispatch
```

### State Machine

```
idle
  → [touchstart]          → pressing

pressing
  → [300ms elapsed]       → long-press-active   (show popup, vibrate 10ms)
  → [touchend]            → idle                (dispatch key-press)
  → [touchcancel/move>threshold] → idle

long-press-active
  → [touchmove]           → long-press-selecting

long-press-selecting
  → [touchmove]           → long-press-selecting (update selected index)
  → [touchend]            → idle                (dispatch key-press with alternate char)
  → [touchcancel]         → idle                (no dispatch)
```

### Popup Positioning

- Rendered absolutely above the anchor key
- Clamped to avoid overflow: `left = clamp(anchorLeft, safeLeft, safeRight - popupWidth)`
- `safeLeft` / `safeRight` derived from `env(safe-area-inset-left/right)` + container padding
- No animation when `prefers-reduced-motion: reduce` is active

### Haptic Feedback

```ts
navigator.vibrate?.(10); // on long-press trigger only, silent fail
```

---

## Accessibility & CSS

### Touch Target Sizing

All keys render at a minimum of 44×44px per WCAG and iOS HIG guidelines:

```css
.mobile-key {
  min-width: 44px;
  min-height: 44px;
  height: var(--key-height); /* from bucket */
  flex: var(--key-flex-width); /* proportional — set per key */
}
```

Width is proportional: each key gets `flex: <normalised-width>` so the row fills the container automatically. `min-width: 44px` prevents any key from shrinking below the touch-target floor. No explicit pixel calculation needed in `key.ts`.

### Safe Area Padding

Applied to the keyboard container in `src/ui/mobile/rows.ts`:

```css
.mobile-keyboard {
  padding-bottom: max(var(--row-gap), env(safe-area-inset-bottom));
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
}
```

Fallback: `12px` left/right padding on browsers that do not support `env()`.

### Thumb-Zone Comfort

The render model assigns `thumbComfort` based on row index (0 = top row):

| Row index              | Comfort  |
| ---------------------- | -------- |
| 0 (top)                | `low`    |
| 1                      | `medium` |
| 2                      | `high`   |
| 3+ (bottom action row) | `high`   |

CSS scales key height via a data attribute — no extra JavaScript per key:

```css
[data-thumb-comfort='high'] {
  height: calc(var(--key-height) * 1.1);
}
[data-thumb-comfort='medium'] {
  height: var(--key-height);
}
[data-thumb-comfort='low'] {
  height: calc(var(--key-height) * 0.9);
}
```

### Reduced Motion

A single rule in `src/theme/tokens.css` (already the global CSS entry point):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

The long-press popup appears instantly (no slide-in animation) under this rule.

### ARIA

| Element          | Role      | Attributes                                                                    |
| ---------------- | --------- | ----------------------------------------------------------------------------- |
| Key button       | `button`  | `aria-label`, `aria-pressed`, `aria-haspopup="listbox"` (when `hasLongPress`) |
| Long-press popup | `listbox` | `aria-label="Alternate characters"`                                           |
| Popup item       | `option`  | `aria-selected` for current highlight                                         |

---

## Deferred Features

The following were explicitly excluded from Epic #16 and documented in BBOARD-99:

- **Swipe gestures** (swipe-left = backspace, swipe-right = space, etc.)
- **Prediction / suggestion UI** (word prediction bar above the keyboard)

Create a dedicated epic for each before closing BBOARD-99.

---

## Testing Strategy

### Unit Tests

- `render-model.test.ts` — same pattern as desktop; test all `MobileRenderKey` field computations, thumb comfort assignment, long-press population
- `mobile-state.test.ts` — state machine transitions, timer logic (use fake timers)
- `long-press.test.ts` — popup positioning, clamping to safe areas, index calculation from touch X

### E2E Tests (BBOARD-135)

- Tap a key → `bboard-key-press` dispatched
- Hold a key 300ms → popup appears with correct chars
- Slide to alternate → release → correct char dispatched
- Touch cancel → no dispatch
- Responsive: render at xs/sm/md widths and verify key heights match bucket spec
- Reduced motion: verify no transitions fire
- Safe area: verify padding variables applied

---

## File Change Summary

| File                               | Change                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| `src/ui/mobile/render-model.ts`    | **New** — core pure renderer                                         |
| `src/ui/mobile/key.ts`             | **New** — touch key template                                         |
| `src/ui/mobile/rows.ts`            | **New** — row template + safe-area CSS                               |
| `src/ui/mobile/long-press.ts`      | **New** — popup strip template                                       |
| `src/ui/mobile/mobile-state.ts`    | **New** — touch state + ResizeObserver                               |
| `src/element/benin-keyboard.ts`    | **Modify** — mobile branch, touch handlers                           |
| `data/layouts/mobile-default.json` | **Modify** — add `longPress` arrays to keyMap                        |
| `src/theme/tokens.css`             | **Modify** — add reduced-motion rule + mobile CSS vars               |
| `src/public/index.ts`              | **Modify** — export `MobileRenderKey`, `MobileRenderState` if needed |
