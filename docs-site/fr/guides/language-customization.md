# Personnalisation des langues

Ce guide explique comment ajouter une nouvelle langue à b-board ou modifier un profil de langue existant. Les profils de langue sont des fichiers JSON qui définissent les caractères utilisés par une langue, la correspondance entre les couches du clavier et les caractères, ainsi que les règles de composition applicables.

## Format JSON d'un profil de langue

Chaque langue est décrite par un seul fichier JSON situé dans `data/languages/<languageId>.json`. Ce fichier doit être conforme à `data/schemas/language-profile.schema.json`.

**Champs de niveau supérieur :**

| Champ              | Type                | Requis | Description                                                   |
| ------------------ | ------------------- | ------ | ------------------------------------------------------------- |
| `languageId`       | enum                | Oui    | L'une des valeurs : `yoruba`, `fon-adja`, `baatonum`, `dendi` |
| `name`             | string              | Oui    | Nom anglais de la langue                                      |
| `nativeName`       | string              | Oui    | Nom de la langue dans la langue elle-même                     |
| `characters`       | `KeyCatalogEntry[]` | Oui    | Tous les caractères associés aux touches de cette langue      |
| `compositionRules` | `CompositionRule[]` | Oui    | Règles de composition globales (niveau supérieur)             |

### Champs de KeyCatalogEntry

Chaque touche du clavier possède une entrée `KeyCatalogEntry` correspondante :

| Champ         | Type                | Requis | Description                                                              |
| ------------- | ------------------- | ------ | ------------------------------------------------------------------------ |
| `keyId`       | string              | Oui    | Identifiant de la touche, ex. `key-a`, `key-e-dot`, `key-enter`          |
| `baseChar`    | string              | Oui    | Caractère produit sur la couche de base (sans modificateur)              |
| `shiftChar`   | string              | Non    | Caractère produit lorsque Maj est enfoncée                               |
| `altGrChar`   | string              | Non    | Caractère produit lorsque AltGr est enfoncée                             |
| `composition` | `CompositionRule[]` | Non    | Règles de composition déclenchées depuis cette touche spécifique         |
| `longPress`   | string[]            | Non    | Liste ordonnée de caractères affichés dans le menu d'appui long (mobile) |

### Champs de CompositionRule

Une `CompositionRule` décrit comment une touche morte (modificateur de ton ou nasale) se combine avec un caractère de base pour produire un caractère composé :

| Champ     | Type   | Requis | Contraintes       | Description                                                                        |
| --------- | ------ | ------ | ----------------- | ---------------------------------------------------------------------------------- |
| `trigger` | string | Oui    |                   | Le caractère de touche morte qui arme le moteur de composition, ex. `´` ou `` ` `` |
| `base`    | string | Oui    |                   | Le caractère de base à combiner, ex. `a`                                           |
| `result`  | string | Oui    |                   | Le caractère composé résultant, ex. `á`                                            |
| `mode`    | enum   | Oui    | `tone` ou `nasal` | Type de composition                                                                |

**Modes de composition :**

- `tone` — applique un diacritique marquant la hauteur tonale (accent aigu ´, grave `` ` ``, macron ¯, circonflexe ^)
- `nasal` — applique un signe nasal en indice ou un tilde (~)

## Exemple concret : profil Yoruba

Le profil Yoruba (`data/languages/yoruba.json`) illustre l'apparence d'un profil de langue complet :

