import { describe, expect, it } from 'vitest';
import {
  createKeyId,
  createLayoutLayer,
  createLayoutRow,
  createLayoutShape,
  createLayoutSlot,
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
    { characters: [], compositionRules: [] } as never,
    keyMap,
    new Map()
  );
}

describe('createDesktopRenderModel', () => {
  it('should derive rows, widths, and labels from the resolved layout', () => {
    const model = createDesktopRenderModel(makeResolvedLayout(), {
      activeLayer: 'base',
      modifierDisplayMode: 'hint',
      heldPhysicalKeys: new Set([createKeyId('key-a')]),
      hiddenKeys: new Set([createKeyId('key-z')]),
      disabledKeys: new Set([createKeyId('key-enter')]),
      focusedKeyId: createKeyId('key-a'),
    });

    expect(model.rows).toHaveLength(2);
    expect(model.rows[0].keys[0].primaryLabel).toBe('a');
    expect(model.rows[0].keys[0].secondaryLabel).toBe('A');
    expect(model.rows[1].keys[0].width).toBe(1.5);
    expect(model.rows[0].keys[0].active).toBe(true);
  });
});
