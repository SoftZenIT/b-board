import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Cross-framework consistency tests.
 *
 * These tests verify that <benin-keyboard> behaves identically across
 * React, Vue 3, and Angular by running the same assertions against
 * each framework's dev server.
 */

const FRAMEWORKS = [
  { name: 'React', baseURL: 'http://localhost:5174' },
  { name: 'Vue 3', baseURL: 'http://localhost:5175' },
  { name: 'Angular', baseURL: 'http://localhost:5176' },
] as const;

async function waitForKeyboard(page: Page) {
  await page.waitForSelector('benin-keyboard', { state: 'attached' });
  // Wait for keys to render (layout data loads asynchronously)
  await page.locator('benin-keyboard .bboard-key-character').first().waitFor({ state: 'attached' });
}

for (const framework of FRAMEWORKS) {
  test.describe(`${framework.name} — Keyboard Consistency`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(framework.baseURL);
      await waitForKeyboard(page);
    });

    test('keyboard renders with default language (yoruba)', async ({ page }) => {
      const keyboard = page.locator('benin-keyboard');
      await expect(keyboard).toBeAttached();
      // Use JS property check — Vue binds via property, not attribute
      await expect(keyboard).toHaveJSProperty('language', 'yoruba');
    });

    test('key press produces output in textarea', async ({ page }) => {
      const textarea = page.getByTestId('text-output');
      await expect(textarea).toHaveValue('');

      const keyboard = page.locator('benin-keyboard');
      const key = keyboard.locator('.bboard-key-character').first();
      await key.click();

      await expect(textarea).not.toHaveValue('');
    });

    test('language switch updates keyboard property', async ({ page }) => {
      const select = page.getByTestId('language-select');
      const keyboard = page.locator('benin-keyboard');

      for (const lang of ['fon-adja', 'baatonum', 'dendi', 'yoruba']) {
        await select.selectOption(lang);
        await expect(keyboard).toHaveJSProperty('language', lang);
      }
    });

    test('theme toggle updates keyboard property', async ({ page }) => {
      const toggle = page.getByTestId('theme-toggle');
      const keyboard = page.locator('benin-keyboard');

      // Start with light
      await expect(keyboard).toHaveJSProperty('theme', 'light');

      // Toggle to dark
      await toggle.click();
      await expect(keyboard).toHaveJSProperty('theme', 'dark');

      // Toggle back to light
      await toggle.click();
      await expect(keyboard).toHaveJSProperty('theme', 'light');
    });

    test('all four languages are available', async ({ page }) => {
      const select = page.getByTestId('language-select');
      const options = select.locator('option');
      await expect(options).toHaveCount(4);

      const values = await options.evaluateAll((els) =>
        els.map((el) => (el as HTMLOptionElement).value)
      );
      expect(values).toEqual(['yoruba', 'fon-adja', 'baatonum', 'dendi']);
    });
  });
}

test.describe('Cross-Framework Output Consistency', () => {
  test('same key produces same output across frameworks', async ({ browser }) => {
    const outputs: string[] = [];

    for (const framework of FRAMEWORKS) {
      const page = await browser.newPage();
      await page.goto(framework.baseURL);
      await waitForKeyboard(page);

      const keyboard = page.locator('benin-keyboard');
      const key = keyboard.locator('.bboard-key-character').first();
      await key.click();

      const textarea = page.getByTestId('text-output');
      // Wait for the event handler to update the textarea
      await expect(textarea).not.toHaveValue('');
      const value = await textarea.inputValue();
      outputs.push(value);

      await page.close();
    }

    // All frameworks should produce the same output for the same key
    expect(outputs[0]).toBeTruthy();
    expect(outputs[0]).toBe(outputs[1]);
    expect(outputs[1]).toBe(outputs[2]);
  });

  test('language options are consistent across frameworks', async ({ browser }) => {
    const allOptions: string[][] = [];

    for (const framework of FRAMEWORKS) {
      const page = await browser.newPage();
      await page.goto(framework.baseURL);
      await waitForKeyboard(page);

      const options = await page
        .getByTestId('language-select')
        .locator('option')
        .evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value));

      allOptions.push(options);
      await page.close();
    }

    expect(allOptions[0]).toEqual(allOptions[1]);
    expect(allOptions[1]).toEqual(allOptions[2]);
  });
});
