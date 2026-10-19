import { test, expect } from "@playwright/test";

test("provides keyboard-accessible ingredient controls and status messaging", async ({ page }) => {
  await page.goto("/");
  const ingredientField = page.getByRole("textbox", { name: /what ingredients do you have/i });
  await expect(ingredientField).toBeVisible();
  await ingredientField.focus();
  await expect(ingredientField).toBeFocused();
  await page.getByRole("button", { name: /find recipes/i }).click();
  await expect(page.locator("#ingredient-error")).toContainText(/add at least one ingredient/i);
  await ingredientField.fill("rice");
  await page.getByRole("button", { name: /add ingredient/i }).click();
  const removeRice = page.getByRole("button", { name: /remove rice/i });
  await removeRice.focus();
  await expect(removeRice).toBeFocused();
});
