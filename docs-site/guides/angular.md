---
title: Angular Integration
---

# Angular Integration

This guide covers integrating `<benin-keyboard>` into an Angular application using standalone components (Angular 14+). The keyboard is a Web Component; Angular requires a schema declaration to allow custom elements in templates.

## Installation

```bash
npm install b-board
```

## Setup

### 1. Register the custom element

Import `b-board` in your `main.ts` to register the element before the application bootstraps:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import 'b-board';

bootstrapApplication(AppComponent);
```

### 2. Add `CUSTOM_ELEMENTS_SCHEMA`

Without `CUSTOM_ELEMENTS_SCHEMA`, Angular's template compiler throws:

```
'benin-keyboard' is not a known element.
```

Add the schema to every standalone component that uses `<benin-keyboard>`:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<benin-keyboard language="yoruba"></benin-keyboard>`,
})
export class KeyboardDemoComponent {}
```

For NgModule-based apps, add it to the module instead:

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [KeyboardDemoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

## TypeScript Element Declaration

Add a global type declaration so TypeScript recognizes the element:

```ts
// src/bboard.d.ts
type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';
type ThemeId = 'light' | 'dark' | 'auto';

interface BeninKeyboardElement extends HTMLElement {
  language: LanguageId;
  theme: ThemeId;
  'layout-variant': 'desktop-azerty' | 'mobile-default';
  'modifier-display-mode': 'transition' | 'hint';
  open: boolean;
  disabled: boolean;
  'show-physical-echo': boolean;
  floating: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'benin-keyboard': BeninKeyboardElement;
  }
}
```

## Basic Template Usage

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <textarea [value]="text" readonly></textarea>
    <benin-keyboard
      [attr.language]="language"
      [attr.theme]="theme"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  language = 'yoruba';
  theme = 'auto';
  text = '';

  onKeyPress(event: Event): void {
    const { char } = (event as CustomEvent<{ char: string }>).detail;
    this.text += char;
  }
}
```

> **Important:** Use `[attr.language]` not `[language]`. Angular's `[property]` binding sets the DOM property; `[attr.]` sets the HTML attribute. Web components typically react to attribute changes via `attributeChangedCallback`, so always use `[attr.]` for reliability.

## `[(ngModel)]` Binding

`ngModel` works on `<textarea>` and `<input>` elements, not on the keyboard itself. Pair `ngModel` on your text element with a `bboard-key-press` listener:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <textarea [(ngModel)]="text"></textarea>
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
    this.text += (event as CustomEvent<{ char: string }>).detail.char;
  }
}
```

## Two-Way Binding Pattern

For full two-way binding where both the text field and the keyboard stay in sync, use a signal (Angular 17+) or a regular property:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <textarea [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
    <benin-keyboard
      [attr.language]="language()"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  text = signal('');
  language = signal<'yoruba' | 'fon-adja' | 'baatonum' | 'dendi'>('yoruba');

  onKeyPress(event: Event): void {
    const { char } = (event as CustomEvent<{ char: string }>).detail;
    this.text.update((prev) => prev + char);
  }
}
```

## Language Switching

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="controls">
      <button *ngFor="let lang of languages" (click)="setLanguage(lang.id)">
        {{ lang.label }}
      </button>
    </div>
    <textarea [value]="text" readonly></textarea>
    <benin-keyboard
      [attr.language]="language"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  languages = [
    { id: 'yoruba' as LanguageId, label: 'Yoruba' },
    { id: 'fon-adja' as LanguageId, label: 'Fon / Adja' },
    { id: 'baatonum' as LanguageId, label: 'Baatɔnum' },
    { id: 'dendi' as LanguageId, label: 'Dendi' },
  ];

  language: LanguageId = 'yoruba';
  text = '';

  setLanguage(id: LanguageId) {
    this.language = id;
  }

  onKeyPress(event: Event): void {
    this.text += (event as CustomEvent<{ char: string }>).detail.char;
  }
}
```

## Showing and Hiding the Keyboard

Bind `[attr.open]` to a ternary so the attribute is present (empty string) or absent (`null`):

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button (click)="isOpen = !isOpen">
      {{ isOpen ? 'Hide keyboard' : 'Show keyboard' }}
    </button>
    <textarea [(ngModel)]="text"></textarea>
    <benin-keyboard
      [attr.language]="language"
      [attr.open]="isOpen ? '' : null"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  language = 'yoruba';
  isOpen = true;
  text = '';

  onKeyPress(event: Event): void {
    this.text += (event as CustomEvent<{ char: string }>).detail.char;
  }
}
```

