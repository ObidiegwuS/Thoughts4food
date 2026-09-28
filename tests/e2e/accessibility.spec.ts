import { test, expect } from "@playwright/test";

test("provides keyboard-accessible image controls and status messaging", async ({ page }) => {
  await page.goto("/");
  const upload = page.getByRole("button", { name: /choose a food image/i });
  await expect(upload).toBeVisible();
  await upload.focus();
  await expect(upload).toBeFocused();
  await expect(page.getByRole("status")).toBeVisible();
});
