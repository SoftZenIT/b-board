import { createKeyId, type KeyId } from '../../public/index.js';

const CODE_TO_KEY: Record<string, KeyId> = {
  KeyA: createKeyId('key-a'),
  KeyZ: createKeyId('key-z'),
  Enter: createKeyId('key-enter'),
  ShiftLeft: createKeyId('key-shift'),
  ShiftRight: createKeyId('key-shift-right'),
  Backspace: createKeyId('key-backspace'),
  Space: createKeyId('key-space'),
};

export function mapPhysicalCodeToLogicalKey(code: string): KeyId | null {
  return CODE_TO_KEY[code] ?? null;
}
