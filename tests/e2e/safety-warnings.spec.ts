import { test, expect } from "@playwright/test";

test("keeps safety language visible in the analysis shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/estimates are not guarantees/i)).toBeVisible();
  await expect(page.getByText(/allergy or medical decisions/i)).toBeVisible();
});
