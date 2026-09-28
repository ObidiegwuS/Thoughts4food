import { test, expect } from "@playwright/test";

test("shows a recovery path before analysis begins", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/well-lit image/i)).toBeVisible();
});
