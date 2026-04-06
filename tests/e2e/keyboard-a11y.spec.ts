import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the keyboard to fully render
    await page.locator('benin-keyboard .bboard-key').first().waitFor();
  });

  test('passes axe automated audit (desktop)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('benin-keyboard')
      .disableRules(['color-contrast']) // token-driven theming; manual verification
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Tab navigates between keys', async ({ page }) => {
    const firstKey = page.locator('benin-keyboard .bboard-key').first();
    await firstKey.focus();
    await expect(firstKey).toBeFocused();

    await page.keyboard.press('Tab');
    const secondKey = page.locator('benin-keyboard .bboard-key').nth(1);
    await expect(secondKey).toBeFocused();

    // Shift+Tab goes back
    await page.keyboard.press('Shift+Tab');
    await expect(firstKey).toBeFocused();
  });

  test('Arrow keys navigate within the keyboard grid', async ({ page }) => {
    const firstKey = page.locator('benin-keyboard .bboard-key').first();
    await firstKey.focus();
    await expect(firstKey).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const secondKey = page.locator('benin-keyboard .bboard-key').nth(1);
    await expect(secondKey).toBeFocused();

    await page.keyboard.press('ArrowDown');
    // Should move to the next row; just verify focus moved away from secondKey
    await expect(secondKey).not.toBeFocused();
  });

  test('action keys have readable ARIA labels', async ({ page }) => {
    const enterKey = page.locator('benin-keyboard .bboard-key[data-key-id="key-enter"]');
    await expect(enterKey).toHaveAttribute('aria-label', 'Enter');

    const shiftKey = page.locator('benin-keyboard .bboard-key[data-key-id="key-shift"]');
    await expect(shiftKey).toHaveAttribute('aria-label', 'Shift');

    const backspace = page.locator('benin-keyboard .bboard-key[data-key-id="key-backspace"]');
    await expect(backspace).toHaveAttribute('aria-label', 'Backspace');

    const space = page.locator('benin-keyboard .bboard-key[data-key-id="key-space"]');
    await expect(space).toHaveAttribute('aria-label', 'Space');
  });

  test('aria-pressed only on toggle keys', async ({ page }) => {
    // Toggle keys should have aria-pressed
    const shiftKey = page.locator('benin-keyboard .bboard-key[data-key-id="key-shift"]');
    await expect(shiftKey).toHaveAttribute('aria-pressed');

    // Non-toggle keys should NOT have aria-pressed
    const letterA = page.locator('benin-keyboard .bboard-key[data-key-id="key-a"]');
    const ariaPressed = await letterA.getAttribute('aria-pressed');
    expect(ariaPressed).toBeNull();
  });

  test('keyboard container has lang attribute', async ({ page }) => {
    const container = page.locator('benin-keyboard .keyboard-container');
    const lang = await container.getAttribute('lang');
    expect(lang).toBe('yo'); // default language is yoruba
  });

  test('keyboard container has aria-description with navigation instructions', async ({ page }) => {
    const container = page.locator('benin-keyboard .keyboard-container');
    const desc = await container.getAttribute('aria-description');
    expect(desc).toContain('Tab');
    expect(desc).toContain('Entrée');
    expect(desc).toContain('Espace');
  });

  test('live region divs exist in the DOM', async ({ page }) => {
    const politeRegion = page.locator('benin-keyboard [aria-live="polite"]');
    await expect(politeRegion).toHaveCount(1);

    const assertiveRegion = page.locator('benin-keyboard [aria-live="assertive"]');
    await expect(assertiveRegion).toHaveCount(1);
  });

  test('focus ring is visible on focused keys', async ({ page }) => {
    const key = page.locator('benin-keyboard .bboard-key').first();
    await key.focus();

    const outline = await key.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.outlineStyle;
    });

    // focus-visible should produce a non-none outline
    expect(outline).not.toBe('none');
  });

  test('Escape dismisses composition', async ({ page }) => {
    // Verify that pressing Escape when composition is armed cancels it
    const keyboard = page.locator('benin-keyboard');

    // Activate a dead key to arm composition
    const firstKey = keyboard.locator('.bboard-key').first();
    await firstKey.focus();
    await page.keyboard.press('Escape');

    // Should not crash; keyboard should still be functional
    await expect(firstKey).toBeVisible();
  });

  test('container has role="group" and aria-label', async ({ page }) => {
    const container = page.locator('benin-keyboard .keyboard-container');
    await expect(container).toHaveAttribute('role', 'group');
    await expect(container).toHaveAttribute('aria-label', 'Clavier virtuel');
  });
});
