# Accessibility Implementation Design — BBOARD-104

**Epic:** [BBOARD-104](https://ousmanesadjad.atlassian.net/browse/BBOARD-104) — Epic #21: Accessibility Implementation  
**Date:** 2026-04-06  
**Approach:** Audit existing code against acceptance criteria, fill gaps, then mark done (task-by-task)  
**Architecture:** Integrated — all changes within existing `src/ui/`, `src/element/`, and `tests/` (no new `src/a11y/` module)

---

## 1. Scope

11 Jira tasks (BBOARD-164 through BBOARD-174). Many features already exist in the codebase. This spec documents each task's current state, identifies gaps, and defines the exact changes needed.

## 2. Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ARIA live region language | French | Target audience is Francophone West Africa |
| Shift/AltGr toggle announcements | No | Too noisy for frequent togglers |
| Announce language changes | Yes | Critical orientation info |
| Announce composition state | Yes | Users need to know when tone/nasal modifier is armed |
| Announce errors | Yes | Invalid compositions must be surfaced |
| High-contrast support | Both `prefers-contrast` and `forced-colors` | Full coverage across platforms |
| Testing approach | Playwright + `@axe-core/playwright` | Real browser rendering for accurate shadow DOM testing |
| Code organization | Integrated in existing files | Follows current patterns, no module boundary changes |

## 3. Task-by-Task Design

### 21.1: Tab/Shift+Tab Navigation (BBOARD-164)

**Status:** ✅ Already implemented  
**Location:** `src/element/benin-keyboard.ts` lines 544–561, `src/ui/state/focus-controller.ts`

**Existing behavior:**
- `_handleKeydown` intercepts Tab/Shift+Tab when shadow DOM has active element
- `createFocusController(grid).move('tab' | 'shift-tab', current)` navigates flat key list
- Roving tabindex: focused key gets `tabindex=0`, all others `tabindex=-1`
- Focus synced to DOM via `_syncDomFocus()` calling `.focus({ preventScroll: true })`

**Acceptance criteria audit:**
1. ✅ Tabindex order logical and predictable (follows keyboard row order)
2. ✅ Tab works through all interactive elements (flat grid traversal)
3. ✅ Shift+Tab works in reverse (reverse flat traversal)
4. ✅ Focus visible at all times (`:focus-visible` outline, see 21.4)
5. ✅ Tab trapping — N/A (no modal dialogs; long-press is touch-only)

**Changes needed:** None

---

### 21.2: Arrow-Key Navigation (BBOARD-165)

**Status:** ✅ Already implemented  
**Location:** `src/ui/state/focus-controller.ts`, `src/element/benin-keyboard.ts` lines 546–549

**Existing behavior:**
- 2D grid computed by `_computeFocusGrid()` from resolved layout rows
- Arrow keys map to grid coordinates: up/down change row, left/right change column
- At edges: navigation stops (returns current key) — matches acceptance criteria "(or stops)"

**Acceptance criteria audit:**
1. ✅ Arrow keys navigate between keys
2. ✅ Navigation stops at edges (acceptable per ticket wording)
3. ✅ Focus follows visual layout (grid mirrors rendered rows)
4. ✅ Fast key repetition supported (no repeat guard on navigation keys)

**Changes needed:** None

---

### 21.3: Escape to Dismiss Overlays (BBOARD-166)

**Status:** ⚠️ Partially implemented  
**Location:** `src/element/benin-keyboard.ts` lines 534–537

**Existing behavior:**
- Escape cancels composition state (`_compositionProcessor.cancel()`)
- Long-press popup on mobile has **no** Escape handler

**Acceptance criteria audit:**
1. ❌ Escape closes long-press menu — NOT IMPLEMENTED
2. N/A Escape closes error messages — no error message overlays exist
3. ✅ Escape closes composition (acts as "dialog" for armed state)
4. ❌ Focus returns to trigger element — not applicable currently since composition cancel doesn't move focus

**Changes needed:**

In `_handleKeydown`, before the composition escape check, add:

```typescript
if (e.key === 'Escape' && this._mobileState.snapshot().longPressVisible) {
  this._mobileState.dismissLongPress();
  this.requestUpdate();
  return;
}
```

**File:** `src/element/benin-keyboard.ts`

---

### 21.4: Visible Focus Indicator Styling (BBOARD-167)

**Status:** ✅ Already implemented  
**Location:** `src/element/benin-keyboard.ts` lines 132–136, 227–230

**Existing behavior:**
- Desktop: `.bboard-key:focus-visible, .bboard-key.is-focused { outline: 2px solid var(--bboard-color-focus-ring); outline-offset: 2px; }`
- Mobile: `.bboard-mobile-key:focus-visible { outline: 2px solid var(--bboard-color-focus-ring); outline-offset: 2px; }`
- Focus ring color: `--bboard-color-focus-ring` = #007aff (light) / #0a84ff (dark)

**Acceptance criteria audit:**
1. ✅ Focus outline visible on all keys (both desktop and mobile)
2. ✅ Contrast: #007aff on #e2e4e9 ≈ 3.1:1 (meets 3:1 minimum for non-text UI per WCAG 2.1)
3. ✅ High-contrast visibility — will be addressed in 21.8
4. ✅ 2px minimum outline width

**Changes needed:** None

---

### 21.5: ARIA Labels for All Keys (BBOARD-168)

**Status:** ⚠️ Largely implemented, one gap

**Existing behavior:**
- Desktop: `getAccessibleLabel(keyId, primaryLabel)` maps action key IDs to readable names ("Backspace", "Shift", "Enter", etc.) — falls back to `primaryLabel` for character keys
- Mobile: uses `key.primaryLabel` directly — action keys get their visual label (icon/symbol) instead of a readable name

**Gap:** Mobile action keys lack human-readable ARIA labels.

**Changes needed:**

1. Extract `KEY_ACCESSIBLE_LABELS` and `getAccessibleLabel()` to a shared location (e.g., inline in both files, or a tiny shared util in `src/ui/`)
2. Use `getAccessibleLabel(key.keyId, key.primaryLabel)` in mobile key template

**Files:** `src/ui/mobile/key.ts`, `src/ui/desktop/key.ts`

To respect module boundaries, the simplest approach is to duplicate the label map in the mobile key file (it's 13 entries, ~15 lines). Alternatively, create `src/ui/accessible-labels.ts` shared by both desktop and mobile — both are within the `ui` module boundary.

**Chosen approach:** Create `src/ui/accessible-labels.ts` with the shared map and function. Import from both `desktop/key.ts` and `mobile/key.ts`.

---

### 21.6: ARIA Live Regions (BBOARD-169)

**Status:** ❌ Not implemented — biggest new feature

**Design:**

#### Live region elements

Add two visually-hidden `<div>` elements in the `render()` method, one per politeness level:

```html
<div class="bboard-sr-only" aria-live="polite" aria-atomic="true" id="bboard-announce-polite"></div>
<div class="bboard-sr-only" aria-live="assertive" aria-atomic="true" id="bboard-announce-assertive"></div>
```

#### Visually-hidden CSS class

```css
.bboard-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### Announcement method

```typescript
private _announcePolite(message: string): void { ... }
private _announceAssertive(message: string): void { ... }
```

Each method sets `textContent` on the corresponding `<div>`. To ensure screen readers detect changes even when the same message repeats, clear the text first, then set it after a microtask (`queueMicrotask`).

#### Announcement triggers

| Event | Message (French) | Level |
|-------|-------------------|-------|
| Language changed | `"Langue : Yoruba"` | polite |
| Tone modifier armed | `"Modificateur de ton activé"` | polite |
| Nasal modifier armed | `"Modificateur nasal activé"` | polite |
| Composition cancelled | `"Modificateur annulé"` | polite |
| Invalid composition | `"Combinaison invalide"` | assertive |

#### Integration points

- **Language change:** In the `language` property setter / `updated()` lifecycle when `language` changes
- **Composition armed:** After `_compositionProcessor.process()` returns and processor `isArmed` changes
- **Composition cancelled:** In the Escape handler and `_handleWindowBlur`
- **Invalid composition:** When `_compositionProcessor.process()` returns `null` (no match)

**File:** `src/element/benin-keyboard.ts`

---

### 21.7: Semantic HTML & ARIA (BBOARD-170)

**Status:** ⚠️ Largely implemented, two gaps

**Existing behavior:**
- All keys are `<button>` elements ✅
- Container has `role="group"` ✅
- `aria-pressed` on keys, `aria-haspopup` for long-press ✅
- Long-press popup has `role="listbox"` / `role="option"` / `aria-selected` ✅

**Gap 1: `aria-pressed` on non-toggle keys**

Currently both desktop and mobile templates set `aria-pressed=${key.active}` on ALL keys. Per ARIA spec, `aria-pressed` should only appear on toggle buttons (Shift, AltGr, CapsLock). Character keys should not have it.

**Fix:** Conditionally render `aria-pressed` only when the key is a toggle key. The render model already has `key.isActionKey` (or equivalent) — we need to check if the key is specifically a modifier. Add an `isToggle` flag to the render model, or check against a known set of modifier keyIds.

**Chosen approach:** Only emit `aria-pressed` when the key is a known modifier/toggle key (`key-shift`, `key-shift-right`, `key-altgr`, `key-capslock`). Character keys never get `aria-pressed`.

**Gap 2: No `lang` attribute**

The keyboard container should have a `lang` attribute matching the active language for correct screen reader pronunciation.

**Fix:** Map `LanguageId` → BCP 47 code:

| LanguageId | BCP 47 |
|-----------|--------|
| `yoruba` | `yo` |
| `fon-adja` | `fon` |
| `baatonum` | `bba` |
| `dendi` | `ddn` |

Add `lang=${this._bcp47Lang}` to both mobile and desktop containers.

**Files:** `src/element/benin-keyboard.ts`, `src/ui/desktop/key.ts`, `src/ui/mobile/key.ts`, render model files

---

### 21.8: High-Contrast Mode Support (BBOARD-171)

**Status:** ❌ Not implemented

**Design:**

Add two media query blocks to the Lit `static styles`:

#### `prefers-contrast: more`

Override design tokens for stronger visual boundaries:

```css
@media (prefers-contrast: more) {
  .bboard-key {
    box-shadow: 0 0 0 1px var(--bboard-color-text-primary);
    font-weight: 600;
  }
  .bboard-key-action {
    box-shadow: 0 0 0 1.5px var(--bboard-color-text-primary);
  }
  .bboard-key:focus-visible,
  .bboard-key.is-focused {
    outline-width: 3px;
  }
  .bboard-mobile-key {
    box-shadow: 0 0 0 1px var(--bboard-color-text-primary);
    font-weight: 600;
  }
  .bboard-mobile-key:focus-visible {
    outline-width: 3px;
  }
}
```

#### `forced-colors: active`

Use CSS system colors for Windows High Contrast Mode:

```css
@media (forced-colors: active) {
  .bboard-key,
  .bboard-mobile-key {
    border: 1px solid ButtonText;
    forced-color-adjust: none;
  }
  .bboard-key:focus-visible,
  .bboard-key.is-focused,
  .bboard-mobile-key:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
  .bboard-key.is-active,
  .bboard-mobile-key.is-active {
    background: Highlight;
    color: HighlightText;
    forced-color-adjust: none;
  }
  .bboard-long-press-popup {
    border: 1px solid ButtonText;
  }
  .bboard-long-press-item.is-selected {
    background: Highlight;
    color: HighlightText;
  }
}
```

**File:** `src/element/benin-keyboard.ts` (Lit static styles block)

---

### 21.9: Reduced-Motion Support (BBOARD-172)

**Status:** ✅ Already implemented  
**Location:** `src/element/benin-keyboard.ts` lines 291–298

**Existing behavior:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

**Acceptance criteria audit:**
1. ✅ Animations disabled
2. ✅ Transitions disabled
3. ✅ Core functionality unaffected (only visual transitions removed)
4. ✅ No seizure risks (blanket disable)

**Changes needed:** None

---

### 21.10: Screen-Reader Interaction Patterns (BBOARD-173)

**Status:** ⚠️ Mostly covered by 21.5, 21.6, 21.7

Once ARIA labels, live regions, and semantic fixes are in place, one additional enhancement:

**Add usage instructions via `aria-description`:**

```typescript
aria-description="Utilisez Tab et les touches fléchées pour naviguer, Entrée ou Espace pour activer une touche"
```

Applied to the keyboard container (`role="group"` div) in both mobile and desktop branches.

**File:** `src/element/benin-keyboard.ts`

---

### 21.11: Accessibility Testing (BBOARD-174)

**Status:** ❌ Not implemented

**Design:**

#### Dependency

```bash
npm install -D @axe-core/playwright
```

#### Test file: `tests/a11y/keyboard-a11y.spec.ts`

Uses existing Playwright config. Test cases:

1. **axe audit (desktop)** — render `<benin-keyboard>`, run `AxeBuilder(page).analyze()`, assert 0 violations
2. **axe audit (mobile)** — render with `layout-variant="mobile-azerty"`, run axe, assert 0 violations
3. **Tab navigation** — press Tab repeatedly, verify focus moves through keys in order
4. **Arrow-key navigation** — focus a key, press ArrowRight/Down, verify focus moves correctly
5. **Escape dismisses long-press** — simulate long-press on mobile, press Escape, verify popup gone
6. **ARIA labels on action keys** — query all buttons, verify action keys have human-readable labels
7. **ARIA live announcements** — change language attribute, verify live region text updates
8. **Focus indicator visible** — focus a key, verify computed outline style is present
9. **High-contrast rendering** — emulate `forced-colors: active`, verify key borders
10. **Reduced-motion** — emulate `prefers-reduced-motion: reduce`, verify no transitions

**File:** `tests/a11y/keyboard-a11y.spec.ts`

---

## 4. File Change Summary

| File | Type | Changes |
|------|------|---------|
| `src/element/benin-keyboard.ts` | Edit | Escape for long-press, ARIA live regions, `lang` attribute, `aria-description`, high-contrast CSS, forced-colors CSS |
| `src/ui/accessible-labels.ts` | New | Shared `KEY_ACCESSIBLE_LABELS` map + `getAccessibleLabel()` |
| `src/ui/desktop/key.ts` | Edit | Import shared labels, conditional `aria-pressed` |
| `src/ui/mobile/key.ts` | Edit | Import shared labels, conditional `aria-pressed` |
| `src/ui/desktop/render-model.ts` | Edit | Add `isToggle` to render key model |
| `src/ui/mobile/render-model.ts` | Edit | Add `isToggle` to render key model |
| `tests/a11y/keyboard-a11y.spec.ts` | New | Playwright + axe-core a11y tests |
| `package.json` | Edit | Add `@axe-core/playwright` dev dependency |

## 5. Out of Scope

- Touch-accessibility alternatives to long-press (e.g., double-tap) — not in tickets
- Voice control optimization — not in tickets
- i18n of ARIA labels beyond French — can be added later
- Manual screen reader testing with NVDA/JAWS — documented as manual QA step, not automatable
