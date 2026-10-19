import { test, expect } from "@playwright/test";

test("renders the recipe-search shell and reports missing API setup promptly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find something good/i })).toBeVisible();
  const started = Date.now();
  const response = await page.request.post("/api/recipes/search", { data: { ingredients: ["rice"] } });
  expect(response.status()).toBe(503);
  expect((await response.json()).message).toContain("SPOONACULAR_API_KEY");
  expect(Date.now() - started).toBeLessThan(5000);
});
