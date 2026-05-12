# Language Customization

This guide explains how to add a new language to b-board or modify an existing language profile. Language profiles are JSON files that define which characters a language uses, how the keyboard layers map to characters, and which composition rules apply.

## Language Profile JSON Format

Each language is described by a single JSON file at `data/languages/<languageId>.json`. The file must conform to `data/schemas/language-profile.schema.json`.

**Top-level fields:**

| Field              | Type                | Required | Description                                       |
| ------------------ | ------------------- | -------- | ------------------------------------------------- |
| `languageId`       | enum                | Yes      | One of: `yoruba`, `fon-adja`, `baatonum`, `dendi` |
| `name`             | string              | Yes      | English name of the language                      |
| `nativeName`       | string              | Yes      | Name in the language itself                       |
| `characters`       | `KeyCatalogEntry[]` | Yes      | All keyed characters for this language            |
| `compositionRules` | `CompositionRule[]` | Yes      | Top-level (global) composition rules              |

### KeyCatalogEntry Fields

Every key on the keyboard has a corresponding `KeyCatalogEntry`:

| Field         | Type                | Required | Description                                                       |
| ------------- | ------------------- | -------- | ----------------------------------------------------------------- |
| `keyId`       | string              | Yes      | Key identifier, e.g. `key-a`, `key-e-dot`, `key-enter`            |
| `baseChar`    | string              | Yes      | Character produced on the base layer (no modifier held)           |
| `shiftChar`   | string              | No       | Character produced when Shift is held                             |
| `altGrChar`   | string              | No       | Character produced when AltGr is held                             |
| `composition` | `CompositionRule[]` | No       | Composition rules triggered from this specific key                |
| `longPress`   | string[]            | No       | Ordered list of characters shown in the long-press popup (mobile) |

### CompositionRule Fields

A `CompositionRule` describes how a dead key (tone or nasal modifier) combines with a base character to produce a composed character:

| Field     | Type   | Required | Constraints       | Description                                                                  |
| --------- | ------ | -------- | ----------------- | ---------------------------------------------------------------------------- |
| `trigger` | string | Yes      |                   | The dead-key character that arms the composition engine, e.g. `´` or `` ` `` |
| `base`    | string | Yes      |                   | The base character to combine with, e.g. `a`                                 |
| `result`  | string | Yes      |                   | The composed result character, e.g. `á`                                      |
| `mode`    | enum   | Yes      | `tone` or `nasal` | Composition type                                                             |

**Composition modes:**

- `tone` — applies a diacritic that marks pitch (acute ´, grave `` ` ``, macron ¯, circumflex ^)
- `nasal` — applies a nasal subscript or tilde (~)

## Real Example: Yoruba Profile

The Yoruba profile (`data/languages/yoruba.json`) shows how a full language profile looks:

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

Notice that:

- `key-s` uses `altGrChar` for the dotted variant `ṣ` in addition to a `longPress` entry
- `key-e-dot` and `key-o-dot` are additional keys for the sub-dot vowels that are core to Yoruba orthography
- `compositionRules` at the top level covers both lowercase and uppercase variants
- `longPress` arrays are ordered — the first entry is highlighted by default

## Step-by-Step: Adding a New Language

### Step 1 — Add the language ID to the type system

Open `src/public/types.ts` and append your language ID to the `LANGUAGE_IDS` tuple:

```typescript
const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi', 'my-language'] as const;
```

The `LanguageId` union type and the `isLanguageId()` guard are derived from this tuple automatically — no other type changes are needed.

### Step 2 — Create the language profile JSON

Create `data/languages/my-language.json`. At minimum every key entry needs `keyId` and `baseChar`:

```json
{
  "languageId": "my-language",
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

### Step 3 — Register the language in registry.json

Open `data/registry.json` and add an entry to the `languages` array:

```json
{
  "version": "1.0.0",
  "languages": [
    { "id": "yoruba",      "path": "data/languages/yoruba.json" },
    { "id": "fon-adja",   "path": "data/languages/fon-adja.json" },
    { "id": "baatonum",   "path": "data/languages/baatonum.json" },
    { "id": "dendi",       "path": "data/languages/dendi.json" },
    { "id": "my-language", "path": "data/languages/my-language.json" }
  ],
  "layouts": [...]
}
```

### Step 4 — Regenerate schemas

Run the bootstrap script to update the JSON schema enum with your new language ID:

```bash
npm run bootstrap:schemas
```

The committed schemas contain hand-tuned constraints. After running this command, review any diffs in `data/schemas/language-profile.schema.json` to ensure hand-tuned constraints are preserved.

### Step 5 — Validate

```bash
npm run validate:data
```

This runs the full data validator against all language profiles, layout shapes, and the registry. Fix any errors it reports before proceeding.

## How the Composition Engine Works

The composition engine implements a **dead key sequence** model — the same approach used by international keyboard layouts on macOS and Linux.

### Armed state

When the user presses a key whose `baseChar` matches a `trigger` value in the active language's `compositionRules`, the engine enters the **armed state**. No character is inserted yet.

While armed:

- The keyboard visually marks the modifier key as active
- A screen-reader announcement fires (e.g. "Modificateur de ton activé")
- The next keypress is intercepted by the engine instead of being inserted directly

### Dead key sequence

On the next keypress, the engine looks for a `CompositionRule` where:

- `trigger` equals the armed character
- `base` equals the character the next key would normally produce

If a matching rule exists, the engine inserts `result` into the target input. If no rule matches, the engine inserts the trigger character followed by the base character (fallback passthrough), then exits the armed state.

Pressing Escape while armed cancels the composition without inserting anything.

### Example: Yoruba high tone on "e"

1. User presses the `´` (acute) key → engine arms with trigger `´`
2. User presses the `e` key → engine searches for `{ trigger: "´", base: "e" }`
3. Match found: `result` is `é`
4. Engine inserts `é` into the connected input and resets to unarmed state

```
  KEY PRESS: ´         KEY PRESS: e
  ─────────────        ─────────────
  engine armed         lookup: trigger=´, base=e
  (no output)          → result: é
                       → insert "é"
                       engine unarmed
```

### Composition rules placement

Rules can live at two levels in the profile:

- **Top-level `compositionRules`** — applied regardless of which key triggered the sequence. Use this for language-wide tone rules.
- **Per-key `composition`** on a `KeyCatalogEntry` — applied only when that specific key is the base. Use this for keys with unusual composition behaviour.

The engine checks per-key rules first, then falls back to top-level rules.

## Common Mistakes

| Error                                                   | Cause                                   | Fix                                                                 |
| ------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `languageId must be equal to one of the allowed values` | Language ID not in `LANGUAGE_IDS` tuple | Add to tuple in `src/public/types.ts` and rerun `bootstrap:schemas` |
| `characters/0: must have required property 'baseChar'`  | Missing `baseChar` on a key entry       | Every `KeyCatalogEntry` must have both `keyId` and `baseChar`       |
| `mode must be equal to one of the allowed values`       | Using an invalid mode like `'click'`    | Use `'tone'` or `'nasal'` only                                      |
| `version must match pattern`                            | Version not in semver `X.Y.Z` format    | Use e.g. `"1.0.0"`                                                  |
| `must NOT have additional properties`                   | Extra field not in schema               | Remove or rename the unexpected field                               |
