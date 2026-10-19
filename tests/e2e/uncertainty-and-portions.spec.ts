import { test, expect } from "@playwright/test";

test("keeps provider and source transparency visible before a recipe search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/ranked by what you can use/i)).toBeVisible();
  await expect(page.getByText(/recipes link to their original publishers/i)).toBeVisible();
});
