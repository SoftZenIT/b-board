import { test, expect } from '@playwright/test';

test.describe('BBoard Vue 3 Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('benin-keyboard', { state: 'attached' });
  });

  test('renders the keyboard component', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toBeAttached();
  });

  test('key press emits event and updates textarea', async ({ page }) => {
    const textarea = page.getByTestId('text-output');
    await expect(textarea).toHaveValue('');

    const keyboard = page.locator('benin-keyboard');
    const key = keyboard.locator('.key-cell').first();
    await key.click();

    await expect(textarea).not.toHaveValue('');
  });

  test('language switching updates keyboard', async ({ page }) => {
    const select = page.getByTestId('language-select');

    await select.selectOption('fon-adja');

    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toHaveAttribute('language', 'fon-adja');
  });

  test('theme toggle changes theme', async ({ page }) => {
    const toggle = page.getByTestId('theme-toggle');

    await expect(toggle).toContainText('light');

    await toggle.click();
    await expect(toggle).toContainText('dark');

    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toHaveAttribute('theme', 'dark');
  });

  test('all language options are available', async ({ page }) => {
    const select = page.getByTestId('language-select');
    const options = select.locator('option');
    await expect(options).toHaveCount(4);

    const values = await options.evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value)
    );
    expect(values).toEqual(['yoruba', 'fon-adja', 'baatonum', 'dendi']);
  });
});
