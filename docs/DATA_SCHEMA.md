# BBOARD Data Schema Reference

This document describes the JSON schemas used to validate BBOARD data files.
All schemas live in `data/schemas/` and are regenerated via `npm run generate:schemas`.

---

## Table of Contents

1. [LanguageProfile](#languageprofile)
2. [LayoutShape](#layoutshape)
3. [RegistryData](#registrydata)
4. [How to Add a Language](#how-to-add-a-language)
5. [How to Add a Layout](#how-to-add-a-layout)
6. [Common Mistakes](#common-mistakes)

---

## LanguageProfile

**Schema file:** `data/schemas/language-profile.schema.json`
**Data location:** `data/languages/<languageId>.json`

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `languageId` | enum | ✅ | One of: `yoruba`, `fon-adja`, `baatonum`, `dendi` |
| `name` | string | ✅ | English name of the language |
| `nativeName` | string | ✅ | Name in the language itself |
| `characters` | KeyCatalogEntry[] | ✅ | All keyed characters for this language |
| `compositionRules` | CompositionRule[] | ✅ | Top-level composition rules |

### KeyCatalogEntry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyId` | string | ✅ | Key identifier (e.g. `key-a`, `key-enter`) |
| `baseChar` | string | ✅ | Character on the base layer |
| `shiftChar` | string | ❌ | Character on the shift layer |
| `altGrChar` | string | ❌ | Character on the AltGr layer |
| `composition` | CompositionRule[] | ❌ | Composition rules triggered from this key |

### CompositionRule

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `trigger` | string | ✅ | | The dead key character that arms composition |
| `base` | string | ✅ | | The base character to combine with |
| `result` | string | ✅ | | The composed result character |
| `mode` | enum | ✅ | `tone` or `nasal` | Composition type |

### Example

```json
{
  "languageId": "yoruba",
  "name": "Yoruba",
  "nativeName": "Yorùbá",
  "characters": [
    {
      "keyId": "key-a",
      "baseChar": "a",
      "shiftChar": "A",
      "composition": [
        { "trigger": "´", "base": "a", "result": "á", "mode": "tone" },
        { "trigger": "`", "base": "a", "result": "à", "mode": "tone" }
      ]
    },
    {
      "keyId": "key-e-dot",
      "baseChar": "ẹ",
      "shiftChar": "Ẹ"
    }
  ],
  "compositionRules": [
    { "trigger": "´", "base": "e", "result": "é", "mode": "tone" }
  ]
}
```

---

## LayoutShape

**Schema file:** `data/schemas/layout-shape.schema.json`
**Data location:** `data/layouts/<layoutVariantId>.json`

### Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | enum | ✅ | `desktop-azerty`, `mobile-default` | Variant identifier |
| `variant` | enum | ✅ | `desktop`, `mobile` | Platform type |
| `layers` | LayoutLayer[] | ✅ | | Ordered layers (base first) |
| `theme` | enum | ✅ | `light`, `dark`, `auto` | Default theme |

### LayoutLayer

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | enum | ✅ | `base`, `shift`, `altGr` | Shift state |
| `rows` | LayoutRow[] | ✅ | | Ordered rows, top to bottom |

### LayoutRow

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slots` | LayoutSlot[] | ✅ | Key slots left to right |
| `height` | number | ❌ | Optional height in pixels |

### LayoutSlot

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `keyId` | string | ✅ | | Key identifier |
| `width` | number | ✅ | minimum: 0.25 | Relative width (1 = standard unit) |
| `label` | string | ❌ | | Display label override |

### Example

```json
{
  "id": "desktop-azerty",
  "variant": "desktop",
  "theme": "light",
  "layers": [
    {
      "name": "base",
      "rows": [
        {
          "slots": [
            { "keyId": "key-a", "width": 1 },
            { "keyId": "key-z", "width": 1 },
            { "keyId": "key-enter", "width": 1.5, "label": "Enter" }
          ]
        }
      ]
    },
    {
      "name": "shift",
      "rows": [...]
    }
  ]
}
```

---

## RegistryData

**Schema file:** `data/schemas/registry.schema.json`
**Data location:** `data/registry.json`

### Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `version` | string | ✅ | semver pattern | Data set version |
| `languages` | LanguageRegistryEntry[] | ✅ | | All language entries |
| `layouts` | LayoutRegistryEntry[] | ✅ | | All layout entries |

### Entry fields (both languages and layouts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | enum | ✅ | Valid LanguageId or LayoutVariantId |
| `path` | string | ✅ | Relative path to the JSON file |

### Example

```json
{
  "version": "1.0.0",
  "languages": [
    { "id": "yoruba",   "path": "data/languages/yoruba.json" },
    { "id": "fon-adja", "path": "data/languages/fon-adja.json" },
    { "id": "baatonum", "path": "data/languages/baatonum.json" },
    { "id": "dendi",    "path": "data/languages/dendi.json" }
  ],
  "layouts": [
    { "id": "desktop-azerty", "path": "data/layouts/desktop-azerty.json" },
    { "id": "mobile-default", "path": "data/layouts/mobile-default.json" }
  ]
}
```

---

## How to Add a Language

1. **Add the `LanguageId`** — update `LanguageId` union in `src/public/types.ts` and `isLanguageId()`
2. **Regenerate schemas** — run `npm run generate:schemas`
3. **Create the data file** — `data/languages/<id>.json` matching the `LanguageProfile` schema
4. **Add to registry** — add an entry in `data/registry.json`
5. **Validate** — run `npm run validate:data`

---

## How to Add a Layout

1. **Add the `LayoutVariantId`** — update the union in `src/public/types.ts` and `isLayoutVariantId()`
2. **Regenerate schemas** — run `npm run generate:schemas`
3. **Create the data file** — `data/layouts/<id>.json` matching the `LayoutShape` schema
4. **Add to registry** — add an entry in `data/registry.json`
5. **Validate** — run `npm run validate:data`

---

## Common Mistakes

| Error | Cause | Fix |
|-------|-------|-----|
| `languageId must be equal to one of the allowed values` | Using an unregistered language ID | Add the ID to `LanguageId` union in `types.ts` and regenerate schemas |
| `characters/0: must have required property 'baseChar'` | Missing `baseChar` in a key entry | Every key entry needs at minimum `keyId` and `baseChar` |
| `mode must be equal to one of the allowed values` | Using `'click'` or other invalid mode | Use `'tone'` or `'nasal'` only |
| `version must match pattern` | Version not in `X.Y.Z` semver format | Use format `"1.0.0"` |
| `must NOT have additional properties` | Extra field in JSON not in schema | Remove or rename the unexpected field |
