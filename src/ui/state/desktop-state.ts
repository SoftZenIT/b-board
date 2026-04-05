import type { KeyId, LayerId } from '../../public/index.js';

export interface DesktopStateSnapshot {
  heldPhysicalKeys: ReadonlySet<string>;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  focusedKeyId: KeyId | null;
  activeLayer: LayerId;
}

export function createDesktopState() {
  let heldPhysicalKeys = new Set<string>();
  const hiddenKeys = new Set<KeyId>();
  const disabledKeys = new Set<KeyId>();
  let focusedKeyId: KeyId | null = null;
  let activeLayer: LayerId = 'base';

  return {
    snapshot(): DesktopStateSnapshot {
      return { heldPhysicalKeys, hiddenKeys, disabledKeys, focusedKeyId, activeLayer };
    },
    pressPhysicalCode(code: string) {
      heldPhysicalKeys = new Set(heldPhysicalKeys).add(code);
    },
    releasePhysicalCode(code: string) {
      const next = new Set(heldPhysicalKeys);
      next.delete(code);
      heldPhysicalKeys = next;
    },
    clearHeldPhysicalKeys() {
      heldPhysicalKeys = new Set();
    },
    setFocusedKey(keyId: KeyId | null) {
      focusedKeyId = keyId;
    },
    setActiveLayer(layer: LayerId) {
      activeLayer = layer;
    },
  };
}
