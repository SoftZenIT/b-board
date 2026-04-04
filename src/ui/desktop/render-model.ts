import type { KeyId, LayerId, ModifierDisplayMode, ResolvedLayout } from '../../public/index.js';

export interface DesktopRenderState {
  activeLayer: LayerId;
  modifierDisplayMode: ModifierDisplayMode;
  heldPhysicalKeys: ReadonlySet<string>;
  hiddenKeys: ReadonlySet<KeyId>;
  disabledKeys: ReadonlySet<KeyId>;
  focusedKeyId: KeyId | null;
}

export interface DesktopRenderKey {
  keyId: KeyId;
  width: number;
  primaryLabel: string;
  secondaryLabel: string;
  overrideLabel?: string;
  hidden: boolean;
  disabled: boolean;
  focused: boolean;
  active: boolean;
}

export interface DesktopRenderRow {
  keys: DesktopRenderKey[];
}

export interface DesktopRenderModel {
  rows: DesktopRenderRow[];
}

export function createDesktopRenderModel(
  resolvedLayout: ResolvedLayout,
  state: DesktopRenderState
): DesktopRenderModel {
  const layer =
    resolvedLayout.layout.layers.find((entry) => entry.name === state.activeLayer) ??
    resolvedLayout.layout.layers[0];

  return {
    rows:
      layer?.rows.map((row) => ({
        keys: row.slots.map((slot) => {
          const resolvedKey = resolvedLayout.keyMap.get(slot.keyId);
          const activeLabel = resolvedKey?.layers[state.activeLayer]?.char ?? '';
          const shiftLabel = resolvedKey?.layers.shift.char ?? '';
          const primaryLabel = slot.label ?? activeLabel;
          const secondaryLabel =
            slot.label !== undefined || state.modifierDisplayMode !== 'hint' ? '' : shiftLabel;
          const overrideLabel = slot.label;

          return {
            keyId: slot.keyId,
            width: slot.width,
            primaryLabel,
            secondaryLabel,
            overrideLabel,
            hidden: state.hiddenKeys.has(slot.keyId),
            disabled: state.disabledKeys.has(slot.keyId),
            focused: state.focusedKeyId === slot.keyId,
            active: state.heldPhysicalKeys.has(slot.keyId),
          };
        }),
      })) ?? [],
  };
}
