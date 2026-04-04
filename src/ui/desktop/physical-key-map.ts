import { createKeyId, type KeyId } from '../../public/index.js';

// Maps browser KeyboardEvent.code (physical key position, US QWERTY reference)
// to logical KeyId in the desktop-azerty layout.
// AZERTY positions: Row0=AZERTYUIOP, Row1=QSDFGHJKLM, Row2=WXCVBN(specials)
const CODE_TO_KEY: Record<string, KeyId> = {
  // Top row (AZERTY: A Z E R T Y U I O P)
  KeyQ: createKeyId('key-a'),
  KeyW: createKeyId('key-z'),
  KeyE: createKeyId('key-e'),
  KeyR: createKeyId('key-r'),
  KeyT: createKeyId('key-t'),
  KeyY: createKeyId('key-y'),
  KeyU: createKeyId('key-u'),
  KeyI: createKeyId('key-i'),
  KeyO: createKeyId('key-o'),
  KeyP: createKeyId('key-p'),
  // Middle row (AZERTY: Q S D F G H J K L M + Backspace)
  KeyA: createKeyId('key-q'),
  KeyS: createKeyId('key-s'),
  KeyD: createKeyId('key-d'),
  KeyF: createKeyId('key-f'),
  KeyG: createKeyId('key-g'),
  KeyH: createKeyId('key-h'),
  KeyJ: createKeyId('key-j'),
  KeyK: createKeyId('key-k'),
  KeyL: createKeyId('key-l'),
  Semicolon: createKeyId('key-m'),
  Backspace: createKeyId('key-backspace'),
  // Bottom row (AZERTY: Shift W X C V B N ẹ ọ Enter)
  ShiftLeft: createKeyId('key-shift'),
  KeyZ: createKeyId('key-w'),
  KeyX: createKeyId('key-x'),
  KeyC: createKeyId('key-c'),
  KeyV: createKeyId('key-v'),
  KeyB: createKeyId('key-b'),
  KeyN: createKeyId('key-n'),
  Comma: createKeyId('key-e-dot'),
  Period: createKeyId('key-o-dot'),
  Enter: createKeyId('key-enter'),
  // Bottom modifier row
  ControlLeft: createKeyId('key-ctrl'),
  AltLeft: createKeyId('key-alt'),
  Space: createKeyId('key-space'),
  AltRight: createKeyId('key-altgr'),
  ShiftRight: createKeyId('key-shift-right'),
};

export function mapPhysicalCodeToLogicalKey(code: string): KeyId | null {
  return CODE_TO_KEY[code] ?? null;
}
