import { test, expect } from "@playwright/test";

test("keeps recipe-source and food-safety guidance visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/recipe listings link to their original publishers/i)).toBeVisible();
  await expect(page.getByText(/check original recipe pages for current ingredients, instructions, allergens/i)).toBeVisible();
});
