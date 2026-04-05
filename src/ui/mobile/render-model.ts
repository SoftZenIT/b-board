import type { KeyId, LayerId, ResolvedLayout } from '../../public/index.js';

export interface MobileRenderState {
  activeLayer: LayerId;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  focusedKeyId: KeyId | null;
  activeModifierKeyIds: ReadonlySet<KeyId>;
  longPressKeyId: KeyId | null;
  longPressVisible: boolean;
  longPressSelectedIndex: number;
  widthBucket: 'xs' | 'sm' | 'md';
}

export interface MobileRenderKey {
  keyId: KeyId;
  width: number;
  primaryLabel: string;
  hidden: boolean;
  disabled: boolean;
  active: boolean;
  tabStop: boolean;
  thumbComfort: 'high' | 'medium' | 'low';
  isActionKey: boolean;
  hasLongPress: boolean;
  longPressChars: string[];
}

export interface MobileRenderRow {
  keys: MobileRenderKey[];
  height: number;
}

export interface LongPressPopupModel {
  anchorKeyId: KeyId;
  items: string[];
  selectedIndex: number;
}

export interface MobileRenderModel {
  rows: MobileRenderRow[];
  widthBucket: 'xs' | 'sm' | 'md';
  longPressPopup: LongPressPopupModel | null;
}

const ACTION_KEY_PREFIXES = [
  'key-shift',
  'key-enter',
  'key-backspace',
  'key-space',
  'key-altgr',
  'key-o-dot',
];

function isActionKey(keyId: string): boolean {
  return ACTION_KEY_PREFIXES.some((prefix) => keyId === prefix || keyId.startsWith(prefix + '-'));
}

const THUMB_COMFORT: readonly ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high', 'high'];

function thumbComfort(rowIndex: number): 'low' | 'medium' | 'high' {
  return THUMB_COMFORT[Math.min(rowIndex, THUMB_COMFORT.length - 1)] ?? 'high';
}

function resolveLayerKey(
  keyId: string,
  activeLayer: LayerId
): { baseKeyId: string; effectiveLayer: LayerId } {
  if (keyId.endsWith('-shift')) {
    return { baseKeyId: keyId.slice(0, -'-shift'.length), effectiveLayer: 'shift' };
  }
  if (keyId.endsWith('-altgr') || keyId.endsWith('-altGr')) {
    const suffix = keyId.endsWith('-altgr') ? '-altgr' : '-altGr';
    return { baseKeyId: keyId.slice(0, -suffix.length), effectiveLayer: 'altGr' };
  }
  return { baseKeyId: keyId, effectiveLayer: activeLayer };
}

export function createMobileRenderModel(
  resolvedLayout: ResolvedLayout,
  state: MobileRenderState
): MobileRenderModel {
  const layer =
    resolvedLayout.layout.layers.find((l) => l.name === state.activeLayer) ??
    resolvedLayout.layout.layers[0];

  let firstFocusableFound = false;

  const rows: MobileRenderRow[] =
    layer?.rows.map((row, rowIndex) => ({
      height: row.height ?? 52,
      keys: row.slots.map((slot) => {
        const { baseKeyId, effectiveLayer } = resolveLayerKey(slot.keyId, state.activeLayer);
        const resolvedKey =
          resolvedLayout.keyMap.get(slot.keyId) ?? resolvedLayout.keyMap.get(baseKeyId as KeyId);
        const primaryLabel = slot.label ?? resolvedKey?.layers[effectiveLayer]?.char ?? '';
        const hidden = state.hiddenKeys.has(slot.keyId);
        const disabled = state.disabledKeys.has(slot.keyId);
        const active = state.activeModifierKeyIds.has(slot.keyId);
        const longPressChars = resolvedKey?.longPress ? [...resolvedKey.longPress] : [];

        let tabStop = false;
        if (state.focusedKeyId === slot.keyId) {
          tabStop = true;
        } else if (!hidden && !disabled && state.focusedKeyId === null && !firstFocusableFound) {
          tabStop = true;
          firstFocusableFound = true;
        }

        return {
          keyId: slot.keyId,
          width: slot.width,
          primaryLabel,
          hidden,
          disabled,
          active,
          tabStop,
          thumbComfort: thumbComfort(rowIndex),
          isActionKey: isActionKey(slot.keyId),
          hasLongPress: longPressChars.length > 0,
          longPressChars,
        };
      }),
    })) ?? [];

  const longPressPopup: LongPressPopupModel | null =
    state.longPressVisible && state.longPressKeyId !== null
      ? (() => {
          const anchorKey = rows
            .flatMap((r) => r.keys)
            .find((k) => k.keyId === state.longPressKeyId);
          if (!anchorKey || !anchorKey.hasLongPress) return null;
          return {
            anchorKeyId: state.longPressKeyId,
            items: anchorKey.longPressChars,
            selectedIndex: Math.max(
              0,
              Math.min(state.longPressSelectedIndex, anchorKey.longPressChars.length - 1)
            ),
          };
        })()
      : null;

  return { rows, widthBucket: state.widthBucket, longPressPopup };
}
