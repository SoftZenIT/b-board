import { describe, expect, it } from 'vitest';
import {
  createKeyId,
  createLayoutLayer,
  createLayoutRow,
  createLayoutShape,
  createLayoutSlot,
  createLanguageProfile,
  createResolvedKey,
  createResolvedLayout,
  createKeyOutput,
  type ResolvedLayout,
} from '../../public/index.js';
import { createDesktopRenderModel } from './render-model.js';

function makeResolvedLayout(): ResolvedLayout {
  const row1 = createLayoutRow([
    createLayoutSlot(createKeyId('key-a'), 1),
    createLayoutSlot(createKeyId('key-z'), 1),
  ]);
  const row2 = createLayoutRow([
    createLayoutSlot(createKeyId('key-shift'), 1.5, '⇧'),
    createLayoutSlot(createKeyId('key-enter'), 1.5, '⏎'),
  ]);
  const layout = createLayoutShape(
    'desktop-azerty',
    'desktop',
    [createLayoutLayer('base', [row1, row2])],
    'light'
  );
  const keyMap = new Map([
    [
      createKeyId('key-a'),
      createResolvedKey(createKeyId('key-a'), {
        base: createKeyOutput('a'),
        shift: createKeyOutput('A'),
        altGr: createKeyOutput('@'),
      }),
    ],
    [
      createKeyId('key-z'),
      createResolvedKey(createKeyId('key-z'), {
        base: createKeyOutput('z'),
        shift: createKeyOutput('Z'),
        altGr: createKeyOutput('Ω'),
      }),
    ],
    [
      createKeyId('key-shift'),
      createResolvedKey(createKeyId('key-shift'), {
        base: createKeyOutput(''),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
    [
      createKeyId('key-enter'),
      createResolvedKey(createKeyId('key-enter'), {
        base: createKeyOutput(''),
        shift: createKeyOutput(''),
        altGr: createKeyOutput(''),
      }),
    ],
  ]);

  return createResolvedLayout(
    layout,
    createLanguageProfile('yoruba', 'Yoruba', 'Yorùbá', [], []),
    keyMap,
    new Map()
  );
}

describe('createDesktopRenderModel', () => {
  it('should derive rows, widths, and labels from the resolved layout', () => {
    const resolvedLayout = makeResolvedLayout();
    const hintedModel = createDesktopRenderModel(resolvedLayout, {
      activeLayer: 'base',
      modifierDisplayMode: 'hint',
      heldPhysicalKeys: new Set([createKeyId('key-a')]),
      activeModifierKeyIds: new Set(),
      hiddenKeys: new Set([createKeyId('key-z')]),
      disabledKeys: new Set([createKeyId('key-enter')]),
      focusedKeyId: createKeyId('key-a'),
    });
    const transitionModel = createDesktopRenderModel(resolvedLayout, {
      activeLayer: 'base',
      modifierDisplayMode: 'transition',
      heldPhysicalKeys: new Set(),
      activeModifierKeyIds: new Set(),
      hiddenKeys: new Set(),
      disabledKeys: new Set(),
      focusedKeyId: null,
    });
    const shiftedModel = createDesktopRenderModel(resolvedLayout, {
      activeLayer: 'shift',
      modifierDisplayMode: 'hint',
      heldPhysicalKeys: new Set(),
      activeModifierKeyIds: new Set(),
      hiddenKeys: new Set(),
      disabledKeys: new Set(),
      focusedKeyId: null,
    });

    expect(hintedModel.rows).toHaveLength(2);
    expect(hintedModel.rows[0].keys[0].primaryLabel).toBe('a');
    expect(hintedModel.rows[0].keys[0].secondaryLabel).toBe('A');
    expect(hintedModel.rows[1].keys[0].width).toBe(1.5);
    expect(hintedModel.rows[0].keys[0].active).toBe(true);
    expect(hintedModel.rows[0].keys[0].focused).toBe(true);
    expect(hintedModel.rows[0].keys[1].hidden).toBe(true);
    expect(hintedModel.rows[1].keys[1].disabled).toBe(true);
    expect(hintedModel.rows[1].keys[0].overrideLabel).toBe('⇧');
    expect(hintedModel.rows[1].keys[0].secondaryLabel).toBe('');
    expect(shiftedModel.rows[0].keys[0].secondaryLabel).toBe('@');
    expect(transitionModel.rows[0].keys[0].secondaryLabel).toBe('');
  });

  it('should expose modifier hints only for keys with alternate output', () => {
    const model = createDesktopRenderModel(makeResolvedLayout(), {
      activeLayer: 'base',
      modifierDisplayMode: 'hint',
      heldPhysicalKeys: new Set(),
      activeModifierKeyIds: new Set(),
      hiddenKeys: new Set(),
      disabledKeys: new Set(),
      focusedKeyId: null,
    });

    expect(model.rows[0].keys[0].secondaryLabel).toBe('A');
    expect(model.rows[1].keys[0].secondaryLabel).toBe('');
  });
});
