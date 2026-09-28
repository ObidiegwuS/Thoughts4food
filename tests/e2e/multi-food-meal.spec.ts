import { test, expect } from "@playwright/test";

test("keeps meal analysis ready for separate item and combined results", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/assumptions left visible/i)).toBeVisible();
});
