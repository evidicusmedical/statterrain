import { expect, test } from '@playwright/test';

test.describe('simplified provenance source panel', () => {
  test('CMS-only default result exposes concise source metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('area-summary')).toContainText('Hospitals within radius');
    await expect(page.getByTestId('area-summary')).not.toContainText(/dialysis/i);
    await expect(page.getByTestId('area-summary')).not.toContainText('These are synthetic demonstration records and do not represent real facilities at this location.');
    await page.getByText('Hospital data source').click();
    await expect(page.getByTestId('hospital-data-source')).toContainText('CMS hospital records');
    await expect(page.getByTestId('hospital-data-source')).toContainText('Dataset release');
    await expect(page.getByTestId('hospital-data-source')).toContainText('Retrieved by StatTerrain');
    const cms = page.getByRole('link', { name: 'View official CMS hospital source' });
    await expect(cms).toBeVisible();
    await expect(cms).toHaveAttribute('target', '_blank');
    await expect(cms).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('county context source and limitation are present', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Data sources').click();
    await expect(page.getByTestId('data-sources')).toContainText('U.S. Census Bureau American Community Survey 5-year release');
    await expect(page.getByTestId('data-sources')).toContainText('2024 ACS 5-year');
    await expect(page.getByTestId('data-sources')).toContainText('2020–2024');
    await expect(page.getByTestId('area-summary')).toContainText('not estimates of population inside the selected radius');
    const acs = page.getByRole('link', { name: 'View official Census ACS source' });
    await expect(acs).toBeVisible();
    await expect(acs).toHaveAttribute('target', '_blank');
    await expect(acs).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('accordions are keyboard reachable and mobile has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByText('Summary').click().catch(() => undefined);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.getByText('Data sources').click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBeFalsy();
    await expect(page.getByRole('link', { name: 'View official Census ACS source' })).toBeVisible();
  });
});
