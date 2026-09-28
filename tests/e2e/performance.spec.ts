import { test, expect } from "@playwright/test";

test("renders the initial analysis shell promptly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /clearer read/i })).toBeVisible();
  const started = Date.now();
  const response = await page.request.post("/api/analyze", { data: { imageReference: "single-food", mimeType: "image/jpeg", sizeBytes: 1 } });
  expect(response.ok()).toBe(true);
  expect(Date.now() - started).toBeLessThan(5000);
});
