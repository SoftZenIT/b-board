export type OS = 'macos' | 'windows';

export function detectOS(): OS {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    '';
  return /mac/i.test(platform) ? 'macos' : 'windows';
}
