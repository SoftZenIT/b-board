# Dépannage

Ce guide couvre les problèmes les plus courants rencontrés lors de l'intégration de b-board et explique comment diagnostiquer et résoudre chacun d'eux.

## 1. Le clavier n'apparaît pas

**Symptômes :** L'élément `<benin-keyboard>` est présent dans le HTML mais s'affiche comme une boîte vide, un espace blanc ou rien du tout.

### Vérification 1 — Le package est importé

L'élément personnalisé doit être enregistré avant que le navigateur puisse le rendre. Importez b-board une fois dans le point d'entrée de votre application :

```javascript
import 'b-board'; // registers <benin-keyboard>
```

Sans cette importation, le navigateur traite `<benin-keyboard>` comme un élément HTML inconnu et n'affiche rien.

### Vérification 2 — Le CSS ne le masque pas

`display: none` ou `visibility: hidden` sur `benin-keyboard` ou un élément ancêtre masquera le clavier. Utilisez plutôt l'attribut `open` pour contrôler la visibilité :

```html
<!-- Visible -->
<benin-keyboard open language="yoruba"></benin-keyboard>

<!-- Masqué (mais toujours dans l'arbre d'accessibilité) -->
<benin-keyboard language="yoruba"></benin-keyboard>
```

Vérifiez également l'héritage de `overflow: hidden` ou la hauteur nulle sur les conteneurs parents.

### Vérification 3 — L'attribut `language` est valide

L'attribut `language` doit être l'un des identifiants de langue enregistrés : `yoruba`, `fon-adja`, `baatonum` ou `dendi`. Une valeur invalide provoque l'émission par l'élément d'un événement `bboard-error` et l'affichage d'un état d'erreur :

```html
<!-- Valide -->
<benin-keyboard language="yoruba"></benin-keyboard>

<!-- Invalide — déclenchera une erreur INVALID_LANGUAGE -->
<benin-keyboard language="french"></benin-keyboard>
```

---

## 2. Les caractères ne s'insèrent pas dans le champ de saisie

**Symptômes :** Le clavier s'affiche et les touches semblent répondre aux clics/appuis, mais rien n'apparaît dans le champ de texte.

### Vérification 1 — Le clavier est connecté au champ de saisie

b-board doit savoir dans quel élément de saisie écrire. Transmettez l'identifiant de l'élément cible via l'attribut `input-id`, ou connectez-le par programmation :

```html
<input id="my-input" type="text" />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Sans connexion, les appuis de touches déclenchent des événements `bboard-key-press` mais aucun caractère n'est inséré automatiquement.

### Vérification 2 — Le champ de saisie n'est pas désactivé ou en lecture seule

b-board respecte les états `disabled` et `readonly` des champs connectés. Si le champ est désactivé ou en lecture seule, les caractères ne seront pas insérés :

```html
<!-- Ce champ ne recevra pas de caractères -->
<input id="my-input" type="text" disabled />
<benin-keyboard input-id="my-input" language="yoruba"></benin-keyboard>
```

Supprimez `disabled` ou `readonly` du champ, ou écoutez `bboard-key-press` et gérez l'insertion manuellement.

---

## 3. Les marques de ton ne se composent pas

**Symptômes :** Appuyer sur une touche modificatrice de ton suivie d'une voyelle insère deux caractères séparés (ex. `` ` `` puis `a`) au lieu du caractère composé (`à`).

### Cause — Règle de composition manquante dans le profil de langue

Le moteur de composition ne peut produire des caractères composés que si une `CompositionRule` existe dans le profil de langue actif. Si la règle pour une paire déclencheur/base particulière est absente, le moteur revient à insérer les deux caractères séparément.

### Solution

Ouvrez `data/languages/<language-id>.json` et ajoutez la règle manquante dans `compositionRules` :

```json
{
  "compositionRules": [
    { "trigger": "`", "base": "a", "result": "à", "mode": "tone" },
    { "trigger": "`", "base": "A", "result": "À", "mode": "tone" }
  ]
}
```

Exécutez ensuite `npm run validate:data` pour confirmer que le profil est valide.

Consultez le [Guide de personnalisation des langues](/fr/guides/language-customization) pour une explication complète du fonctionnement des règles de composition.

---

## 4. `bboard-error` se déclenche au démarrage avec `DATA_LOAD_FAILED`

**Symptômes :** Le clavier émet un événement `bboard-error` immédiatement au chargement avec `code: "DATA_NOT_FOUND"`, `"HTTP_ERROR"` ou `"NETWORK_ERROR"`. Une bannière d'erreur apparaît à l'intérieur du clavier.

### Cause — Les fichiers de données ne sont pas servis

b-board récupère les fichiers JSON de profil de langue et de disposition au moment de l'exécution. Par défaut, il les cherche relativement à l'URL de la page. Si votre pipeline de build ne copie pas le répertoire `data/` vers la racine web, la récupération échouera.

### Solution — Copier les fichiers de données vers votre racine web

Assurez-vous que le répertoire `data/` est servi aux côtés de votre application. Avec Vite :

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'node_modules/b-board/data', dest: '.' }],
    }),
  ],
});
```

### Solution — Définir un `base-url` personnalisé

