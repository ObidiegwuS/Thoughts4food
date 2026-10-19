import { test, expect } from "@playwright/test";

test("renders the recipe-search dashboard and finds provider recipes promptly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find your next meal/i })).toBeVisible();
  const started = Date.now();
  const response = await page.request.post("/api/recipes/search", { data: { ingredients: ["rice"] } });
  const data = await response.json();
  expect(response.ok()).toBe(true);
  expect(data.recipes.length).toBeGreaterThan(0);
  expect(Date.now() - started).toBeLessThan(15000);
});
