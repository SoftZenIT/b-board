# Data Sources

This document records where language and layout data originates and how it was verified.

---

## Language Data

### Yoruba (`data/languages/yoruba.json`)

| Item | Source |
|------|--------|
| Character set | Standard Yoruba orthography (1966); SIL Nigeria |
| Special characters | Unicode Latin Extended Additional (ẹ U+1EB9, ọ U+1ECD, ṣ U+1E63) |
| Composition rules | Tone mark conventions from Bamgboṣe (1966) |
| Verified by | Cross-referenced with Omniglot Yoruba writing system page |

### Fon/Adja (`data/languages/fon-adja.json`)

| Item | Source |
|------|--------|
| Character set | Africa Alphabet / Capo (1991) Gbe phonology |
| Special characters | IPA/Unicode: ɛ U+025B, ɔ U+0254, ɖ U+0256, ʋ U+028B, ɣ U+0263 |
| Composition rules | SIL Benin Fon orthography guide; nasal tilde conventions |
| Verified by | Cross-referenced with SIL Language Explorer (Fon ISO 639-3: fon) |

### Baatɔnum (`data/languages/baatonum.json`)

| Item | Source |
|------|--------|
| Character set | DGLA Benin Bariba orthography (Baatonum ISO 639-3: bba) |
| Special characters | IPA/Unicode: ɛ U+025B, ɔ U+0254, ŋ U+014B, ʋ U+028B |
| Composition rules | Tone conventions per SIL Benin |
| Verified by | Welmers (1952); SIL Language Explorer |

### Dendi (`data/languages/dendi.json`)

| Item | Source |
|------|--------|
| Character set | Songhai orthography conventions (Dendi ISO 639-3: ddn) |
| Special characters | IPA/Unicode: ɛ U+025B, ɔ U+0254, ŋ U+014B |
| Composition rules | Standard two-tone system per SIL Benin recommendations |
| Verified by | Heath (2005) Songhai comparative data; SIL Language Explorer |

---

## Layout Data

### AZERTY Desktop (`data/layouts/desktop-azerty.json`)

| Item | Source |
|------|--------|
| Base layout | French AZERTY keyboard standard (NF Z71-300) |
| Adaptations | Added `key-e-dot`, `key-o-dot` to row 3 for African language characters |
| Special keys | AltGr layer for language-specific extended characters |

### Mobile Default (`data/layouts/mobile-default.json`)

| Item | Source |
|------|--------|
| Base layout | AZERTY-inspired mobile layout optimised for 10-column grid |
| Adaptations | `key-e-dot` in row 3; `key-o-dot` in bottom row with AltGr |
| Row heights | 52 px for letter rows, 56 px for function row (empirical mobile target) |

---

## Registry (`data/registry.json`)

The registry is maintained manually. When adding a new language or layout:

1. Add the data file under `data/languages/` or `data/layouts/`.
2. Add an entry to `data/registry.json` with the correct `id` and `path`.
3. Run `npm run validate:data` to confirm all files pass schema validation.
4. Update `src/public/types.ts` to include the new `LanguageId` or `LayoutVariantId` value.

---

## Composition Rules (`data/composition-rules.json`)

Documents the dead-key triggers used across all languages:

| Trigger | Unicode | Name | Languages |
|---------|---------|------|-----------|
| `´` | U+00B4 ACUTE ACCENT | High tone / acute | All |
| `` ` `` | U+0060 GRAVE ACCENT | Low tone / grave | All |
| `~` | U+007E TILDE | Nasal vowel | Fon/Adja |