```json
{
  "languageId": "yoruba",
  "name": "Yoruba",
  "nativeName": "Yorùbá",
  "characters": [
    { "keyId": "key-a", "baseChar": "a", "shiftChar": "A", "longPress": ["à", "á"] },
    { "keyId": "key-e", "baseChar": "e", "shiftChar": "E", "longPress": ["è", "é", "ẹ"] },
    { "keyId": "key-s", "baseChar": "s", "shiftChar": "S", "altGrChar": "ṣ", "longPress": ["ṣ"] },
    { "keyId": "key-e-dot", "baseChar": "ẹ", "shiftChar": "Ẹ", "longPress": ["ẹ̀", "ẹ́"] },
    { "keyId": "key-o-dot", "baseChar": "ọ", "shiftChar": "Ọ", "longPress": ["ọ̀", "ọ́"] }
  ],
  "compositionRules": [
    { "trigger": "´", "base": "a", "result": "á", "mode": "tone" },
    { "trigger": "´", "base": "e", "result": "é", "mode": "tone" },
    { "trigger": "´", "base": "ẹ", "result": "ẹ́", "mode": "tone" },
    { "trigger": "`", "base": "a", "result": "à", "mode": "tone" },
    { "trigger": "`", "base": "e", "result": "è", "mode": "tone" },
    { "trigger": "`", "base": "ẹ", "result": "ẹ̀", "mode": "tone" }
  ]
}
```

À noter :

- `key-s` utilise `altGrChar` pour la variante avec point souscrit `ṣ`, en plus d'une entrée `longPress`
- `key-e-dot` et `key-o-dot` sont des touches supplémentaires pour les voyelles à point souscrit, fondamentales dans l'orthographe yoruba
- Les `compositionRules` au niveau supérieur couvrent les variantes minuscules et majuscules
- Les tableaux `longPress` sont ordonnés — la première entrée est mise en évidence par défaut

## Étape par étape : ajouter une nouvelle langue

### Étape 1 — Ajouter l'identifiant de langue au système de types

Ouvrez `src/public/types.ts` et ajoutez votre identifiant de langue au tuple `LANGUAGE_IDS` :

```typescript
const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi', 'ma-langue'] as const;
```

Le type union `LanguageId` et le prédicat `isLanguageId()` sont dérivés automatiquement de ce tuple — aucune autre modification de type n'est nécessaire.

### Étape 2 — Créer le fichier JSON du profil de langue

Créez `data/languages/ma-langue.json`. Au minimum, chaque entrée de touche doit avoir `keyId` et `baseChar` :

```json
{
  "languageId": "ma-langue",
  "name": "My Language",
  "nativeName": "Ma Langue",
  "characters": [
    { "keyId": "key-a", "baseChar": "a", "shiftChar": "A" },
    { "keyId": "key-e", "baseChar": "e", "shiftChar": "E", "longPress": ["è", "é"] }
  ],
  "compositionRules": [
    { "trigger": "´", "base": "e", "result": "é", "mode": "tone" },
    { "trigger": "`", "base": "e", "result": "è", "mode": "tone" }
  ]
}
```

### Étape 3 — Enregistrer la langue dans registry.json

Ouvrez `data/registry.json` et ajoutez une entrée dans le tableau `languages` :

```json
{
  "version": "1.0.0",
  "languages": [
    { "id": "yoruba",      "path": "data/languages/yoruba.json" },
    { "id": "fon-adja",   "path": "data/languages/fon-adja.json" },
    { "id": "baatonum",   "path": "data/languages/baatonum.json" },
    { "id": "dendi",       "path": "data/languages/dendi.json" },
    { "id": "ma-langue", "path": "data/languages/ma-langue.json" }
  ],
  "layouts": [...]
}
```

### Étape 4 — Régénérer les schémas

Exécutez le script d'initialisation pour mettre à jour l'enum du schéma JSON avec votre nouvel identifiant de langue :

```bash
npm run bootstrap:schemas
```

Les schémas versionnés contiennent des contraintes ajustées manuellement. Après l'exécution de cette commande, vérifiez les différences dans `data/schemas/language-profile.schema.json` pour vous assurer que ces contraintes sont préservées.

### Étape 5 — Valider

```bash
npm run validate:data
```

Cette commande exécute le validateur complet sur tous les profils de langue, les formes de disposition et le registre. Corrigez toutes les erreurs signalées avant de continuer.

## Fonctionnement du moteur de composition

Le moteur de composition implémente un modèle de **séquence de touche morte** — la même approche utilisée par les dispositions de clavier internationales sur macOS et Linux.

### État armé

Lorsque l'utilisateur appuie sur une touche dont le `baseChar` correspond à une valeur `trigger` dans les `compositionRules` de la langue active, le moteur entre en **état armé**. Aucun caractère n'est inséré pour l'instant.

En état armé :

- Le clavier marque visuellement la touche modificatrice comme active
- Une annonce est faite au lecteur d'écran (ex. « Modificateur de ton activé »)
- L'appui suivant est intercepté par le moteur au lieu d'être inséré directement

### Séquence de touche morte

À l'appui suivant, le moteur recherche une `CompositionRule` où :

- `trigger` correspond au caractère armé
- `base` correspond au caractère que la touche suivante produirait normalement

Si une règle correspondante existe, le moteur insère `result` dans le champ de saisie cible. Si aucune règle ne correspond, le moteur insère le caractère déclencheur suivi du caractère de base (comportement de repli), puis quitte l'état armé.

Appuyer sur Échap en état armé annule la composition sans rien insérer.

### Exemple : ton aigu sur « e » en yoruba

1. L'utilisateur appuie sur la touche `´` (accent aigu) → le moteur s'arme avec le déclencheur `´`
2. L'utilisateur appuie sur la touche `e` → le moteur recherche `{ trigger: "´", base: "e" }`
3. Correspondance trouvée : `result` est `é`
4. Le moteur insère `é` dans le champ connecté et repasse à l'état non armé

```
  TOUCHE : ´              TOUCHE : e
  ─────────────           ─────────────
  moteur armé             recherche : trigger=´, base=e
  (pas de sortie)         → résultat : é
                          → insertion de "é"
                          moteur non armé
```

### Emplacement des règles de composition

Les règles peuvent se trouver à deux niveaux dans le profil :

- **`compositionRules` au niveau supérieur** — appliquées indépendamment de la touche ayant déclenché la séquence. À utiliser pour les règles tonales à l'échelle de la langue.
- **`composition` par touche** sur une `KeyCatalogEntry` — appliquées uniquement lorsque cette touche spécifique est la base. À utiliser pour les touches avec un comportement de composition inhabituel.

Le moteur vérifie d'abord les règles par touche, puis revient aux règles du niveau supérieur.

## Erreurs courantes

| Erreur                                                  | Cause                                                          | Solution                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `languageId must be equal to one of the allowed values` | L'identifiant de langue n'est pas dans le tuple `LANGUAGE_IDS` | L'ajouter dans `src/public/types.ts` et relancer `bootstrap:schemas` |
| `characters/0: must have required property 'baseChar'`  | `baseChar` manquant sur une entrée de touche                   | Chaque `KeyCatalogEntry` doit avoir `keyId` et `baseChar`            |
| `mode must be equal to one of the allowed values`       | Mode invalide, ex. `'click'`                                   | Utiliser uniquement `'tone'` ou `'nasal'`                            |
| `version must match pattern`                            | Version non conforme au format semver `X.Y.Z`                  | Utiliser ex. `"1.0.0"`                                               |
| `must NOT have additional properties`                   | Champ supplémentaire absent du schéma                          | Supprimer ou renommer le champ inattendu                             |
