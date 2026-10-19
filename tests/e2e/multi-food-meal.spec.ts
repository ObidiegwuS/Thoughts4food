import { test, expect } from "@playwright/test";

test("explains how recipe results are ranked before a search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/ranked by ingredient match/i)).toBeVisible();
});
