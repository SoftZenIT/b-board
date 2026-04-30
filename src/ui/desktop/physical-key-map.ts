import { createKeyId, type KeyId, type LayerId } from '../../public/index.js';

// Maps browser KeyboardEvent.code (physical key position, US QWERTY reference)
// to logical KeyId in the desktop-azerty layout.
// AZERTY positions: Row0=AZERTYUIOP, Row1=QSDFGHJKLM, Row2=WXCVBN(specials)
const CODE_TO_KEY: Record<string, KeyId> = {
  // Number row (1–0, -, =)
  Digit1: createKeyId('key-1'),
  Digit2: createKeyId('key-2'),
  Digit3: createKeyId('key-3'),
  Digit4: createKeyId('key-4'),
  Digit5: createKeyId('key-5'),
  Digit6: createKeyId('key-6'),
  Digit7: createKeyId('key-7'),
  Digit8: createKeyId('key-8'),
  Digit9: createKeyId('key-9'),
  Digit0: createKeyId('key-0'),
  Minus: createKeyId('key-minus'),
  Equal: createKeyId('key-equal'),
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

/**
 * Physical key codes (from KeyboardEvent.code) that control the active layer.
 * When any of these keys are held, they affect which layer character keys output from.
 */
export const PHYSICAL_MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'AltRight',
  'AltLeft',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
]) as ReadonlySet<string>;

/**
 * Logical key IDs that must NOT generate `bboard-key-press` output when physically pressed.
 * These are the modifier keys in the layout that control layer state.
 */
export const MODIFIER_KEY_IDS = new Set([
  createKeyId('key-shift'),
  createKeyId('key-shift-right'),
  createKeyId('key-altgr'),
  createKeyId('key-alt'),
  createKeyId('key-ctrl'),
]) as ReadonlySet<KeyId>;

/**
 * Computes the effective keyboard layer from a set of held physical keys.
 * Layer precedence (hold-based, not toggle):
 * 1. If Shift (Left or Right) is held → 'shift'
 * 2. Else if AltRight is held → 'altGr'
 * 3. Else → 'base'
 * (Shift wins if both Shift and AltGr are held simultaneously)
 */
export function computePhysicalLayer(heldPhysicalKeys: ReadonlySet<string>): LayerId {
  if (heldPhysicalKeys.has('ShiftLeft') || heldPhysicalKeys.has('ShiftRight')) {
    return 'shift';
  }
  if (heldPhysicalKeys.has('AltRight')) {
    return 'altGr';
  }
  return 'base';
}
