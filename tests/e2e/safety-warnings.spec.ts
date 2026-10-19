import { test, expect } from "@playwright/test";

test("keeps recipe-source and food-safety guidance visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/recipes link to their original publishers/i)).toBeVisible();
  await expect(page.getByText(/check allergy and nutrition details on the source site/i)).toBeVisible();
});
