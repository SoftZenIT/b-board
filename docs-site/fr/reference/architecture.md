---
title: Architecture
---

# Architecture

b-board est une bibliothèque de clavier virtuel agnostique aux frameworks pour les langues africaines béninoises. Le code est organisé en six couches avec des règles de dépendances strictement unidirectionnelles.

## Vue d'ensemble des couches

```
┌─────────────────────────────────────────────────┐
│                  API Publique                   │
│            src/public/index.ts                  │
│  (point d'entrée unique — la seule chose        │
│   que les consommateurs peuvent importer)       │
└──────────────┬──────────────┬───────────────────┘
               │              │
   ┌───────────▼──┐   ┌───────▼──────────┐
   │  Moteur      │   │ Moteur de        │
   │  Noyau       │   │ Composition      │
   │  src/core/   │   │ src/composition/ │
   └───────┬──────┘   └───────┬──────────┘
           │                  │
   ┌───────▼──────────────────▼──────────────────┐
   │              Rendus UI                      │
   │  src/ui/desktop/    src/ui/mobile/          │
   │  (Lit Web Components — agnostiques)         │
   └───────────────────────┬─────────────────────┘
                           │
   ┌───────────────────────▼─────────────────────┐
   │                 Adaptateurs                 │
   │   src/adapters/  (input / textarea /        │
   │                   contenteditable)          │
   └───────────────────────┬─────────────────────┘
                           │
   ┌───────────────────────▼─────────────────────┐
   │             Couche de données               │
   │  src/data/  (chargement JSON, validation    │
   │              AJV, résolution de disposition) │
   └─────────────────────────────────────────────┘
```

---

## Règle de frontière de module

**Les consommateurs ne doivent importer que depuis `b-board`**, qui pointe vers `src/public/index.ts`. Les imports directs depuis tout chemin interne (`src/core/`, `src/data/`, etc.) sont interdits et appliqués par une règle ESLint qui fait échouer la CI en cas de violation.

Dans l'arbre source, la direction des dépendances est strictement unidirectionnelle :

```
public
  └─► data
        └─► core  ◄── composition
                   └─► ui
                         └─► adapters
```

| Module        | Peut importer depuis | Ne doit PAS importer depuis           |
| ------------- | -------------------- | ------------------------------------- |
| `public`      | rien                 | data, core, composition, adapters, ui |
| `data`        | public               | core, composition, adapters, ui       |
| `core`        | data, public         | composition, adapters, ui             |
| `composition` | data, public         | core, adapters, ui                    |
| `adapters`    | core, public         | composition, ui                       |
| `ui`          | core, public         | data, composition, adapters           |

