import { test, expect } from '@playwright/test';

test('single-county county comparison copy and controls are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('County metric selector')).toBeVisible();
  await expect(page.getByLabel('Regional emergency-care map')).toBeVisible();
  await expect(page.locator('.planning-location-marker')).toBeVisible();
  await expect(page.locator('.facility-marker').first()).toBeVisible();
});

test('responsive county comparison layout keeps search reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByLabel(/Search hospital/)).toBeVisible();
  await expect(page.getByText('Send Feedback')).toBeVisible();
  await expect(page.getByText('County metric selector')).toBeVisible();
});
