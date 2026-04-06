# Angular Integration Guide

This guide shows how to integrate `<benin-keyboard>` into an Angular application using standalone components.

## Installation

```bash
npm install b-board
```

## Setup

### 1. Import the package

Register the custom element in your `main.ts`:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import 'b-board';

bootstrapApplication(AppComponent);
```

### 2. Add CUSTOM_ELEMENTS_SCHEMA

In every standalone component that uses `<benin-keyboard>`, add the schema:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <benin-keyboard [attr.language]="language"></benin-keyboard> `,
})
export class KeyboardDemoComponent {
  language = 'yoruba';
}
```

## Event Binding

Angular binds to custom events using the `(event-name)` syntax:

```ts
@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <textarea [value]="text" readonly></textarea>
    <benin-keyboard
      [attr.language]="language"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  language = 'yoruba';
  text = '';

  onKeyPress(event: Event): void {
    const { char } = (event as CustomEvent).detail;
    this.text += char;
  }
}
```

## Property Binding

Use `[attr.property]` to bind attributes reactively:

```html
<benin-keyboard
  [attr.language]="language"
  [attr.theme]="theme"
  [attr.layout-variant]="layoutVariant"
  [attr.disabled]="isDisabled ? '' : null"
></benin-keyboard>
```

> **Important:** Use `[attr.language]` not `[language]`. Web component attributes must be set via the `attr.` prefix in Angular to ensure they're written as HTML attributes.

## Available Events

| Event Name               | Detail                                            | Description          |
| ------------------------ | ------------------------------------------------- | -------------------- |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | Key was pressed      |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Keyboard initialized |
| `bboard-language-change` | `{ languageId: string }`                          | Language changed     |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Theme changed        |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Error occurred       |

## Zone.js and Change Detection

Custom element events are automatically patched by Zone.js, so Angular's change detection works out of the box. If you use `zoneless` change detection, you'll need to manually trigger it:

```ts
import { Component, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <benin-keyboard (bboard-key-press)="onKeyPress($event)"></benin-keyboard> `,
})
export class KeyboardDemoComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  onKeyPress(event: Event): void {
    const { char } = (event as CustomEvent).detail;
    this.text += char;
    this.cdr.markForCheck(); // Only needed with OnPush or zoneless
  }
}
```

## Handling Composition

The keyboard handles tone and nasal modifiers internally. Composed characters are emitted directly:

```ts
onKeyPress(event: Event): void {
  const { char } = (event as CustomEvent).detail;
  // char is already the composed character (e.g., 'é' not 'e' + '´')
  this.text += char;
}
```

## Theming

Apply CSS custom properties via the component's styles or inline:

```ts
@Component({
  // ...
  styles: [`
    benin-keyboard {
      --bboard-color-surface-base: #1e1e1e;
      --bboard-color-surface-key: #2d2d2d;
      --bboard-color-text-primary: #ffffff;
    }
  `],
})
```

## Standalone vs NgModule

### Standalone (recommended)

```ts
@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class KeyboardDemoComponent {}
```

### NgModule (legacy)

```ts
@NgModule({
  declarations: [KeyboardDemoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

## Full Example

See [`examples/angular-sample-app/`](../../examples/angular-sample-app/) for a complete working example.
