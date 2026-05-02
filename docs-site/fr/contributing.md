# Contribuer à b-board

Merci de l'intérêt que vous portez à ce projet. Ce document couvre tout ce dont vous avez besoin pour démarrer, depuis la configuration de votre environnement de développement jusqu'à l'ouverture d'une pull request.

## Configuration du développement

### Prérequis

- **Node.js** 20 ou version ultérieure
- **npm** 10 ou version ultérieure

### Cloner et installer

```bash
git clone <repo-url>
cd b-board
npm install
```

### Commandes du quotidien

| Commande                | Objectif                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Démarrer le serveur de développement Vite avec rechargement à chaud |
| `npm run test`          | Exécuter les tests unitaires en mode surveillance (Vitest)          |
| `npm run test:ci`       | Exécuter les tests unitaires une fois avec rapport de couverture    |
| `npm run test:ui`       | Ouvrir l'interface Vitest dans le navigateur                        |
| `npm run e2e`           | Exécuter les tests de bout en bout Playwright                       |
| `npm run lint`          | Vérifier les erreurs ESLint                                         |
| `npm run format`        | Formater automatiquement avec Prettier                              |
| `npm run type-check`    | Validation complète des types TypeScript                            |
| `npm run build`         | Produire `dist/bboard.es.js` et `dist/bboard.umd.js`                |
| `npm run validate:data` | Valider tous les fichiers JSON de langues et de dispositions        |
| `npm run docs:dev`      | Démarrer le site de documentation VitePress en mode développement   |
| `npm run docs:build`    | Construire le site de documentation statique                        |

## Structure du projet

```
b-board/
├── src/
│   ├── core/           # Machine à états, bus d'événements, cycle de vie
│   ├── data/           # Chargement des données, validation des schémas, factories de types
│   ├── composition/    # Moteur de composition à touche morte
│   ├── ui/             # Gabarits Lit pour les dispositions bureau et mobile
│   │   ├── desktop/    # Modèle de rendu et gabarits pour bureau
│   │   └── mobile/     # Modèle de rendu et gabarits pour mobile
│   ├── adapters/       # Adaptateurs spécifiques aux frameworks (si applicable)
│   ├── security/       # Désinfection des entrées et helpers CSP
│   └── public/         # Surface de l'API publique — types.ts, index.ts
├── data/
│   ├── languages/      # Fichiers JSON des profils de langue
│   ├── layouts/        # Fichiers JSON des formes de disposition
│   ├── schemas/        # Fichiers JSON Schema (faisant autorité)
│   └── registry.json   # Registre maître des langues et dispositions
├── tests/
│   ├── unit/           # Tests unitaires Vitest (seuil de couverture : 90%)
│   ├── e2e/            # Tests de bout en bout Playwright
│   └── a11y/           # Tests d'accessibilité Playwright + axe-core
├── docs-site/          # Source de la documentation VitePress
└── docs/               # Documents de conception et spécifications internes
```

## Normes de codage

### TypeScript

- `strict: true` est appliqué — pas de `any`, pas d'`any` implicite
- Tous les symboles exportés doivent avoir des commentaires TSDoc selon la norme suivante :

````typescript
/**
 * Loads a keyboard layout from JSON.
 *
 * @param languageId - One of the registered language IDs
 * @returns The resolved keyboard layout
 * @throws {KeyboardLoadError} If the layout file is missing or invalid
 *
 * @example
 * ```ts
 * const layout = await loadLayout('yoruba')
 * ```
 */
export async function loadLayout(languageId: LanguageId): Promise<ResolvedLayout> { ... }
````

### Frontières de module

Le projet applique des règles de frontières de module via ESLint. Les règles clés sont :

- Le code dans `src/public/` ne peut pas importer depuis des modules internes
- Le code dans `src/ui/` ne peut pas importer depuis `src/core/` directement — utilisez les interfaces adaptateurs
- `src/data/` et `src/composition/` sont internes ; ne réexportez pas leurs types depuis `src/public/`

ESLint détectera les violations : exécutez `npm run lint` avant chaque PR.

### Format des messages de commit

