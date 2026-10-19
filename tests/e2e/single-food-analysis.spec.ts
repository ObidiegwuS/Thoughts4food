import { test, expect } from "@playwright/test";

const recipeResult = (id: string, title: string) => ({
  id,
  title,
  imageUrl: null,
  publisher: "Recipe Publisher",
  sourceUrl: `https://publisher.example/recipes/${id}`,
  usedIngredients: ["chicken", "rice"],
  missingIngredients: ["olive oil"],
  ingredients: ["1 lb chicken breast", "2 cups cooked brown rice", "1 tbsp olive oil"],
  servings: 4,
  caloriesPerServing: 425,
  proteinGramsPerServing: 32,
  carbohydratesGramsPerServing: 44,
  fatGramsPerServing: 12,
  preparationTimeMinutes: 30
});

test("submits normalized ingredients and shows a safe setup state when recipe credentials are absent", async ({ page }) => {
  await page.goto("/");
  const ingredientField = page.getByRole("textbox", { name: /what ingredients do you have/i });
  await expect(ingredientField).toBeVisible();
  await ingredientField.fill(" chicken, rice\n broccoli ");
  await page.getByRole("button", { name: /add ingredient/i }).click();

  await expect(page.getByRole("list", { name: /ingredients to search/i }).getByText("chicken")).toBeVisible();
  await expect(page.getByRole("list", { name: /ingredients to search/i }).getByText("rice")).toBeVisible();
  await expect(page.getByRole("list", { name: /ingredients to search/i }).getByText("broccoli")).toBeVisible();
  await page.getByRole("button", { name: /find recipes/i }).click();
  await expect(page.getByText(/SPOONACULAR_API_KEY/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /what we can see/i })).toHaveCount(0);
});

test("shows recipe cards, comparison, loading skeletons, and expandable ingredients", async ({ page }) => {
  await page.context().route("https://publisher.example/**", async (route) => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: "<title>Original recipe</title><main>Publisher recipe page</main>"
  }));
  await page.route("**/api/recipes/search", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ recipes: [recipeResult("recipe-1", "Chicken Rice Bowl"), recipeResult("recipe-2", "Chicken Rice Skillet"), recipeResult("recipe-3", "Chicken Rice Soup")] })
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /thoughts4food/i }).first()).toBeVisible();
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice, tomato");
  await page.getByRole("button", { name: /find recipes/i }).click();

  await expect(page.getByRole("region", { name: /searching recipes/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /chicken rice bowl/i })).toBeVisible();
  const saveRecipe = page.getByRole("button", { name: /save chicken rice bowl/i });
  await saveRecipe.click();
  await expect(page.getByRole("button", { name: /remove chicken rice bowl from saved recipes/i })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /remove chicken rice bowl from saved recipes/i }).click();
  await expect(page.getByRole("button", { name: /save chicken rice bowl/i })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: /nutrition comparison/i })).toBeVisible();
  await expect(page.getByRole("row", { name: /calories 425 kcal 425 kcal 425 kcal/i })).toBeVisible();
  await expect(page.getByText("Uses 2 of 3 ingredients").first()).toBeVisible();

  const ingredientDisclosure = page.locator("summary", { hasText: "View Ingredients" }).first();
  await ingredientDisclosure.click();
  await expect(page.getByText("2 cups cooked brown rice").first()).toBeVisible();
  await page.getByRole("button", { name: /view original recipe/i }).first().click();
  await expect(page.getByRole("dialog")).toContainText("publisher.example");
  await expect(page.getByRole("dialog").getByRole("heading", { name: /you're leaving thoughts4food/i })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("This recipe is hosted on an external website. Would you like to continue?");
  const closeDialog = page.getByRole("button", { name: /close dialog/i });
  const stayHere = page.getByRole("dialog").getByRole("button", { name: /stay here/i });
  const continueToRecipe = page.getByRole("dialog").getByRole("button", { name: /continue to recipe/i });
  await expect(closeDialog).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(stayHere).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(continueToRecipe).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(closeDialog).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(continueToRecipe).toBeFocused();
  await page.getByRole("dialog").getByRole("button", { name: /stay here/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /chicken rice bowl/i })).toBeVisible();

  await page.getByRole("button", { name: /view original recipe/i }).first().click();
  const popupPromise = page.context().waitForEvent("page");
  await page.getByRole("dialog").getByRole("button", { name: /continue to recipe/i }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL("https://publisher.example/recipes/recipe-1");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("rejects an unsafe recipe source with an inline message", async ({ page }) => {
  await page.route("**/api/recipes/search", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ recipes: [ { ...recipeResult("unsafe-recipe", "Unsafe Source Recipe"), sourceUrl: "javascript:alert(1)" } ] })
  }));
  await page.goto("/");
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice");
  await page.getByRole("button", { name: /find recipes/i }).click();
  await page.getByRole("button", { name: /view original recipe/i }).click();
  await expect(page.locator("#recipe-source-error-unsafe-recipe")).toContainText(/valid secure source website/i);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("closes the external recipe confirmation with Escape and restores focus", async ({ page }) => {
  await page.route("**/api/recipes/search", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ recipes: [recipeResult("recipe-escape", "Escape Test Recipe")] })
  }));
  await page.goto("/");
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice");
  await page.getByRole("button", { name: /find recipes/i }).click();
  const sourceButton = page.getByRole("button", { name: /view original recipe/i });
  await sourceButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(sourceButton).toBeFocused();
});

test("suppresses duplicate submissions while a recipe search is in flight", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/recipes/search", async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ recipes: [] }) });
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice");
  await page.locator("form").first().evaluate((form) => {
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
  });
  await expect(page.getByRole("region", { name: /searching recipes/i })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /no matching recipes/i })).toBeVisible();
  expect(requestCount).toBe(1);
});

test("shows a helpful message when the recipe API is rate-limited", async ({ page }) => {
  await page.route("**/api/recipes/search", async (route) => route.fulfill({
    status: 429,
    contentType: "application/json",
    body: JSON.stringify({ recipes: [], message: "Recipe search is busy right now. Please wait a moment and try again." })
  }));
  await page.goto("/");
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice");
  await page.getByRole("button", { name: /find recipes/i }).click();
  await expect(page.getByRole("heading", { name: /could not complete your food search/i })).toBeVisible();
  await expect(page.getByText(/wait a moment and try again/i)).toBeVisible();
});

test("keeps recipe results and confirmation usable at mobile, tablet, and desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/recipes/search", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ recipes: [recipeResult("mobile-1", "Mobile Chicken Bowl"), recipeResult("mobile-2", "Mobile Rice Pot"), recipeResult("mobile-3", "Mobile Tomato Soup")] })
  }));
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await page.getByRole("textbox", { name: /what ingredients do you have/i }).fill("chicken, rice, spinach, eggs, tomatoes");
  await page.getByRole("button", { name: /find recipes/i }).click();
  await expect(page.getByRole("heading", { name: /mobile chicken bowl/i })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await page.getByRole("button", { name: /view original recipe/i }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(390);
  await dialog.getByRole("button", { name: /stay here/i }).click();
  await expect(page.getByRole("heading", { name: /mobile chicken bowl/i })).toBeVisible();
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, `horizontal overflow at viewport width ${width}`).toBeLessThanOrEqual(dimensions.viewport);
  }
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
