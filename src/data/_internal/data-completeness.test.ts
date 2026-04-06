import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageProfile, KeyCatalogEntry } from '../language.types.js';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'data');

function loadProfile(lang: string): LanguageProfile {
  return JSON.parse(readFileSync(join(DATA_DIR, 'languages', `${lang}.json`), 'utf-8'));
}

function findChar(profile: LanguageProfile, keyId: string): KeyCatalogEntry | undefined {
  return profile.characters.find((c) => c.keyId === keyId);
}

// ── Fon/Adja nasal composition (uppercase) ──────────────────────────────────

describe('Fon/Adja nasal composition completeness', () => {
  const profile = loadProfile('fon-adja');
  const nasalRules = profile.compositionRules.filter((r) => r.mode === 'nasal');

  const expectedLowercase: [string, string][] = [
    ['a', 'ã'],
    ['e', 'ẽ'],
    ['ɛ', 'ɛ̃'],
    ['i', 'ĩ'],
    ['o', 'õ'],
    ['ɔ', 'ɔ̃'],
    ['u', 'ũ'],
  ];

  const expectedUppercase: [string, string][] = [
    ['A', 'Ã'],
    ['E', 'Ẽ'],
    ['Ɛ', 'Ɛ̃'],
    ['I', 'Ĩ'],
    ['O', 'Õ'],
    ['Ɔ', 'Ɔ̃'],
    ['U', 'Ũ'],
  ];

  for (const [base, result] of expectedLowercase) {
    it(`has lowercase nasal rule: ~ + ${base} → ${result}`, () => {
      const rule = nasalRules.find((r) => r.trigger === '~' && r.base === base);
      expect(rule).toBeDefined();
      expect(rule!.result).toBe(result);
    });
  }

  for (const [base, result] of expectedUppercase) {
    it(`has uppercase nasal rule: ~ + ${base} → ${result}`, () => {
      const rule = nasalRules.find((r) => r.trigger === '~' && r.base === base);
      expect(rule).toBeDefined();
      expect(rule!.result).toBe(result);
    });
  }
});

// ── Long-press menu constraints ─────────────────────────────────────────────

describe('long-press menu constraints', () => {
  const languages = ['yoruba', 'fon-adja', 'baatonum', 'dendi'] as const;

  for (const lang of languages) {
    const profile = loadProfile(lang);

    it(`${lang}: all long-press menus have at most 6 items`, () => {
      for (const entry of profile.characters) {
        if (entry.longPress) {
          expect(
            entry.longPress.length,
            `${entry.keyId} has ${entry.longPress.length} long-press items`
          ).toBeLessThanOrEqual(6);
        }
      }
    });

    it(`${lang}: no duplicate items within any long-press menu`, () => {
      for (const entry of profile.characters) {
        if (entry.longPress) {
          const unique = new Set(entry.longPress);
          expect(unique.size, `${entry.keyId} has duplicate long-press items`).toBe(
            entry.longPress.length
          );
        }
      }
    });
  }
});

// ── Digraph placement (Fon/Adja and Dendi) ──────────────────────────────────

describe('digraph long-press placement', () => {
  describe('Fon/Adja digraphs', () => {
    const profile = loadProfile('fon-adja');

    it('key-g long-press includes "gb"', () => {
      const entry = findChar(profile, 'key-g');
      expect(entry?.longPress).toContain('gb');
    });

    it('key-k long-press includes "kp"', () => {
      const entry = findChar(profile, 'key-k');
      expect(entry?.longPress).toContain('kp');
    });

    it('key-n long-press includes "ny"', () => {
      const entry = findChar(profile, 'key-n');
      expect(entry?.longPress).toContain('ny');
    });
  });

  describe('Dendi digraphs', () => {
    const profile = loadProfile('dendi');

    it('key-g long-press includes "gb"', () => {
      const entry = findChar(profile, 'key-g');
      expect(entry?.longPress).toContain('gb');
    });

    it('key-k long-press includes "kp"', () => {
      const entry = findChar(profile, 'key-k');
      expect(entry?.longPress).toContain('kp');
    });

    it('key-n long-press includes "ny"', () => {
      const entry = findChar(profile, 'key-n');
      expect(entry?.longPress).toContain('ny');
    });
  });

  it('Baatɔnum has no digraph long-press entries', () => {
    const profile = loadProfile('baatonum');
    for (const entry of profile.characters) {
      if (entry.longPress) {
        for (const item of entry.longPress) {
          expect(item.length, `${entry.keyId} has multi-char "${item}"`).toBeLessThanOrEqual(2);
          // Baatɔnum should not have "gb", "kp", "ny"
          expect(['gb', 'kp', 'ny']).not.toContain(item);
        }
      }
    }
  });
});

// ── Tone composition symmetry ───────────────────────────────────────────────

describe('tone composition symmetry (lowercase ↔ uppercase)', () => {
  const languages = ['yoruba', 'fon-adja', 'baatonum', 'dendi'] as const;

  for (const lang of languages) {
    const profile = loadProfile(lang);
    const toneRules = profile.compositionRules.filter((r) => r.mode === 'tone');

    it(`${lang}: every lowercase tone rule has an uppercase counterpart`, () => {
      const lowercaseRules = toneRules.filter((r) => r.base === r.base.toLowerCase());
      for (const rule of lowercaseRules) {
        const upperBase = rule.base.toUpperCase();
        if (upperBase === rule.base) continue; // skip non-alphabetic
        const upperRule = toneRules.find((r) => r.trigger === rule.trigger && r.base === upperBase);
        expect(
          upperRule,
          `${lang}: missing uppercase tone rule for ${rule.trigger} + ${upperBase}`
        ).toBeDefined();
      }
    });
  }
});