## Floating Mode

The `floating` attribute works the same way — use `[attr.floating]="isFloating ? '' : null"`:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <label> <input type="checkbox" [(ngModel)]="floating" /> Floating keyboard </label>
    <benin-keyboard
      language="yoruba"
      theme="auto"
      [attr.open]="isOpen ? '' : null"
      [attr.floating]="floating ? '' : null"
      (bboard-key-press)="onKeyPress($event)"
    ></benin-keyboard>
  `,
})
export class KeyboardDemoComponent {
  isOpen = true;
  floating = false;
  text = '';

  onKeyPress(event: Event): void {
    this.text += (event as CustomEvent<{ char: string }>).detail.char;
  }
}
```

When `floating` is set, the keyboard becomes a fixed overlay centered at the bottom of the viewport. A drag handle appears at the top — the user can drag it to any position on screen.

## Boolean Attribute Binding

Use a ternary to produce an empty string (present) or `null` (absent) for boolean attributes:

```html
<!-- Correct — present or absent, never "true"/"false" strings -->
<benin-keyboard [attr.disabled]="isDisabled ? '' : null"></benin-keyboard>
<benin-keyboard [attr.open]="isOpen ? '' : null"></benin-keyboard>
<benin-keyboard [attr.floating]="isFloating ? '' : null"></benin-keyboard>
```

## Change Detection with `OnPush`

When using `ChangeDetectionStrategy.OnPush`, Angular may not update the view after a custom event fires. Manually call `markForCheck()`:

```ts
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p>{{ text }}</p>
    <benin-keyboard (bboard-key-press)="onKeyPress($event)"></benin-keyboard>
  `,
})
export class KeyboardComponent {
  text = '';

  constructor(private cdr: ChangeDetectorRef) {}

  onKeyPress(e: Event) {
    this.text += (e as CustomEvent<{ char: string }>).detail.char;
    this.cdr.markForCheck();
  }
}
```

## All Events

| Event                    | Detail                                            | Description                 |
| ------------------------ | ------------------------------------------------- | --------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Keyboard engine initialized |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | A key was pressed           |
| `bboard-language-change` | `{ languageId: string }`                          | Active language changed     |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Theme changed               |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Error occurred              |

## CSS Custom Properties

```ts
@Component({
  styles: [`
    benin-keyboard {
      --bboard-color-surface-base: #1e1e1e;
      --bboard-color-surface-key: #2d2d2d;
      --bboard-color-text-primary: #ffffff;
    }
  `],
})
```

## Common Pitfalls

| Pitfall                                          | Cause                                                 | Fix                                                      |
| ------------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------- |
| `'benin-keyboard' is not a known element`        | Missing `CUSTOM_ELEMENTS_SCHEMA`                      | Add schema to every component using the keyboard         |
| Attribute has no effect                          | Using `[language]` instead of `[attr.language]`       | Always use `[attr.]` prefix for web component attributes |
| `disabled="true"` string set instead of presence | `[attr.disabled]="isDisabled"` with boolean           | Use `[attr.disabled]="isDisabled ? '' : null"`           |
| View not updated with `OnPush`                   | Angular doesn't detect custom events in `OnPush` mode | Call `cdr.markForCheck()` after handling the event       |
| Events fire but change detection doesn't run     | Zone.js / Shadow DOM interaction                      | Wrap handler body in `ngZone.run(...)`                   |

## Live Demo

<StackBlitzEmbed framework="angular" />

## Standalone Example

A complete working example is available at [`examples/angular-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/angular-sample-app).
