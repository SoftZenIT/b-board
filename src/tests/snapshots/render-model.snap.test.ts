import { describe, it, expect } from 'vitest';
import { createDesktopRenderModel } from '../../ui/desktop/render-model.js';
import { createMobileRenderModel } from '../../ui/mobile/render-model.js';
import {
  desktopResolvedLayout,
  mobileResolvedLayout,
  defaultDesktopState,
  defaultMobileState,
} from '../fixtures/index.js';
import { createKeyId } from '../../public/index.js';

describe('Desktop Render Model Snapshots', () => {
  const layout = desktopResolvedLayout();

  it('base layer — Yoruba', () => {
    const model = createDesktopRenderModel(layout, defaultDesktopState());
    expect(model).toMatchSnapshot();
  });

  it('shift layer — Yoruba', () => {
    const model = createDesktopRenderModel(layout, defaultDesktopState({ activeLayer: 'shift' }));
    expect(model).toMatchSnapshot();
  });

  it('altGr layer — Yoruba', () => {
    const model = createDesktopRenderModel(layout, defaultDesktopState({ activeLayer: 'altGr' }));
    expect(model).toMatchSnapshot();
  });

  it('with hidden and disabled keys', () => {
    const model = createDesktopRenderModel(
      layout,
      defaultDesktopState({
        hiddenKeys: new Set([createKeyId('key-o')]),
        disabledKeys: new Set([createKeyId('key-enter')]),
      })
    );
    expect(model).toMatchSnapshot();
  });
});

describe('Mobile Render Model Snapshots', () => {
  const layout = mobileResolvedLayout();

  it('base layer — Yoruba', () => {
    const model = createMobileRenderModel(layout, defaultMobileState());
    expect(model).toMatchSnapshot();
  });

  it('with long-press popup', () => {
    const model = createMobileRenderModel(
      layout,
      defaultMobileState({
        longPressKeyId: createKeyId('key-a'),
        longPressVisible: true,
        longPressSelectedIndex: 1,
      })
    );
    expect(model).toMatchSnapshot();
  });

  it('xs width bucket', () => {
    const model = createMobileRenderModel(layout, defaultMobileState({ widthBucket: 'xs' }));
    expect(model).toMatchSnapshot();
  });
});
