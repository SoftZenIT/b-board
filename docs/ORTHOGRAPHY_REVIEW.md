# Orthography Review

This document records orthography decisions made for each supported language, with rationale and references.

---

## General Decisions

### Tone System

All four languages use a two-tone system (high + low). Mid tone is **unmarked** in all languages — no macron (ā) or other mid-tone diacritic is used. This follows the standard orthographies adopted by SIL Benin and the DGLA.

- **High tone:** acute accent (´) via dead-key composition
- **Low tone:** grave accent (`) via dead-key composition
- **Mid tone:** unmarked (no diacritic)
- **Falling/rising tones:** Not represented in standard orthographies for these languages. No composition rules are needed.

### Digraph Access

Digraphs (Gb, Kp, Ny) are accessed via **long-press menus** on the base consonant key (G, K, N). This avoids schema extensions, fits the existing `longPress[]` model, and keeps the keyboard layout clean. Digraphs are multi-character strings in the long-press array.

### Long-Press Menu Ordering

Long-press menus are ordered by expected frequency of use:

1. Toned vowel variants (high tone first, then low tone)
2. Nasal vowel variants (Fon/Adja only)
3. Language-specific alternates (digraphs, special consonants)

Maximum of 5–6 items per long-press menu for usability.

### Modifier Layers

| Layer       | Activation  | Characters                                            |
| ----------- | ----------- | ----------------------------------------------------- |
| Base        | Default     | Standard lowercase letters                            |
| Shift       | Shift key   | Uppercase equivalents                                 |
| AltGr       | AltGr key   | Language-specific characters (ɛ, ɔ, ɖ, ʋ, ɣ, ŋ, ṣ)    |
| Shift+AltGr | Shift+AltGr | Uppercase of AltGr characters (derived automatically) |

**Priority:** base < shift < altGr < shift+altGr.

**Known limitation:** On mobile, long-press menus are not layer-aware — they always show the base-layer variants regardless of shift state. Uppercase accented characters are accessible via shift+composition (dead-key sequences).

---

## Yoruba

**Special characters:** ẹ (U+1EB9), ọ (U+1ECD), ṣ (U+1E63)

**Tone system:** Two-tone + mid (acute = high, grave = low, unmarked = mid)

**Decisions:**

- `key-e-dot` and `key-o-dot` use ẹ/Ẹ and ọ/Ọ (subscript dot), per the standard Yoruba orthography adopted in 1966.
- `key-s` carries `altGrChar: "ṣ"` (s with subscript dot).
- Composition rules cover acute and grave for all vowels including ẹ/ọ.
- Mid-tone vowels require no mark; the unmarked form is used directly.

**References:**

- Bamgboṣe, A. (1966). _A Grammar of Yoruba_. Cambridge University Press.
- Unicode charts: Latin Extended Additional (U+1E00–U+1EFF).

---

## Fon / Adja (Fongbè / Ajagbe)

**Special characters:** ɛ (U+025B), ɔ (U+0254), ɖ (U+0256), ʋ (U+028B), ɣ (U+0263)

**Tone system:** Two-tone (acute = high, grave = low) + nasal harmony (tilde)

**Digraphs:** Gb, Kp, Ny — accessed via long-press on G, K, N keys respectively.

**Decisions:**

- `key-e-dot` and `key-o-dot` use ɛ/Ɛ and ɔ/Ɔ (open vowels), matching the Africa Alphabet standard.
- `key-d` carries `altGrChar: "ɖ"` (retroflex d), `key-v` carries `altGrChar: "ʋ"` (labiodental approximant), `key-g` carries `altGrChar: "ɣ"` (voiced velar fricative).
- Nasal composition rules use `~` trigger for all seven oral vowels (a, e, ɛ, i, o, ɔ, u).
- Uppercase nasal composition rules are included for all seven vowels (A, E, Ɛ, I, O, Ɔ, U) for completeness.
- Long-press menus include toned variants, nasal variants, and digraphs. ɛ/ɔ are **not** duplicated on base e/o long-press since they have dedicated keys.

**References:**

- Capo, H. B. C. (1991). _A Comparative Phonology of Gbe_. Foris / Garome.
- SIL Benin orthography recommendations for Fon.

---

## Baatɔnum (Bariba)

**Special characters:** ɛ (U+025B), ɔ (U+0254), ŋ (U+014B), ʋ (U+028B)

**Tone system:** Two-tone (acute = high, grave = low)

**Decisions:**

- `key-e-dot` and `key-o-dot` use ɛ/Ɛ and ɔ/Ɔ.
- `key-n` carries `altGrChar: "ŋ"` (velar nasal), commonly used in Bariba.
- `key-v` carries `altGrChar: "ʋ"` (labiodental approximant).
- No nasal vowel composition rules — nasal consonant ŋ is entered directly via AltGr+n.

**References:**

- Welmers, W. E. (1952). Notes on the Structure of Bariba. _Language_, 28(1).
- SIL Benin / DGLA (Direction Générale de la Linguistique Appliquée) Bariba orthography guide.

---

## Dendi

**Special characters:** ɛ (U+025B), ɔ (U+0254), ŋ (U+014B)

**Tone system:** Two-tone (acute = high, grave = low)

**Digraphs:** Gb, Kp, Ny — accessed via long-press on G, K, N keys respectively.

**Decisions:**

- `key-e-dot` and `key-o-dot` use ɛ/Ɛ and ɔ/Ɔ.
- `key-n` carries `altGrChar: "ŋ"` (velar nasal), per Songhai language conventions.
- `key-e` carries `altGrChar: "ɛ"` and `key-o` carries `altGrChar: "ɔ"` for quick access.
- Composition rules cover acute and grave for all vowels including ɛ/ɔ.
- Uppercase composition for ɛ/ɔ follows the same pattern as Baatɔnum.
- Long-press menus include toned variants, digraphs, and ŋ. ɛ/ɔ are **not** duplicated on base e/o long-press since they have dedicated keys.

**References:**

- Heath, J. (2005). _A Grammar of Jamsay_. Mouton de Gruyter (related Songhai variety).
- SIL Benin recommendations for Dendi orthography.
