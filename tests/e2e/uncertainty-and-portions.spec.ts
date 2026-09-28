import { test, expect } from "@playwright/test";

test("shows uncertainty language before a result is reviewed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/assumptions left visible/i)).toBeVisible();
  await expect(page.getByText(/result will always be marked as estimated/i)).toBeVisible();
});
