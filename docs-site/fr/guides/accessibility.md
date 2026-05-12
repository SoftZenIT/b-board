# Accessibilité

b-board est conçu pour atteindre le niveau **WCAG 2.1 AA** comme cible d'accessibilité de référence. Ce guide décrit ce qui est intégré, comment le tester et ce que les intégrateurs doivent faire pour maintenir une expérience accessible.

## Ce qui est intégré

### Navigation au clavier

L'élément clavier prend en charge une utilisation complète au clavier sans souris ni saisie tactile :

- **Tab / Maj+Tab** — déplace le focus à travers les touches dans l'ordre des rangées (pattern roving tabindex)
- **Touches fléchées** — naviguent dans la grille de touches en 2D ; le déplacement s'arrête aux bords
- **Entrée / Espace** — active la touche ciblée
- **Échap** — annule une composition active (état touche morte armée) ou ferme le menu d'appui long sur mobile
- **Indicateur de focus** — un `outline` de 2 px utilisant `--bboard-color-focus-ring` (#007aff en mode clair, #0a84ff en mode sombre) est visible sur toutes les touches ciblées, respectant le ratio de contraste minimum de 3:1 pour les composants d'interface non textuels (WCAG 2.1 §1.4.11)

### Rôles et étiquettes ARIA

- Chaque touche est rendue comme un élément `<button>`
- Le conteneur du clavier porte `role="group"` et une `aria-description` avec les instructions d'utilisation en français (« Utilisez Tab et les touches fléchées pour naviguer, Entrée ou Espace pour activer une touche »), langue principale des utilisateurs cibles en Afrique de l'Ouest francophone
- Le conteneur du clavier possède un attribut `lang` défini sur le code BCP 47 correspondant à la langue active (`yo` pour le yoruba, `fon` pour le fon/adja, `bba` pour le baatɔnum, `ddn` pour le dendi)
- Les touches d'action (Retour arrière, Maj, Entrée, AltGr) ont des valeurs `aria-label` lisibles, et non des étiquettes iconiques
- Les touches bascule (Maj, AltGr, Verr. Maj) portent `aria-pressed` pour refléter leur état actif ; les touches de caractère n'en ont pas

### Annonces au lecteur d'écran

Deux régions ARIA live (l'une polie, l'autre assertive) sont intégrées dans le shadow DOM. Elles annoncent :

| Événement               | Message (français)             | Niveau    |
| ----------------------- | ------------------------------ | --------- |
| Changement de langue    | « Langue : Yoruba »            | polite    |
| Modificateur tonal armé | « Modificateur de ton activé » | polite    |
| Modificateur nasal armé | « Modificateur nasal activé »  | polite    |
| Composition annulée     | « Modificateur annulé »        | polite    |
| Composition invalide    | « Combinaison invalide »       | assertive |

### Contraste élevé et mouvement réduit

- `@media (prefers-contrast: more)` — ajoute des ombres portées plus marquées et élargit les contours de focus à 3 px
- `@media (forced-colors: active)` — utilise les couleurs système CSS (`ButtonText`, `Highlight`, `HighlightText`) pour le mode Contraste élevé de Windows
- `@media (prefers-reduced-motion: reduce)` — désactive toutes les transitions et animations avec `transition: none !important`

## Tests avec axe-core

Le test d'accessibilité automatisé recommandé utilise `@axe-core/playwright` dans votre suite de tests Playwright.

**Installer la dépendance :**

```bash
npm install -D @axe-core/playwright
```

**Exemple de test :**

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
axe-core ne parcourt pas le shadow DOM par défaut dans toutes les configurations. Vérifiez que votre version de `AxeBuilder` prend en charge l'analyse du shadow DOM, ou utilisez l'option `include` pour cibler l'élément hôte.
:::

## Liste de contrôle pour les tests manuels

Parcourez ces scénarios avec un vrai lecteur d'écran (NVDA + Firefox sur Windows, VoiceOver + Safari sur macOS/iOS) avant chaque publication :

- [ ] Accéder au clavier par Tab depuis l'élément focusable précédent
- [ ] Le lecteur d'écran annonce le rôle du clavier et les instructions d'utilisation au premier focus
- [ ] Naviguer par Tab à travers toutes les touches — chacune annonce son étiquette (caractère ou nom de l'action)
- [ ] Appuyer sur une touche modificatrice de ton — le lecteur d'écran annonce « Modificateur de ton activé »
- [ ] Appuyer sur une voyelle — le lecteur d'écran annonce le caractère composé
- [ ] Appuyer sur Échap — le lecteur d'écran annonce « Modificateur annulé »
- [ ] Changer la langue via l'attribut — le lecteur d'écran annonce le nouveau nom de langue
- [ ] Activer le mode Contraste élevé Windows — toutes les touches restent visibles avec des bordures nettes
- [ ] Activer `prefers-reduced-motion` dans les paramètres du système — les animations de pression de touche sont absentes

## Bonnes pratiques pour les intégrateurs

### Étiqueter le champ de saisie connecté

b-board n'étiquette pas le champ de texte qui reçoit les frappes. Vous devez fournir une étiquette visible ou accessible :

```html
<!-- Étiquette visible -->
<label for="my-input">Saisir du texte en yoruba</label>
<input id="my-input" type="text" />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Sans étiquette, les utilisateurs de lecteurs d'écran arrivent sur le champ sans contexte sur ce qu'ils doivent saisir.

### Utiliser l'attribut `open`, pas `display: none`

Masquer le clavier avec `display: none` ou `visibility: hidden` empêche le navigateur de calculer les noms accessibles et retire l'élément complètement de l'arbre d'accessibilité. Utilisez l'attribut `open` à la place — b-board gère la transition d'affichage/masquage et maintient l'élément dans l'arbre d'accessibilité lorsqu'il est fermé :

```html
<!-- Afficher le clavier -->
<benin-keyboard open language="yoruba"></benin-keyboard>

<!-- Masquer le clavier — faites ceci, pas display:none -->
<benin-keyboard language="yoruba"></benin-keyboard>
```

### Exigences pour contenteditable

Si vous connectez le clavier à un élément `contenteditable`, assurez-vous que l'élément possède un nom accessible :

```html
<div
  role="textbox"
  aria-label="Éditeur de texte"
  aria-multiline="true"
  contenteditable="true"
  id="editor"
></div>
<benin-keyboard input-id="editor" language="yoruba"></benin-keyboard>
```

Sans `role="textbox"` et `aria-label`, les utilisateurs de lecteurs d'écran ne peuvent pas identifier la zone modifiable comme un champ de saisie.

### Ne pas supprimer les contours de focus

L'anneau de focus de b-board est rendu à l'intérieur du shadow DOM et ne peut pas être remplacé par des règles CSS de la page hôte ciblant `:focus-visible`. N'ajoutez pas `outline: none` à `benin-keyboard` lui-même — cela n'a aucun effet sur l'anneau de focus interne mais pourrait inadvertamment supprimer d'autres indicateurs de focus sur votre page.

## Note sur le contraste des couleurs

Le thème par défaut utilise les paires de couleurs de premier plan/arrière-plan suivantes pour les étiquettes de touches. Toutes les paires respectent le ratio minimum de 4,5:1 de WCAG 2.1 §1.4.3 pour le texte normal :

| Contexte                     | Premier plan | Arrière-plan | Ratio |
| ---------------------------- | ------------ | ------------ | ----- |
| Touche de caractère (clair)  | #1a1a2e      | #e2e4e9      | ≥ 7:1 |
| Touche d'action (clair)      | #1a1a2e      | #c8cdd8      | ≥ 5:1 |
| Touche de caractère (sombre) | #e8eaf0      | #1e2030      | ≥ 7:1 |
| Touche d'action (sombre)     | #e8eaf0      | #2a2d42      | ≥ 5:1 |

Si vous remplacez les tokens de design via des propriétés CSS personnalisées, vérifiez que vos combinaisons de couleurs maintiennent un ratio de contraste d'au moins 4,5:1 à l'aide d'un outil comme le [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
