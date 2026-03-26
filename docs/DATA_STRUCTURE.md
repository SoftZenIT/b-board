# BBOARD Data Structure Guide

This guide explains how BBOARD's data model is organized and how to add or modify language and layout data.

---

## Overview

BBOARD's data layer is split into three type modules under `src/data/`:

| Module | Purpose |
|--------|---------|
| `layout.types.ts` | Keyboard geometry — slots, rows, layers, shapes |
| `language.types.ts` | Language content — characters, key catalog, composition rules |
| `runtime.types.ts` | Runtime state — resolved layout, composition state, input operations |

All primitives (identifiers, enums) live in `src/public/types.ts`.

---

## How to Add a New Language

### Step 1 — Add the `LanguageId`

Open `src/public/types.ts` and add your language to the `LANGUAGE_IDS` tuple:

```typescript
const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi', 'my-language'] as const
```

That's all — `LanguageId` and `isLanguageId()` are derived from the tuple automatically.

---

### Step 2 — Build the `KeyCatalogEntry` list

Each key on the keyboard has an entry. Use `createKeyEntry()`:

```typescript
import { createKeyEntry, createCompositionRule } from '../data/language.types.js'
import { createKeyId } from '../public/types.js'

// Simple key: 'a' base, 'A' shift
const keyA = createKeyEntry(createKeyId('key-a'), 'a', 'A')

// Key with composition rule: tone mark triggers 'à' when followed by 'a'
const toneRule = createCompositionRule('`', 'a', 'à', 'tone')
const keyTone = createKeyEntry(createKeyId('key-tone'), '`', undefined, undefined, [toneRule])
```

**Composition modes:**
- `'tone'` — diacritic above (acute, grave, circumflex, caron)
- `'nasal'` — nasal subscript or tilde

---

### Step 3 — Create the `LanguageProfile`

```typescript
import { createLanguageProfile } from '../data/language.types.js'

export const yorubaProfile = createLanguageProfile(
  'yoruba',           // LanguageId
  'Yoruba',           // English name
  'Yorùbá',           // Native name
  [keyA, keyTone],    // KeyCatalogEntry[]
  [toneRule],         // CompositionRule[] (top-level)
)
```

---

## How to Add a New Layout

### Step 1 — Add the `LayoutVariantId`

If the layout is new (not `desktop-azerty` or `mobile-default`), add it to the `LAYOUT_VARIANT_IDS` tuple in `src/public/types.ts`:

```typescript
const LAYOUT_VARIANT_IDS = ['desktop-azerty', 'mobile-default', 'desktop-qwerty'] as const
```

`LayoutVariantId` and `isLayoutVariantId()` update automatically.

---

### Step 2 — Build layers row by row

```typescript
import { createLayoutSlot, createLayoutRow, createLayoutLayer, createLayoutShape } from '../data/layout.types.js'
import { createKeyId } from '../public/types.js'

const row1 = createLayoutRow([
  createLayoutSlot(createKeyId('key-a'), 1),
  createLayoutSlot(createKeyId('key-z'), 1),
  createLayoutSlot(createKeyId('key-enter'), 1.5, 'Enter'),
])

const baseLayer = createLayoutLayer('base', [row1])
const shiftLayer = createLayoutLayer('shift', [row1]) // reuse or define shifted rows

const desktopAzerty = createLayoutShape('desktop-azerty', 'desktop', [baseLayer, shiftLayer], 'light')
```

---

## Composition Rules Reference

| `mode` | Example trigger | Example base | Example result |
|--------|-----------------|--------------|----------------|
| `'tone'` | `´` | `e` | `é` |
| `'tone'` | `` ` `` | `e` | `è` |
| `'nasal'` | `~` | `o` | `õ` |
| `'nasal'` | `ñ` | `a` | `ã` |

---

## Example Language Profiles by Language

### Yoruba
- Tone marks: acute (´), grave (``\` ``), macron (¯) on vowels a, e, i, o, u + dotted variants ẹ, ọ
- Nasal: none (nasality is tonal in Yoruba)

### Fon/Adja
- Tone marks: acute, grave, high-falling on all vowels
- Nasal vowels: ã, ɛ̃, etc. via nasal composition

### Baatɔnum
- Character ɔ, ɛ, ŋ are core (level A)
- Tone marks on all vowels

### Dendi
- Similar to Songhai family; vowel length distinctions
- Tones: high, low, falling
