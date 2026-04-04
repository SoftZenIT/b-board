import { test, expect } from '@playwright/test';

test.describe('Desktop keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
  });

  test('should render the canonical desktop row count', async ({ page }) => {
    await expect(page.locator('benin-keyboard').locator('[data-row-index]')).toHaveCount(4);
  });

  test('should highlight a key when the physical key is pressed', async ({ page }) => {
    await page.locator('benin-keyboard').evaluate((node) => {
      node.setAttribute('show-physical-echo', '');
    });
    await page.keyboard.down('A');
    await expect(page.locator('benin-keyboard').locator('[data-key-id="key-a"]')).toHaveClass(
      /is-active/
    );
    await page.keyboard.up('A');
  });
});
