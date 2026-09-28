import { test, expect } from "@playwright/test";

test("shows a clear single-food analysis workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /clearer read/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /choose a food image/i })).toBeVisible();
});
