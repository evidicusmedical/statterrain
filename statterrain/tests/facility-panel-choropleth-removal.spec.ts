import { expect, test } from "@playwright/test";

test("facility details replace summary and restore visible summary", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-summary")).toBeVisible({ timeout: 15000 });
  await page.locator(".facility-marker").first().click({ force: true, timeout: 30000 });
  await expect(page.getByTestId("facility-detail-panel")).toBeVisible();
  await expect(page.getByTestId("area-summary")).toHaveCount(0);
  await expect(page.getByTestId("right-side-panel")).toHaveCount(1);
  await page.getByRole("button", { name: "Close details" }).first().click();
  await expect(page.getByTestId("area-summary")).toBeVisible();
});

test("facility details close keeps summary hidden when preference is hidden", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Hide summary" }).click();
  await expect(page.getByTestId("right-side-panel")).toHaveCount(0);
  await page.locator(".facility-marker").first().click({ force: true, timeout: 30000 });
  await expect(page.getByTestId("facility-detail-panel")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).first().click();
  await expect(page.getByTestId("right-side-panel")).toHaveCount(0);
});

test("county choropleth UI is removed and ACS source link is informational", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("County metric selector")).toHaveCount(0);
  await expect(page.getByText(/choropleth/i)).toHaveCount(0);
  await expect(page.getByText("County boundaries")).toBeVisible();
  await page.getByText("Data sources").click();
  const link = page.getByRole("link", { name: "View Census ACS source" });
  await expect(link).toHaveAttribute("href", "https://www.census.gov/programs-surveys/acs");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener noreferrer/);
});
