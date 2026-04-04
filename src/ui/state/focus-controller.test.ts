import { describe, expect, it } from 'vitest';
import { createKeyId } from '../../public/index.js';
import { createFocusController } from './focus-controller.js';

describe('createFocusController', () => {
  it('should move focus left to right and top to bottom', () => {
    const controller = createFocusController([
      [createKeyId('key-a'), createKeyId('key-z')],
      [createKeyId('key-shift'), createKeyId('key-enter')],
    ]);

    expect(controller.move('tab', null)).toBe(createKeyId('key-a'));
    expect(controller.move('tab', createKeyId('key-a'))).toBe(createKeyId('key-z'));
    expect(controller.move('arrow-down', createKeyId('key-z'))).toBe(createKeyId('key-enter'));
  });

  it('should wrap tab to first key when at end', () => {
    const controller = createFocusController([[createKeyId('key-a'), createKeyId('key-z')]]);
    expect(controller.move('tab', createKeyId('key-z'))).toBe(createKeyId('key-a'));
  });

  it('should navigate left and right within a row', () => {
    const controller = createFocusController([
      [createKeyId('key-a'), createKeyId('key-z'), createKeyId('key-enter')],
    ]);
    expect(controller.move('arrow-right', createKeyId('key-a'))).toBe(createKeyId('key-z'));
    expect(controller.move('arrow-left', createKeyId('key-z'))).toBe(createKeyId('key-a'));
  });

  it('should stay put when there is no key in the direction', () => {
    const controller = createFocusController([[createKeyId('key-a')]]);
    expect(controller.move('arrow-right', createKeyId('key-a'))).toBe(createKeyId('key-a'));
    expect(controller.move('arrow-up', createKeyId('key-a'))).toBe(createKeyId('key-a'));
  });
});
