import { afterEach, describe, expect, it, vi } from "vitest";
import { searchTheMealDbRecipes } from "@/lib/recipes/themealdb";
import { searchSpoonacularRecipes } from "@/lib/recipes/spoonacular";
import { POST, searchRecipesWithConfiguredProvider } from "@/app/api/recipes/search/route";

vi.mock("@/lib/recipes/themealdb", () => ({
  searchTheMealDbRecipes: vi.fn(async () => ({
    recipes: [{
      id: "52772",
      title: "Teriyaki Chicken Casserole",
      imageUrl: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
      publisher: "TheMealDB",
      sourceUrl: "https://www.themealdb.com/meal/52772",
      usedIngredients: ["chicken"],
      missingIngredients: ["rice"],
      ingredients: ["1 cup chicken"],
      servings: null,
      caloriesPerServing: null,
      proteinGramsPerServing: null,
      carbohydratesGramsPerServing: null,
      fatGramsPerServing: null,
      preparationTimeMinutes: null
    }]
  }))
}));

vi.mock("@/lib/recipes/spoonacular", () => ({
  searchSpoonacularRecipes: vi.fn(async () => ({ recipes: [{ id: "spoon-1", title: "Configured Spoonacular Recipe" }] }))
}));

describe("recipe search route", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

  it("uses the real-recipe fallback when the optional Spoonacular key is absent", async () => {
    vi.stubEnv("SPOONACULAR_API_KEY", "");
    const response = await POST(new Request("http://localhost/api/recipes/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ["rice"] })
    }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.recipes[0].title).toBe("Teriyaki Chicken Casserole");
    expect(result.recipes[0].caloriesPerServing).toBeNull();
    expect(searchTheMealDbRecipes).toHaveBeenCalledWith(["rice"]);
    expect(JSON.stringify(result)).not.toContain("test-secret");
  });

  it("continues to prefer Spoonacular when its server key is configured", async () => {
    vi.stubEnv("SPOONACULAR_API_KEY", "configured-test-key");
    const result = await searchRecipesWithConfiguredProvider(["chicken", "rice"]);

    expect(result.recipes[0].title).toBe("Configured Spoonacular Recipe");
    expect(searchSpoonacularRecipes).toHaveBeenCalledWith(["chicken", "rice"]);
    expect(searchTheMealDbRecipes).not.toHaveBeenCalled();
  });

  it("normalizes and deduplicates user ingredients before calling the keyless fallback", async () => {
    vi.stubEnv("SPOONACULAR_API_KEY", "");
    const response = await POST(new Request("http://localhost/api/recipes/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: [" rice ", "EGGS", "rice"] })
    }));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.recipes[0].title).toBe("Teriyaki Chicken Casserole");
    expect(searchTheMealDbRecipes).toHaveBeenCalledWith(["rice", "EGGS"]);
    expect(searchSpoonacularRecipes).not.toHaveBeenCalled();
  });

  it("rejects empty, malformed, non-string, and oversized ingredient input", async () => {
    const empty = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: [" "] }) }));
    const malformed = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: "{" }));
    const nonString = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: [null] }) }));
    const oversized = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", headers: { "content-length": "20000" }, body: "{}" }));
    const oversizedStream = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: ["x".repeat(17000)] }) }));
    const excessiveCount = await POST(new Request("http://localhost/api/recipes/search", { method: "POST", body: JSON.stringify({ ingredients: Array.from({ length: 21 }, (_, index) => `item ${index}`) }) }));

    expect(empty.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(nonString.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(oversizedStream.status).toBe(413);
    expect(excessiveCount.status).toBe(400);
  });
});