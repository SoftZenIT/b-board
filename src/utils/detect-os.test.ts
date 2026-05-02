import { describe, expect, it, vi, afterEach } from 'vitest';
import { detectOS } from './detect-os.js';

afterEach(() => vi.unstubAllGlobals());

describe('detectOS', () => {
  it('returns "macos" when userAgentData.platform is "macOS"', () => {
    vi.stubGlobal('navigator', {
      userAgentData: { platform: 'macOS' },
      platform: 'Win32',
    });
    expect(detectOS()).toBe('macos');
  });

  it('returns "macos" when userAgentData.platform is "macintosh" (case-insensitive)', () => {
    vi.stubGlobal('navigator', {
      userAgentData: { platform: 'macintosh' },
      platform: 'Win32',
    });
    expect(detectOS()).toBe('macos');
  });

  it('returns "windows" for Windows userAgentData.platform', () => {
    vi.stubGlobal('navigator', {
      userAgentData: { platform: 'Windows' },
      platform: 'Win32',
    });
    expect(detectOS()).toBe('windows');
  });

  it('falls back to navigator.platform when userAgentData is absent', () => {
    vi.stubGlobal('navigator', {
      userAgentData: undefined,
      platform: 'MacIntel',
    });
    expect(detectOS()).toBe('macos');
  });

  it('returns "windows" for Linux navigator.platform fallback', () => {
    vi.stubGlobal('navigator', {
      userAgentData: undefined,
      platform: 'Linux x86_64',
    });
    expect(detectOS()).toBe('windows');
  });

  it('returns "windows" when both are empty strings', () => {
    vi.stubGlobal('navigator', {
      userAgentData: { platform: '' },
      platform: '',
    });
    expect(detectOS()).toBe('windows');
  });
});
