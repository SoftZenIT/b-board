---
title: Intégration Angular
---

# Intégration Angular

Ce guide couvre l'intégration de `<benin-keyboard>` dans une application Angular utilisant des composants standalone (Angular 14+). Le clavier est un Web Component ; Angular nécessite une déclaration de schéma pour autoriser les éléments personnalisés dans les templates.

## Installation

```bash
npm install b-board
```

## Configuration

### 1. Enregistrer l'élément personnalisé

Importez `b-board` dans votre `main.ts` pour enregistrer l'élément avant le démarrage de l'application :

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import 'b-board';

bootstrapApplication(AppComponent);
```

### 2. Ajouter `CUSTOM_ELEMENTS_SCHEMA`

Sans `CUSTOM_ELEMENTS_SCHEMA`, le compilateur de templates Angular génère :

```
'benin-keyboard' is not a known element.
```

Ajoutez le schéma à chaque composant standalone qui utilise `<benin-keyboard>` :

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

Pour les applications basées sur NgModule, ajoutez-le au module à la place :

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [KeyboardDemoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

## Déclaration de type TypeScript

Ajoutez une déclaration de type globale pour que TypeScript reconnaisse l'élément :

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

## Utilisation de base dans un template

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

> **Important :** Utilisez `[attr.language]` et non `[language]`. La liaison `[property]` d'Angular définit la propriété DOM ; `[attr.]` définit l'attribut HTML. Les Web Components réagissent généralement aux changements d'attributs via `attributeChangedCallback`, donc utilisez toujours `[attr.]` pour plus de fiabilité.

## Liaison `[(ngModel)]`

`ngModel` fonctionne sur les éléments `<textarea>` et `<input>`, pas sur le clavier lui-même. Associez `ngModel` sur votre élément de texte avec un écouteur `bboard-key-press` :

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

## Modèle de liaison bidirectionnelle

Pour une liaison bidirectionnelle complète où le champ de texte et le clavier restent synchronisés, utilisez un signal (Angular 17+) ou une propriété ordinaire :

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

## Changement de langue

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

## Afficher et masquer le clavier

Liez `[attr.open]` à un ternaire pour que l'attribut soit présent (chaîne vide) ou absent (`null`) :

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
      {{ isOpen ? 'Masquer le clavier' : 'Afficher le clavier' }}
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

## Mode flottant

L'attribut `floating` fonctionne de la même manière — utilisez `[attr.floating]="isFloating ? '' : null"` :

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <label> <input type="checkbox" [(ngModel)]="floating" /> Clavier flottant </label>
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

Lorsque `floating` est défini, le clavier devient une superposition fixe centrée en bas de la fenêtre. Une poignée de déplacement apparaît en haut — l'utilisateur peut la faire glisser vers n'importe quelle position.

## Liaison d'attributs booléens

Utilisez un ternaire pour produire une chaîne vide (présent) ou `null` (absent) pour les attributs booléens :

```html
<!-- Correct — présent ou absent, jamais les chaînes "true"/"false" -->
<benin-keyboard [attr.disabled]="isDisabled ? '' : null"></benin-keyboard>
<benin-keyboard [attr.open]="isOpen ? '' : null"></benin-keyboard>
<benin-keyboard [attr.floating]="isFloating ? '' : null"></benin-keyboard>
```

## Détection de changements avec `OnPush`

Lors de l'utilisation de `ChangeDetectionStrategy.OnPush`, Angular peut ne pas mettre à jour la vue après le déclenchement d'un événement personnalisé. Appelez `markForCheck()` manuellement :

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

## Tous les événements

| Événement                | Détail                                            | Description                  |
| ------------------------ | ------------------------------------------------- | ---------------------------- |
| `bboard-ready`           | `{ state: KeyboardState }`                        | Moteur de clavier initialisé |
| `bboard-key-press`       | `{ keyId: string, char: string }`                 | Une touche a été pressée     |
| `bboard-language-change` | `{ languageId: string }`                          | Langue active changée        |
| `bboard-theme-change`    | `{ theme, effectiveTheme }`                       | Thème changé                 |
| `bboard-error`           | `{ code, severity, message, recoverySuggestion }` | Une erreur s'est produite    |

## Propriétés CSS personnalisées

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

## Pièges courants

| Problème                                                         | Cause                                                                | Solution                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `'benin-keyboard' is not a known element`                        | `CUSTOM_ELEMENTS_SCHEMA` manquant                                    | Ajouter le schéma à chaque composant utilisant le clavier      |
| L'attribut n'a aucun effet                                       | Utilisation de `[language]` au lieu de `[attr.language]`             | Toujours utiliser le préfixe `[attr.]` pour les Web Components |
| La chaîne `"true"` est définie au lieu de la présence            | `[attr.disabled]="isDisabled"` avec un booléen                       | Utiliser `[attr.disabled]="isDisabled ? '' : null"`            |
| Vue non mise à jour avec `OnPush`                                | Angular ne détecte pas les événements personnalisés en mode `OnPush` | Appeler `cdr.markForCheck()` après la gestion de l'événement   |
| Les événements se déclenchent mais la détection ne s'exécute pas | Interaction Zone.js / Shadow DOM                                     | Envelopper le corps du gestionnaire dans `ngZone.run(...)`     |

## Démonstration en direct

<StackBlitzEmbed framework="angular" />

## Exemple autonome

Un exemple fonctionnel complet est disponible dans [`examples/angular-sample-app/`](https://github.com/b-board/b-board/tree/main/examples/angular-sample-app).
