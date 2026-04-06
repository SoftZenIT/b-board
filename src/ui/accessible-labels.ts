/**
 * Maps well-known action key IDs to human-readable accessible names.
 * Character keys fall back to their `primaryLabel`.
 */
export const KEY_ACCESSIBLE_LABELS: Readonly<Record<string, string>> = {
  'key-backspace': 'Backspace',
  'key-tab': 'Tab',
  'key-capslock': 'Caps Lock',
  'key-enter': 'Enter',
  'key-shift': 'Shift',
  'key-shift-right': 'Shift',
  'key-ctrl': 'Control',
  'key-ctrl-right': 'Control',
  'key-alt': 'Alt',
  'key-altgr': 'AltGr',
  'key-win': 'Meta',
  'key-win-right': 'Meta',
  'key-space': 'Space',
  'key-escape': 'Escape',
};

export function getAccessibleLabel(keyId: string, primaryLabel: string): string {
  return KEY_ACCESSIBLE_LABELS[keyId] ?? primaryLabel;
}
