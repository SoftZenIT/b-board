import type { KeyId, LayerId } from '../../public/index.js';

export interface MobileRenderState {
  activeLayer: LayerId;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  focusedKeyId: KeyId | null;
  activeModifierKeyIds: ReadonlySet<KeyId>;
  longPressKeyId: KeyId | null;
  longPressVisible: boolean;
  longPressArmed: boolean;
  longPressSelectedIndex: number;
  widthBucket: 'xs' | 'sm' | 'md';
  capsLocked: boolean;
}

export type MobileStateSnapshot = MobileRenderState;

export function createMobileState() {
  const hiddenKeys = new Set<KeyId>();
  const disabledKeys = new Set<KeyId>();
  let focusedKeyId: KeyId | null = null;
  let activeLayer: LayerId = 'base';
  let widthBucket: 'xs' | 'sm' | 'md' = 'sm';
  let longPressKeyId: KeyId | null = null;
  let longPressVisible = false;
  let longPressArmed = false;
  let longPressSelectedIndex = 0;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let capsLocked = false;

  return {
    snapshot(): MobileStateSnapshot {
      return {
        activeLayer,
        hiddenKeys,
        disabledKeys,
        focusedKeyId,
        activeModifierKeyIds: new Set<KeyId>(),
        longPressKeyId,
        longPressVisible,
        longPressArmed,
        longPressSelectedIndex,
        widthBucket,
        capsLocked,
      };
    },

    setActiveLayer(layer: LayerId) {
      activeLayer = layer;
    },

    setFocusedKey(id: KeyId | null) {
      focusedKeyId = id;
    },

    setWidthBucket(bucket: 'xs' | 'sm' | 'md') {
      widthBucket = bucket;
    },

    startLongPress(keyId: KeyId, onShow: () => void) {
      if (longPressTimer !== null) clearTimeout(longPressTimer);
      longPressKeyId = keyId;
      longPressVisible = false;
      longPressArmed = false;
      longPressSelectedIndex = 0;
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        longPressArmed = true;
        onShow();
      }, 300);
    },

    cancelLongPress() {
      if (longPressTimer !== null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      longPressKeyId = null;
      longPressVisible = false;
      longPressArmed = false;
      longPressSelectedIndex = 0;
    },

    setLongPressVisible(visible: boolean) {
      longPressVisible = visible;
    },

    setLongPressSelectedIndex(index: number) {
      longPressSelectedIndex = index;
    },

    dismissLongPress() {
      if (longPressTimer !== null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      longPressVisible = false;
      longPressArmed = false;
      longPressKeyId = null;
      longPressSelectedIndex = 0;
    },

    setCapsLock(locked: boolean) {
      capsLocked = locked;
    },
  };
}
