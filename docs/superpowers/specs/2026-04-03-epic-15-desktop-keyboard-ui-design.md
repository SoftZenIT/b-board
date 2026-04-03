# Epic #15: Desktop Keyboard UI & Rendering - Design Specification

## Overview

This document outlines the design and implementation strategy for the Desktop Keyboard UI & Rendering engine (Epic #15 / BBOARD-98) of the B-Board virtual keyboard.

## 1. Architecture & Rendering Engine (Lit)

- **Core Component:** `<benin-keyboard>` will be implemented as a Lit web component. It will utilize reactive properties (`language`, `layoutVariant`, `theme`, `disabled`, `visible`, `modifierDisplayMode`) and reactive internal state (`isOpen`, `compositionState`, `heldKeys`).
- **Shadow DOM:** We will use Shadow DOM to strictly encapsulate styles and isolate key event handling, preventing interference with the host application.
- **Layout Engine:** The component will dynamically render the layout based on the resolved `layoutVariant` data.
  - The desktop layout will consist of 4 distinct rows.
  - Key widths will be calculated dynamically using CSS variables (`flex-basis`) to ensure a fluid, responsive structure.
  - Responsive width buckets will be implemented (lg: 1024px+, xl: 1366px+).

## 2. Visual Style & Styling Strategy

- **Aesthetic (Skeuomorphic):** The desktop UI will have a native OS feel. Keys will feature distinct borders, subtle gradients, and drop shadows to mimic physical depth, utilizing the design tokens defined in the Theme System (Epic #14).
- **Key Sizing:**
  - Standard keys will have a base width token.
  - Wide keys (Space, Enter, Shift) will use defined multipliers (e.g., 2x, 3x) calculated via CSS `calc()` combined with base layout tokens.
- **Action Keys (Icon-centric Minimal):** Action keys (Shift, Backspace, Enter) will maintain the same background color as standard character keys but will rely on distinct, bold, scalable SVG iconography to differentiate their purpose. Text labels will not be used for action keys.

## 3. Interaction & Physical Key Echo

- **Echo Behavior (Physical Depression):** When a user presses a key on their physical hardware keyboard, the corresponding virtual key will visually depress. The bottom shadow will reduce, and the keycap will shift downward to mimic a mechanical press. This provides immediate (< 16ms response) visual confirmation.
- **Event Handling:** The component will listen for global `keydown` and `keyup` events, map the physical `code` property (e.g., `KeyA`, `Digit1`) to the current logical layout, and trigger the corresponding key's echo animation.

## 4. Modifier Hints & Labels

- **Primary Labels:** All 48 keys will render their primary characters clearly (e.g., 14px base size).
- **Modifier Behavior (Full Key Transition - Default):** By default, when a modifier (Shift, AltGr) is held, the primary labels on the entire keyboard will instantly transition to show the modified characters (similar to standard mobile keyboards).
- **Configurability (`modifierDisplayMode`):** A new property, `modifierDisplayMode` (type: `'transition' | 'hint'`), will be introduced. When set to `'hint'`, the keyboard will switch to a classic desktop mode where secondary characters are always visible in a corner but muted.

## 5. Accessibility & State Management

- **Focus Management:** A visible, high-contrast focus ring (meeting WCAG AA contrast standards) will be implemented for Tab-based keyboard navigation. A focus trap will be enforced when the virtual keyboard is active and focused.
- **Disabled/Hidden States:**
  - Disabled keys will render with reduced opacity and the `aria-disabled="true"` attribute.
  - Hidden keys will be removed from the layout flow entirely, ensuring the remaining keys scale and fill the available space appropriately.

## Acceptance Criteria Checklist

- [ ] Lit component structure implemented with Shadow DOM.
- [ ] 4-row responsive layout engine implemented.
- [ ] Native OS skeuomorphic styling applied using design tokens.
- [ ] Icon-centric styling for action keys.
- [ ] Physical key depression echo effect implemented (< 16ms latency).
- [ ] Configurable modifier display (`modifierDisplayMode: 'transition' | 'hint'`).
- [ ] Full keyboard navigation and WCAG AA focus rings.
- [ ] Proper handling of disabled and hidden key states.
