import { test, expect } from '@playwright/test';

test('homepage loads and displays hero text', async ({ page }) => {
  await page.goto('/');

  // Expect the main hero headline to be visible
  await expect(page.locator('h1')).toContainText('YOUR VOICE.');
  await expect(page.locator('h1')).toContainText('YOUR VOTE.');

  // Expect the 'Create a Poll' button to be present
  const createPollBtn = page.locator('text=Create a Poll').first();
  await expect(createPollBtn).toBeVisible();
});

test('navigation contains essential links', async ({ page }) => {
  await page.goto('/');

  const nav = page.locator('nav');
  await expect(nav.getByRole('link', { name: 'Explore' }).first()).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Join' }).first()).toBeVisible();
});
