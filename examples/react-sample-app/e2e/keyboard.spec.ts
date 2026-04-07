import { test, expect } from '@playwright/test';

test.describe('BBoard React Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the keyboard custom element to be defined and rendered
    await page.waitForSelector('benin-keyboard', { state: 'attached' });
  });

  test('renders the keyboard component', async ({ page }) => {
    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toBeAttached();
  });

  test('key press emits event and updates textarea', async ({ page }) => {
    const textarea = page.getByTestId('text-output');
    await expect(textarea).toHaveValue('');

    // Click a key inside the keyboard's shadow DOM
    const keyboard = page.locator('benin-keyboard');
    const key = keyboard.locator('.bboard-key-character').first();
    await key.click();

    // Textarea should have content from the key press event
    await expect(textarea).not.toHaveValue('');
  });

  test('language switching updates keyboard', async ({ page }) => {
    const select = page.getByTestId('language-select');

    // Switch to Fon
    await select.selectOption('fon-adja');

    // Verify the keyboard element's language attribute updated
    const keyboard = page.locator('benin-keyboard');
    await expect(keyboard).toHaveAttribute('language', 'fon-adja');
  });

  test('theme toggle changes theme', async ({ page }) => {
    const toggle = page.getByTestId('theme-toggle');

    // Initial theme is light
    await expect(toggle).toContainText('light');

    // Click to switch to dark
    await toggle.click();
    await expect(toggle).toContainText('dark');

    // Verify keyboard theme attribute
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
