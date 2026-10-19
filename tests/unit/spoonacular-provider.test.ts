import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecipeSearchError } from "@/lib/recipes/types";
import { searchSpoonacularRecipes } from "@/lib/recipes/spoonacular";

const searchPayload = [
  {
    id: 101,
    title: "Chicken and Rice Bowl",
    image: "https://img.spoonacular.com/recipes/101-312x231.jpg",
    usedIngredientCount: 2,
    missedIngredientCount: 1,
    usedIngredients: [{ name: "chicken breast" }, { name: "brown rice" }],
    missedIngredients: [{ original: "1 tbsp olive oil" }]
  },
  {
    id: 101,
    title: "Duplicate ID",
    usedIngredients: [{ name: "chicken" }],
    missedIngredients: []
  },
  {
    id: 202,
    title: "Alternate Source",
    image: "https://img.spoonacular.com/recipes/202-312x231.jpg",
    usedIngredients: [{ name: "chicken" }],
    missedIngredients: []
  }
];

function details(id: number, sourceUrl: string) {
  return {
    id,
    title: `Recipe ${id}`,
    image: `https://img.spoonacular.com/recipes/${id}-556x370.jpg`,
    sourceName: "Original Food Publisher",
    sourceUrl,
    servings: 2,
    readyInMinutes: 30,
    extendedIngredients: [{ original: "2 cups cooked brown rice" }, { amount: 1, unit: "lb", name: "chicken breast" }],
    nutrition: { nutrients: [
      { name: "Calories", amount: 420, unit: "kcal" },
      { name: "Protein", amount: 35, unit: "g" },
      { name: "Carbohydrates", amount: 48, unit: "g" },
      { name: "Fat", amount: 11, unit: "g" }
    ] }
  };
}

describe("Spoonacular recipe provider", () => {
  beforeEach(() => vi.unstubAllEnvs());

  it("normalizes provider responses, enriches details, and deduplicates candidates", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const url = new URL(input.toString());
      if (url.pathname === "/recipes/findByIngredients") return Response.json(searchPayload);
      const id = Number(url.pathname.split("/")[2]);
      const source = id === 101 ? "https://publisher.example/recipe/chicken-rice" : "https://publisher.example/recipe/alternate";
      return Response.json(details(id, source));
    });

    const result = await searchSpoonacularRecipes(["chicken", "brown rice"], { apiKey: "test-secret", fetcher });

    expect(result.recipes).toHaveLength(2);
    expect(result.recipes[0]).toMatchObject({
      id: "101",
      title: "Recipe 101",
      publisher: "Original Food Publisher",
      sourceUrl: "https://publisher.example/recipe/chicken-rice",
      ingredients: ["2 cups cooked brown rice", "1 lb chicken breast"],
      servings: 2,
      caloriesPerServing: 420,
      proteinGramsPerServing: 35,
      carbohydratesGramsPerServing: 48,
      fatGramsPerServing: 11,
      preparationTimeMinutes: 30
    });
    expect(result.recipes[0].usedIngredients).toEqual(["chicken", "brown rice"]);
    const searchUrl = new URL(fetcher.mock.calls[0][0].toString());
    expect(searchUrl.pathname).toBe("/recipes/findByIngredients");
    expect(searchUrl.searchParams.get("number")).toBe("100");
    expect(searchUrl.searchParams.get("ranking")).toBe("1");
    expect(fetcher.mock.calls.every((call) => new Headers(call[1]?.headers).get("x-api-key") === "test-secret")).toBe(true);
  });

  it("returns at least three distinct complete recipes when the provider supplies them", async () => {
    const candidates = [301, 302, 303].map((id) => ({ id, title: `Recipe ${id}`, usedIngredients: [{ name: "rice" }], missedIngredients: [] }));
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const url = new URL(input.toString());
      if (url.pathname === "/recipes/findByIngredients") return Response.json(candidates);
      const id = Number(url.pathname.split("/")[2]);
      return Response.json(details(id, `https://publisher.example/recipe/${id}`));
    });

    const result = await searchSpoonacularRecipes(["rice"], { apiKey: "test-secret", fetcher });

    expect(result.recipes).toHaveLength(3);
    expect(result.message).toBeUndefined();
  });

  it("deduplicates distinct IDs that resolve to the same canonical source URL", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const url = new URL(input.toString());
      if (url.pathname === "/recipes/findByIngredients") return Response.json(searchPayload);
      const id = Number(url.pathname.split("/")[2]);
      const source = id === 101 ? "https://publisher.example/recipe/chicken-rice" : "https://publisher.example/recipe/chicken-rice?ref=spoonacular#recipe";
      return Response.json(details(id, source));
    });

    const result = await searchSpoonacularRecipes(["chicken"], { apiKey: "test-secret", fetcher });

    expect(result.recipes).toHaveLength(1);
    expect(result.message).toMatch(/fewer than three/i);
  });

  it("rejects missing credentials without making a request", async () => {
    const fetcher = vi.fn();
    await expect(searchSpoonacularRecipes(["rice"], { apiKey: "", fetcher })).rejects.toMatchObject({ code: "not-configured" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns an honest empty result when the provider has no matches", async () => {
    const fetcher = vi.fn(async () => Response.json([]));
    const result = await searchSpoonacularRecipes(["dragon fruit"], { apiKey: "test-secret", fetcher });
    expect(result.recipes).toEqual([]);
    expect(result.message).toMatch(/no matching recipes/i);
  });

  it("maps request timeouts to a retryable provider error", async () => {
    const timeout = Object.assign(new Error("timeout details"), { name: "TimeoutError" });
    const fetcher = vi.fn(async () => { throw timeout; });
    await expect(searchSpoonacularRecipes(["rice"], { apiKey: "test-secret", fetcher })).rejects.toMatchObject({ code: "timeout" });
  });

  it.each([[401, "invalid-key"], [402, "quota"], [429, "rate-limit"], [503, "provider"]] as const)(
    "maps provider status %i to a safe error category",
    async (status, code) => {
      const fetcher = vi.fn(async () => new Response("private provider details", { status }));
      await expect(searchSpoonacularRecipes(["rice"], { apiKey: "test-secret", fetcher })).rejects.toMatchObject<Partial<RecipeSearchError>>({ code });
    }
  );

  it("does not return recipes without an original web source link", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void init;
      const url = new URL(input.toString());
      return url.pathname === "/recipes/findByIngredients"
        ? Response.json(searchPayload.slice(0, 1))
        : Response.json({ ...details(101, "javascript:alert(1)"), sourceUrl: "javascript:alert(1)" });
    });
    const result = await searchSpoonacularRecipes(["chicken"], { apiKey: "test-secret", fetcher });
    expect(result.recipes).toEqual([]);
    expect(result.message).toMatch(/without enough verified source details/i);
  });
});