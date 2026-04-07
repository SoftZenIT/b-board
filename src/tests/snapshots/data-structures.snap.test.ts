import { describe, it, expect } from 'vitest';
import { ErrorCode, RECOVERY_SUGGESTIONS, RECOVERABLE_CODES } from '../../public/error-codes.js';
import {
  yorubaCompositionRules,
  fonCompositionRules,
  buildLanguageProfile,
  buildFonProfile,
} from '../fixtures/index.js';

describe('Error Code Registry Snapshot', () => {
  it('all error codes', () => {
    expect(Object.values(ErrorCode)).toMatchSnapshot();
  });

  it('recovery suggestions', () => {
    expect(RECOVERY_SUGGESTIONS).toMatchSnapshot();
  });

  it('recoverable codes', () => {
    expect([...RECOVERABLE_CODES].sort()).toMatchSnapshot();
  });
});

describe('Composition Rule Snapshots', () => {
  it('Yoruba tone composition rules', () => {
    expect(yorubaCompositionRules()).toMatchSnapshot();
  });

  it('Fon nasal composition rules', () => {
    expect(fonCompositionRules()).toMatchSnapshot();
  });
});

describe('Language Profile Structure Snapshots', () => {
  it('Yoruba profile shape', () => {
    const profile = buildLanguageProfile();
    // Snapshot the structure keys, not the full content
    expect({
      languageId: profile.languageId,
      name: profile.name,
      nativeName: profile.nativeName,
      characterCount: profile.characters.length,
      compositionRuleCount: profile.compositionRules.length,
      characterFields: Object.keys(profile.characters[0] ?? {}),
      ruleFields: Object.keys(profile.compositionRules[0] ?? {}),
    }).toMatchSnapshot();
  });

  it('Fon profile shape', () => {
    const profile = buildFonProfile();
    expect({
      languageId: profile.languageId,
      name: profile.name,
      nativeName: profile.nativeName,
      characterCount: profile.characters.length,
      compositionRuleCount: profile.compositionRules.length,
    }).toMatchSnapshot();
  });
});
