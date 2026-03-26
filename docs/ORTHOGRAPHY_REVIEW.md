# Orthography Review

This document records orthography decisions made for each supported language, with rationale and references.

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
- Bamgboṣe, A. (1966). *A Grammar of Yoruba*. Cambridge University Press.
- Unicode charts: Latin Extended Additional (U+1E00–U+1EFF).

---

## Fon / Adja (Fongbè / Ajagbe)

**Special characters:** ɛ (U+025B), ɔ (U+0254), ɖ (U+0256), ʋ (U+028B), ɣ (U+0263)

**Tone system:** Two-tone (acute = high, grave = low) + nasal harmony (tilde)

**Decisions:**
- `key-e-dot` and `key-o-dot` use ɛ/Ɛ and ɔ/Ɔ (open vowels), matching the Africa Alphabet standard.
- `key-d` carries `altGrChar: "ɖ"` (retroflex d), `key-v` carries `altGrChar: "ʋ"` (labiodental approximant), `key-g` carries `altGrChar: "ɣ"` (voiced velar fricative).
- Nasal composition rules use `~` trigger for all seven oral vowels.
- Uppercase nasal forms are not included (nasal marking is primarily used in lowercase running text).

**References:**
- Capo, H. B. C. (1991). *A Comparative Phonology of Gbe*. Foris / Garome.
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
- Welmers, W. E. (1952). Notes on the Structure of Bariba. *Language*, 28(1).
- SIL Benin / DGLA (Direction Générale de la Linguistique Appliquée) Bariba orthography guide.

---

## Dendi

**Special characters:** ɛ (U+025B), ɔ (U+0254), ŋ (U+014B)

**Tone system:** Two-tone (acute = high, grave = low)

**Decisions:**
- `key-e-dot` and `key-o-dot` use ɛ/Ɛ and ɔ/Ɔ.
- `key-n` carries `altGrChar: "ŋ"` (velar nasal), per Songhai language conventions.
- `key-e` carries `altGrChar: "ɛ"` and `key-o` carries `altGrChar: "ɔ"` for quick access.
- Composition rules cover acute and grave for all vowels including ɛ/ɔ.
- Uppercase composition for ɛ/ɔ follows the same pattern as Baatɔnum.

**References:**
- Heath, J. (2005). *A Grammar of Jamsay*. Mouton de Gruyter (related Songhai variety).
- SIL Benin recommendations for Dendi orthography.
