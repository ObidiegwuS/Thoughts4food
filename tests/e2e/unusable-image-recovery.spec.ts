import { test, expect } from "@playwright/test";

test("shows a recipe search starting point before ingredients are submitted", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/a new meal is one good idea away/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /find recipes/i })).toBeEnabled();
});