Consultez [ADR-0002](https://github.com/b-board/b-board/blob/main/docs/adr/0002-module-boundaries.md) pour la justification de cette règle.

---

## Moteur Noyau (`src/core/`)

Le moteur noyau est une machine à états qui gère le cycle de vie du clavier. Il n'a pas de dépendances d'I/O ; toutes les données externes arrivent via l'interface de la Couche de données.

### États

La machine possède cinq états de niveau supérieur :

| État        | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| `idle`      | Clavier monté mais aucune cible ciblée                        |
| `ready`     | Cible ciblée ; clavier acceptant les événements de touche     |
| `composing` | Une touche morte a été armée ; attente de la touche de base   |
| `error`     | Une erreur irrécupérable a été interceptée ; clavier suspendu |
| `destroyed` | L'instance a été démontée ; tous les écouteurs supprimés      |

L'état `composing` a deux sous-états : `tone-armed` et `nasal-armed` (voir [Moteur de Composition](#moteur-de-composition-srccomposition) ci-dessous).

### Événements du cycle de vie

| Événement           | Déclenché lorsque                                 |
| ------------------- | ------------------------------------------------- |
| `ready`             | L'élément cible reçoit le focus                   |
| `blur`              | L'élément cible perd le focus                     |
| `key-press`         | Une touche est tapée ou cliquée                   |
| `composition-start` | Une touche morte est armée                        |
| `composition-end`   | La composition se résout en sortie ou est annulée |
| `error`             | Une erreur est interceptée dans le moteur         |
| `destroy`           | `keyboard.destroy()` est appelé                   |

### Gestionnaire d'erreurs

Les erreurs dans le moteur sont interceptées en interne et transmises à un callback `onError` optionnel fourni lors de la construction. Lorsqu'aucun gestionnaire n'est fourni, l'erreur est relancée. La machine passe à l'état `error` et cesse de traiter les événements de touche jusqu'à ce qu'elle soit explicitement réinitialisée ou détruite.

---

## Moteur de Composition (`src/composition/`)

Le Moteur de Composition gère la saisie à touche morte pour les marques tonales et les voyelles nasales communes dans les langues prises en charge (Yoruba, Fon/Adja, Baatɔnum, Dendi).

### Machine à états touche morte

```
         ┌────────────────────────────────────────┐
         │                 none                   │◄──┐
         └─────────┬──────────────────────────────┘   │
                   │                                   │
       tone key    │            nasal key              │ cancel / resolve
                   ▼                                   │
         ┌─────────────────┐   ┌──────────────────┐   │
         │   tone-armed    │   │   nasal-armed    ├───┘
         └─────────────────┘   └──────────────────┘
```

- **`none`** — aucune touche morte en attente.
- **`tone-armed`** — une touche modificatrice de ton a été pressée ; la prochaine touche de caractère de base recevra la marque tonale.
- **`nasal-armed`** — une touche modificatrice nasale a été pressée ; la prochaine touche de caractère de base recevra la marque nasale.

Lorsque l'état armé reçoit une touche de base compatible, le moteur résout la combinaison en un seul point de code Unicode et l'émet. Lorsqu'il reçoit une touche incompatible ou une seconde pression de modificateur, le modificateur en attente est annulé et le traitement normal reprend.

---

## Rendus UI (`src/ui/`)

Toute l'interface est rendue sous forme de **Lit Web Components** (`lit` v3). Cela signifie que l'élément clavier (`<benin-keyboard>`) fonctionne dans n'importe quel framework hôte sans wrappers, car c'est un Custom Element standard enregistré dans le navigateur.

### Rendu bureau (`src/ui/desktop/`)

Implémente la disposition clavier pleine largeur basée sur AZERTY. Le pipeline de rendu sépare les données de la présentation :

1. `src/data/` charge le JSON et le résout en un `ResolvedLayout`.
2. `src/ui/desktop/render-model.ts` dérive un `DesktopRenderModel` pur depuis `ResolvedLayout` et le `DesktopRenderState` actuel.
3. `src/ui/desktop/key.ts` / `src/ui/desktop/rows.ts` convertissent le modèle de rendu en objets Lit `TemplateResult`.
4. `src/element/benin-keyboard.ts` est la coque publique légère : elle gère le cycle de vie, le chargement des données, l'intégration du thème et l'enregistrement des événements clavier.

L'écho physique des touches et l'état de focus sont gérés par `src/ui/state/desktop-state.ts` et `src/ui/state/focus-controller.ts`. Voir [ADR-0003](https://github.com/b-board/b-board/blob/main/docs/adr/0003-desktop-renderer-boundary.md) pour la motivation derrière le design à coque légère.

### Rendu mobile (`src/ui/mobile/`)

Fournit une disposition compacte optimisée pour le tactile. Partage le même pipeline de modèle de rendu mais affiche des rangées optimisées pour les fenêtres plus petites avec des zones de tap plus grandes.

---

## Adaptateurs (`src/adapters/`)

Les adaptateurs font le pont entre le clavier et les éléments hôtes natifs. Chaque adaptateur écoute les événements de sortie du Moteur Noyau et écrit les caractères dans la cible.

| Adaptateur               | Type d'élément cible                             |
| ------------------------ | ------------------------------------------------ |
| `InputAdapter`           | `<input type="text">` et `<input type="search">` |
| `TextareaAdapter`        | `<textarea>`                                     |
| `ContentEditableAdapter` | Tout élément avec `contenteditable`              |

Tous les adaptateurs partagent une interface commune définie dans `src/public/`. L'`AdapterRegistry` (dans `src/adapters/`) sélectionne automatiquement l'adaptateur correct en fonction du type d'élément cible.

---

## Couche de données (`src/data/`)

La couche de données est un ensemble de modules à fonctions pures suivant la convention de module plat de [ADR-0001](https://github.com/b-board/b-board/blob/main/docs/adr/0001-flat-module-structure.md) (un fichier par préoccupation, pas d'héritage).

| Module                 | Responsabilité                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `loader.ts`            | Récupère le JSON de langue via le bundler ou le transport URL ; cache au niveau fichier                           |
| `validator.ts`         | Validation JSON Schema basée sur AJV des profils de langue et des fichiers de disposition                         |
| `type-guards.ts`       | Prédicats booléens `is*` pour le narrowing de type au moment de l'exécution                                       |
| `integrity-checker.ts` | Vérifications de cohérence entre fichiers (ex., chaque clé référencée dans une disposition existe dans le keyMap) |
| `layout-resolver.ts`   | Construit un `ResolvedLayout` depuis le JSON brut ; cache LRU                                                     |

### Chargement JSON

Les profils de langue sont des fichiers JSON. Le chargeur prend en charge deux transports :

- **Transport bundler** — le fichier est importé comme un asset statique (Vite / webpack).
- **Transport fetch** — le fichier est récupéré au moment de l'exécution via `fetch()`.

### Validation AJV

Chaque profil de langue est validé par rapport à un JSON Schema en utilisant **AJV** avant utilisation. Les fichiers invalides lèvent une `DataError` structurée avec un code lisible par machine et un message lisible par l'humain. AJV a été choisi pour son optimisation de schéma au moment de la compilation et son empreinte zéro-dépendance. Voir [Décisions de conception](#decisions-de-conception) ci-dessous.

### Résolution de disposition

`layout-resolver.ts` prend le JSON brut et résout les références croisées (ex., résolution des IDs de touches vers leurs définitions complètes) en un objet `ResolvedLayout` plat consommé par les rendus UI. Le résolveur est mémoïsé avec un cache LRU indexé sur l'ID de langue + la variante de disposition.

---

## Décisions de conception

### Pourquoi Lit ?

L'interface du clavier doit fonctionner dans React, Vue, Angular et en HTML simple sans exiger que les consommateurs installent des packages wrappers spécifiques aux frameworks. Les Lit Web Components sont des Custom Elements standard — ils sont enregistrés une fois dans le navigateur et utilisables dans n'importe quel contexte. Cela évite la charge de maintenance de packages de composants React, Vue et Angular séparés. Voir [ADR-0002](https://github.com/b-board/b-board/blob/main/docs/adr/0002-module-boundaries.md).

### Pourquoi pas de framework dans le moteur noyau ?

La machine à états `src/core/` est du TypeScript pur sans dépendances d'exécution. Cela maintient le bundle petit, rend le moteur trivialement testable (pas de DOM requis), et signifie que le moteur peut fonctionner dans Node.js ou Web Workers à l'avenir.

### Pourquoi AJV ?

AJV compile les JSON Schemas en fonctions de validation optimisées au moment de l'initialisation, rendant la validation répétée essentiellement gratuite à l'exécution. Son mode strict détecte les erreurs de définition de schéma tôt. Des alternatives comme Zod ou Yup ont été considérées mais introduisent des bundles plus volumineux ; la sortie compilée d'AJV est tree-shakeable.

### Pourquoi un `KeyId` brandé ?

```ts
type KeyId = string & { readonly __brand: 'KeyId' };
```

Le branding empêche les chaînes brutes d'être accidentellement passées là où un `KeyId` est attendu. TypeScript détecte le décalage au moment de la compilation, éliminant toute une classe de bugs de recherche de touche sans aucun overhead à l'exécution.

---

## Journal des ADR

Les Architecture Decision Records se trouvent dans [`docs/adr/`](https://github.com/b-board/b-board/blob/main/docs/adr/) :

- [ADR-0001 — Structure de module plat pour `src/data/`](https://github.com/b-board/b-board/blob/main/docs/adr/0001-flat-module-structure.md)
- [ADR-0002 — Frontières de module et séparation des couches](https://github.com/b-board/b-board/blob/main/docs/adr/0002-module-boundaries.md)
- [ADR-0003 — Coque d'élément légère pour le rendu bureau](https://github.com/b-board/b-board/blob/main/docs/adr/0003-desktop-renderer-boundary.md)
