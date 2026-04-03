# B-Board token reference

This document serves as the authoritative guide for all design tokens used in the
B-Board keyboard. For usage instructions and programmatic control, see the
[Theming Guide](./THEME_GUIDE.md).

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
| `--bboard-color-surface-sunken`  | `#D1D5DB`            | `#000000`                  | Inset containers/wells           |
| `--bboard-color-surface-key`     | `#FFFFFF`            | `#3A3A3C`                  | Standard key background          |
| `--bboard-color-surface-special` | `#B4BBC3`            | `#2C2C2E`                  | Modifier keys (Shift, Backspace) |
| `--bboard-color-surface-active`  | `#E5E7EB`            | `#48484A`                  | Pressed state for standard keys  |
| `--bboard-color-text-primary`    | `#000000`            | `#FFFFFF`                  | Primary text contrast            |
| `--bboard-color-text-secondary`  | `#4B5563`            | `#9CA3AF`                  | Secondary/Muted text             |
| `--bboard-color-text-on-primary` | `#FFFFFF`            | `#FFFFFF`                  | Text on accent background        |
| `--bboard-color-primary-base`    | `#007AFF`            | `#0A84FF`                  | Accent color (active states)     |
| `--bboard-color-primary-hover`   | `#0063E6`            | `#409CFF`                  | Hover feedback                   |
| `--bboard-color-primary-active`  | `#0051BB`            | `#0062D1`                  | Active accent feedback           |
| `--bboard-color-border-subtle`   | `rgba(0, 0, 0, 0.1)` | `rgba(255, 255, 255, 0.1)` | Key/Section separators           |
| `--bboard-color-border-strong`   | `rgba(0, 0, 0, 0.2)` | `rgba(255, 255, 255, 0.3)` | High contrast boundaries         |
| `--bboard-color-focus-ring`      | `#007AFF`            | `#0A84FF`                  | Accessibility focus indicator    |
| `--bboard-color-status-error`    | `#FF3B30`            | `#FF453A`                  | Error states                     |
| `--bboard-color-status-success`  | `#34C759`            | `#32D74B`                  | Success/Valid states             |

## Sizing and spacing tokens

| Token                      | Value         | Purpose                           |
| :------------------------- | :------------ | :-------------------------------- |
| `--bboard-size-touch-min`  | `44px`        | Compliance with min touch targets |
| `--bboard-size-key-height` | `3rem` (48px) | Default key height                |
| `--bboard-size-key-width`  | `2.5rem`      | Base key width (variable)         |
| `--bboard-size-radius-sm`  | `4px`         | Sub-component radius              |
| `--bboard-size-radius-md`  | `6px`         | Key cap corner radius             |
| `--bboard-size-radius-lg`  | `12px`        | Main container radius             |
| `--bboard-space-gap-row`   | `8px`         | Vertical gap between rows         |
| `--bboard-space-gap-key`   | `6px`         | Horizontal gap between keys       |
| `--bboard-space-padding`   | `4px`         | Keyboard container padding        |
| `--bboard-space-inset-sm`  | `8px`         | Small internal padding            |
| `--bboard-space-inset-md`  | `12px`        | Standard internal padding         |

## Typography and effects

| Token                         | Value                                  | Purpose                        |
| :---------------------------- | :------------------------------------- | :----------------------------- |
| `--bboard-font-family`        | `system-ui, -apple-system, sans-serif` | Native-feeling integration     |
| `--bboard-font-size-base`     | `1rem` (16px)                          | Base readable size             |
| `--bboard-font-size-sm`       | `0.875rem`                             | Secondary/Label size           |
| `--bboard-font-size-lg`       | `1.25rem`                              | Large character size           |
| `--bboard-font-weight-label`  | `500`                                  | Medium weight for readability  |
| `--bboard-font-weight-bold`   | `700`                                  | Bold weight for emphasis       |
| `--bboard-shadow-key`         | `0 1px 0 rgba(0,0,0,0.2)`              | Physical key depth             |
| `--bboard-shadow-key-pressed` | `none`                                 | Visual feedback on press       |
| `--bboard-shadow-popup`       | `0 4px 12px rgba(0,0,0,0.15)`          | Elevation for key previews     |
| `--bboard-opacity-disabled`   | `0.5`                                  | Visual state for disabled keys |

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
