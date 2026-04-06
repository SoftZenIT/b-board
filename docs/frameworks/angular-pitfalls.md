# Angular Common Pitfalls

Common issues when using `<benin-keyboard>` in Angular applications and how to fix them.

## 1. Missing CUSTOM_ELEMENTS_SCHEMA

**Problem:** Without `CUSTOM_ELEMENTS_SCHEMA`, Angular's template compiler doesn't recognize `<benin-keyboard>` and throws an error.

```
'benin-keyboard' is not a known element:
1. If 'benin-keyboard' is an Angular component, verify it is part of this module.
2. If 'benin-keyboard' is a Web Component, add 'CUSTOM_ELEMENTS_SCHEMA' to '@Component.schemas'.
```

**Solution:** Add `CUSTOM_ELEMENTS_SCHEMA` to every component that uses the keyboard:

```ts
// ✅ Correct — schema declared
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<benin-keyboard></benin-keyboard>`,
})
export class KeyboardDemoComponent {}
```

For NgModule apps, add it to the module:

```ts
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

## 2. Using `[property]` Instead of `[attr.property]`

**Problem:** Angular's `[property]` binding sets the DOM property, not the HTML attribute. Web components often rely on attribute reflection for their reactive properties.

```html
<!-- ❌ May not work — sets DOM property, not attribute -->
<benin-keyboard [language]="lang"></benin-keyboard>
```

**Solution:** Use `[attr.property]` to set HTML attributes:

```html
<!-- ✅ Correct — sets HTML attribute -->
<benin-keyboard [attr.language]="lang"></benin-keyboard>
```

> **Note:** Lit-based web components like `<benin-keyboard>` do support both property and attribute setting. However, using `[attr.]` is more explicit and works consistently with all web components.

## 3. Change Detection Not Triggered by Custom Events

**Problem:** When using `OnPush` change detection strategy, custom element events may not trigger change detection because Angular doesn't know about them.

```ts
// ❌ UI may not update after key press
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>{{ text }}</p>
    <benin-keyboard (bboard-key-press)="onKeyPress($event)"></benin-keyboard>
  `,
})
export class KeyboardComponent {
  text = '';
  onKeyPress(e: Event) {
    this.text += (e as CustomEvent).detail.char;
    // ❌ View not updated with OnPush
  }
}
```

**Solution:** Manually trigger change detection:

```ts
// ✅ Correct — mark for check
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class KeyboardComponent {
  text = '';

  constructor(private cdr: ChangeDetectorRef) {}

  onKeyPress(e: Event) {
    this.text += (e as CustomEvent).detail.char;
    this.cdr.markForCheck(); // Trigger change detection
  }
}
```

## 4. Zone.js Event Patching Issues

**Problem:** Zone.js patches DOM event listeners to integrate with Angular's change detection. In rare cases, this can interfere with custom element events, especially if the events are dispatched from within a Shadow DOM.

**Symptoms:** Events fire but change detection doesn't run, or events fire multiple times.

**Solution:** Ensure events are dispatched with `composed: true` (which `<benin-keyboard>` already does). If issues persist, run the handler inside Angular's zone:

```ts
import { NgZone } from '@angular/core';

@Component({
  /* ... */
})
export class KeyboardComponent {
  constructor(private ngZone: NgZone) {}

  onKeyPress(e: Event) {
    this.ngZone.run(() => {
      this.text += (e as CustomEvent).detail.char;
    });
  }
}
```

## 5. Boolean Attribute Binding Confusion

**Problem:** Angular's `[attr.disabled]` binding doesn't work intuitively with boolean attributes. Setting it to `false` removes the attribute, but setting it to `true` adds `disabled="true"` (string).

```html
<!-- ❌ Adds disabled="true" (string) or removes it -->
<benin-keyboard [attr.disabled]="isDisabled"></benin-keyboard>
```

**Solution:** Use a ternary to set the attribute to an empty string (truthy) or `null` (removes it):

```html
<!-- ✅ Correct — present or absent -->
<benin-keyboard [attr.disabled]="isDisabled ? '' : null"></benin-keyboard>
```

## 6. AOT Compilation Stripping Attributes

**Problem:** Angular's AOT (Ahead-of-Time) compiler may optimize away attributes it considers unnecessary, particularly when using `CUSTOM_ELEMENTS_SCHEMA` which relaxes template validation.

**Symptoms:** Attributes are present in the template but missing from the rendered HTML.

**Solution:** Use `[attr.]` binding instead of static attributes when you see this behavior:

```html
<!-- Instead of static attribute -->
<benin-keyboard language="yoruba"></benin-keyboard>

<!-- Use binding -->
<benin-keyboard [attr.language]="'yoruba'"></benin-keyboard>
```

This forces Angular to explicitly set the attribute at runtime.