Suivez les [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat(core): add state machine transition validation
fix(data): handle missing language profile gracefully
test(ui): add desktop keyboard render snapshot
docs(architecture): update module boundary diagram
```

Format : `type(scope): description courte`

Types valides : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `perf`

## Exigences de test

### Tests unitaires

- Tous les tests unitaires se trouvent dans `tests/unit/`
- La couverture ne doit pas diminuer — le seuil est de 90% de couverture par lignes
- Exécutez `npm run test:ci` pour voir la sortie de couverture
- Les tests utilisent [Vitest](https://vitest.dev/) avec happy-dom

### Tests E2E

- Les tests E2E se trouvent dans `tests/e2e/` et utilisent [Playwright](https://playwright.dev/)
- Exécutez `npm run e2e` en local ; la CI exécute la même suite
- Chaque intégration framework (React, Vue, Angular, Vanilla) a un fichier E2E correspondant

### Tests d'accessibilité

- Les tests A11y se trouvent dans `tests/a11y/` et utilisent `@axe-core/playwright`
- Toute modification de l'interface ne doit pas introduire de violations axe-core
- Exécuter : `npm run e2e -- --project=a11y` (ou configurer votre filtre de projet Playwright)

## Ajouter une langue

L'ajout d'une langue nécessite des modifications du système de types et de la couche de données. Consultez le guide complet dans le [Guide de personnalisation des langues](/fr/guides/language-customization).

En résumé :

1. Ajouter l'identifiant de langue dans `LANGUAGE_IDS` dans `src/public/types.ts`
2. Créer `data/languages/<id>.json` conforme au schéma de profil de langue
3. Ajouter une entrée dans `data/registry.json`
4. Exécuter `npm run bootstrap:schemas` pour régénérer les enums JSON Schema
5. Exécuter `npm run validate:data` et corriger les erreurs éventuelles

## Processus de pull request

### Avant de commencer

1. Vérifier le gestionnaire de tickets et le board Jira pour éviter les doublons
2. Pour les modifications significatives, ouvrir d'abord un ticket ou un issue Jira pour discuter de l'approche

### Nommage des branches

Créez votre branche depuis `develop` en utilisant le modèle :

```
feat/BBOARD-XX-description-courte
fix/BBOARD-XX-description-courte
docs/BBOARD-XX-description-courte
```

Exemple : `feat/BBOARD-107-documentation`

### Avant d'ouvrir une PR

Exécutez la suite de vérification complète en local :

```bash
npm run lint && npm run type-check && npm run test:ci && npm run build
```

Les quatre commandes doivent passer sans erreur.

### Liste de contrôle PR

- [ ] La branche est à jour avec `develop`
- [ ] `npm run lint` passe
- [ ] `npm run type-check` passe
- [ ] `npm run test:ci` passe et la couverture n'a pas diminué
- [ ] `npm run build` réussit
- [ ] Les nouveaux symboles publics ont des commentaires TSDoc
- [ ] La description de la PR référence le ticket Jira : `Closes BBOARD-XX`

### Révision

- Les PRs nécessitent une approbation avant la fusion
- La CI doit passer (lint, vérification de types, tests unitaires, tests E2E)
- Traitez tous les commentaires de révision avant de demander une nouvelle révision

### Workflow Jira

- Marquez la tâche **En cours** lorsque vous commencez le travail
- Marquez-la **En révision** lorsque la PR est ouverte
- Marquez-la **Terminée** après la fusion de la PR

## Code de conduite

Nous nous engageons à faire de b-board un projet accueillant pour les contributeurs de tous horizons, en particulier ceux issus des communautés d'Afrique de l'Ouest dont les langues sont servies par cette bibliothèque.

**Comportements attendus :**

- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et les expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur ce qui est le mieux pour le projet et ses utilisateurs

**Comportements inacceptables :**

- Harcèlement ou langage discriminatoire de toute nature
- Attaques personnelles ou insultes
- Publication des informations privées d'autrui sans consentement
- Tout comportement considéré comme inapproprié dans un cadre professionnel

Les cas de comportement inacceptable peuvent être signalés en ouvrant un ticket privé ou en contactant directement les mainteneurs. Tous les signalements seront examinés et traités rapidement.