Si vos fichiers de données sont hébergés à un chemin différent ou sur un CDN, définissez l'attribut `base-url` :

```html
<benin-keyboard language="yoruba" base-url="https://cdn.example.com/b-board/"></benin-keyboard>
```

Écoutez l'événement d'erreur pour afficher un message à l'utilisateur :

```javascript
document.querySelector('benin-keyboard').addEventListener('bboard-error', (e) => {
  console.error(`[${e.detail.code}] ${e.detail.message}`);
  console.info('Suggestion:', e.detail.recoverySuggestion);
});
```

---

## 5. React : les événements personnalisés ne se déclenchent pas

**Symptômes :** Assigner `onBboardKeyPress` dans JSX ne déclenche jamais le gestionnaire.

### Cause

React 18 ne transmet pas les événements DOM personnalisés via son système d'événements synthétiques. `onBboardKeyPress` ne fonctionne qu'avec React 19+.

### Solution — Utiliser une ref avec addEventListener

```tsx
import { useRef, useEffect } from 'react';

function MyComponent() {
  const kbRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = kbRef.current;
    if (!el) return;

    const handler = (e: Event) => {
      const { char } = (e as CustomEvent).detail;
      console.log('Key pressed:', char);
    };

    el.addEventListener('bboard-key-press', handler);
    return () => el.removeEventListener('bboard-key-press', handler);
  }, []);

  return <benin-keyboard ref={kbRef} language="yoruba" />;
}
```

Retournez toujours la fonction de nettoyage depuis `useEffect` pour éviter les gestionnaires dupliqués lors d'un nouveau rendu.

Consultez [Problèmes React](/fr/guides/react) pour plus de problèmes spécifiques à React.

---

## 6. Vue : `<benin-keyboard>` traité comme un composant inconnu

**Symptômes :** Avertissement console Vue : `[Vue warn]: Failed to resolve component: benin-keyboard`

### Cause

Le compilateur de gabarits de Vue essaie de résoudre chaque balise comme un composant Vue. Sans la configuration `isCustomElement`, il avertit et peut altérer l'élément.

### Solution

Dans `vite.config.ts`, configurez le plugin Vue :

```typescript
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'benin-keyboard',
        },
      },
    }),
  ],
};
```

Pour Nuxt 3, ajoutez-le dans `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'benin-keyboard',
    },
  },
});
```

---

## 7. Angular : erreur de binding de gabarit

**Symptômes :** Erreur de build ou d'exécution Angular : `'benin-keyboard' is not a known element`

### Cause

Le compilateur de gabarits d'Angular valide tous les noms d'éléments par rapport à son registre de composants. Les Web Components n'y sont pas enregistrés par défaut.

### Solution

Ajoutez `CUSTOM_ELEMENTS_SCHEMA` à chaque composant (standalone) ou module qui utilise `<benin-keyboard>` :

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'b-board';

@Component({
  selector: 'app-keyboard-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<benin-keyboard [attr.language]="lang"></benin-keyboard>`,
})
export class KeyboardDemoComponent {
  lang = 'yoruba';
}
```

Pour les applications basées sur NgModule, ajoutez le schéma au module :

```typescript
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

Utilisez `[attr.language]` (et non `[language]`) pour définir l'attribut HTML plutôt qu'une propriété DOM — c'est plus fiable avec tous les Web Components.

---

## 8. Performance : premier rendu lent

**Symptômes :** Le clavier prend plusieurs secondes à apparaître au premier chargement, surtout sur les connexions lentes.

### Cause

b-board récupère les fichiers JSON de données la première fois qu'une langue est chargée. Sans en-têtes de mise en cache, chaque chargement de page ré-récupère ces fichiers.

### Solution — Définir des en-têtes de cache de longue durée sur les fichiers de données

Les fichiers de données sont versionnés et adressés par contenu — ils ne changent pas sans une montée de version. Configurez votre CDN ou serveur pour les servir avec de longues durées de mise en cache :

```
Cache-Control: public, max-age=31536000, immutable
```

### Solution — Utiliser le build CDN

Si vous chargez b-board depuis un CDN, il est livré avec un `base-url` préconfiguré qui pointe vers le point de terminaison des données du CDN. Les requêtes sont servies depuis des nœuds de périphérie proches de l'utilisateur et mises en cache de manière agressive.

### Solution — Précharger le fichier de données

Ajoutez un `<link rel="preload">` dans le `<head>` pour la langue que vous attendez de charger en premier :

```html
<link rel="preload" href="/data/languages/yoruba.json" as="fetch" crossorigin="anonymous" />
```

---

## 9. Activer la journalisation de débogage

Si vous avez besoin de journaux détaillés du moteur de composition, du chargement des données et des transitions de la machine à états, activez le mode débogage via `localStorage` :

```javascript
localStorage.setItem('bboard:debug', 'true');
```

Rechargez ensuite la page. b-board écrira des entrées de journal structurées dans la console du navigateur. Pour désactiver :

```javascript
localStorage.removeItem('bboard:debug');
```

Le mode débogage n'est jamais actif dans les builds de production qui ne détectent pas la clé `localStorage` — il n'y a aucun coût de performance lorsqu'il est désactivé.
