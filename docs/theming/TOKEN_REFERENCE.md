# B-Board token reference

This document serves as the authoritative guide for all design tokens used in the
B-Board keyboard. These tokens provide a consistent visual language across
different platforms and themes.

## Naming convention

All tokens follow a standard semantic format to ensure predictability and avoid
naming collisions:

`--bboard-[category]-[role]-[state/variant]`

- **Prefix:** `--bboard-` (prevents collisions with host application styles)
- **Category:** `color`, `size`, `space`, `font`, `shadow`
- **[role]:** Defines the semantic role (e.g., `surface`, `text`, `primary`, `focus`)
- **[state/variant]:** Indicates the interactive state or component variant (e.g., `base`, `hover`, `active`, `special`, `muted`)

## Color tokens

The following table lists the available color tokens and their values for both
light and dark modes.

| Token                            | Light value          | Dark value                 | Purpose                          |
| :------------------------------- | :------------------- | :------------------------- | :------------------------------- |
| `--bboard-color-surface-base`    | `#E2E4E9`            | `#1C1C1E`                  | Main keyboard background         |
| `--bboard-color-surface-key`     | `#FFFFFF`            | `#3A3A3C`                  | Standard key background          |
| `--bboard-color-surface-special` | `#B4BBC3`            | `#2C2C2E`                  | Modifier keys (Shift, Backspace) |
| `--bboard-color-text-primary`    | `#000000`            | `#FFFFFF`                  | Primary text contrast            |
| `--bboard-color-text-secondary`  | `#4B5563`            | `#9CA3AF`                  | Secondary/Muted text             |
| `--bboard-color-primary-base`    | `#007AFF`            | `#0A84FF`                  | Accent color (active states)     |
| `--bboard-color-primary-hover`   | `#0063E6`            | `#409CFF`                  | Hover/Focus feedback             |
| `--bboard-color-border-subtle`   | `rgba(0, 0, 0, 0.1)` | `rgba(255, 255, 255, 0.1)` | Key/Section separators           |
| `--bboard-color-focus-ring`      | `#007AFF`            | `#0A84FF`                  | Accessibility focus indicator    |

## Sizing and spacing tokens

Use these tokens to manage layout, dimensions, and touch targets.

| Token                      | Value         | Purpose                           |
| :------------------------- | :------------ | :-------------------------------- |
| `--bboard-size-touch-min`  | `44px`        | Compliance with min touch targets |
| `--bboard-size-key-height` | `3rem` (48px) | Default key height                |
| `--bboard-size-radius-sm`  | `4px`         | Sub-component radius              |
| `--bboard-size-radius-md`  | `6px`         | Key cap corner radius             |
| `--bboard-space-gap-row`   | `8px`         | Vertical gap between rows         |
| `--bboard-space-gap-key`   | `6px`         | Horizontal gap between keys       |
| `--bboard-space-padding`   | `4px`         | Keyboard container padding        |

## Typography and effects

These tokens define the font styles and visual depth effects.

| Token                         | Value                                  | Purpose                       |
| :---------------------------- | :------------------------------------- | :---------------------------- |
| `--bboard-font-family`        | `system-ui, -apple-system, sans-serif` | Native-feeling integration    |
| `--bboard-font-size-base`     | `1rem` (16px)                          | Base readable size            |
| `--bboard-font-weight-label`  | `500`                                  | Medium weight for readability |
| `--bboard-shadow-key`         | `0 1px 0 rgba(0,0,0,0.2)`              | Physical key depth            |
| `--bboard-shadow-key-pressed` | `none`                                 | Visual feedback on press      |

## Usage examples

You can access these tokens via CSS variables or TypeScript constants.

### CSS

Apply tokens directly in your stylesheets using the `var()` function.

> [!NOTE]
> Ensure you import the token stylesheet: `@import 'src/theme/tokens.css';`

```css
.my-key {
  background-color: var(--bboard-color-surface-key);
  height: var(--bboard-size-key-height);
}
```

### TypeScript

For programmatic access, use the `BBOARD_TOKENS` constant.

```typescript
import { BBOARD_TOKENS } from '@/theme/tokens';

const color = getComputedStyle(el).getPropertyValue(BBOARD_TOKENS.COLOR.SURFACE_KEY);
```
