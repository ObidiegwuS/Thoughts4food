import { describe, expect, it, vi } from "vitest";
import { RecipeSearchError } from "@/lib/recipes/types";
import { searchTheMealDbRecipes } from "@/lib/recipes/themealdb";

const chickenSummary = [
  { idMeal: "52772", strMeal: "Teriyaki Chicken Casserole", strMealThumb: "https://www.themealdb.com/images/media/meals/teriyaki.jpg" },
  { idMeal: "52773", strMeal: "Chicken Rice Bowl", strMealThumb: "https://www.themealdb.com/images/media/meals/rice.jpg" }
];
const riceSummary = [
  chickenSummary[1],
  { idMeal: "52774", strMeal: "Egg Fried Rice", strMealThumb: "https://www.themealdb.com/images/media/meals/egg-rice.jpg" }
];

function mealDetails(id: string, title: string, source: string | null = "https://publisher.example/recipe") {
  return {
    idMeal: id,
    strMeal: title,
    strMealThumb: `https://www.themealdb.com/images/media/meals/${id}.jpg`,
    strSource: source,
    strIngredient1: "Chicken Breast",
    strMeasure1: "2 cups",
    strIngredient2: "Rice",
    strMeasure2: "1 lb",
    strIngredient3: "",
    strMeasure3: "",
    strInstructions: "Provider instructions remain on the source page."
  };
}

describe("TheMealDB fallback provider", () => {
  it("searches each submitted ingredient, merges and ranks real meals, and normalizes detail records", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input.toString());
      expect(init?.cache).toBe("no-store");
      if (url.pathname.endsWith("/filter.php")) {
        return Response.json({ meals: url.searchParams.get("i") === "chicken" ? chickenSummary : riceSummary });
      }
      const id = url.searchParams.get("i") ?? "";
      const title = [...chickenSummary, ...riceSummary].find((meal) => meal.idMeal === id)?.strMeal ?? "Unknown meal";
      return Response.json({ meals: [mealDetails(id, title, `https://publisher.example/${id}`)] });
    });

    const result = await searchTheMealDbRecipes(["chicken", "rice"], { fetcher, apiKey: "1" });

    expect(result.recipes).toHaveLength(3);
    expect(result.recipes[0]).toMatchObject({
      id: "52773",
      title: "Chicken Rice Bowl",
      publisher: "publisher.example",
      sourceUrl: "https://publisher.example/52773",
      usedIngredients: ["chicken", "rice"],
      ingredients: ["2 cups Chicken Breast", "1 lb Rice"],
      caloriesPerServing: null,
      proteinGramsPerServing: null,
      servings: null
    });
    expect(new URL(fetcher.mock.calls[0][0].toString()).searchParams.get("i")).toBe("chicken");
    expect(result.recipes.map((recipe) => recipe.id)).toEqual(["52773", "52774", "52772"]);
  });

  it("uses a validated TheMealDB source page when the meal has no original publisher URL", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      return url.pathname.endsWith("/filter.php")
        ? Response.json({ meals: chickenSummary.slice(0, 1) })
        : Response.json({ meals: [mealDetails("52772", "Teriyaki Chicken Casserole", null)] });
    });

    const result = await searchTheMealDbRecipes(["chicken"], { fetcher });
    expect(result.recipes[0].publisher).toBe("TheMealDB");
    expect(result.recipes[0].sourceUrl).toBe("https://www.themealdb.com/meal/52772");
  });

  it("returns a clear empty state when the provider has no ingredient matches", async () => {
    const fetcher = vi.fn(async () => Response.json({ meals: null }));
    const result = await searchTheMealDbRecipes(["unknown ingredient"], { fetcher });
    expect(result.recipes).toEqual([]);
    expect(result.message).toMatch(/no matching recipes/i);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("maps rate limits and timeouts to safe provider errors", async () => {
    const rateLimited = vi.fn(async () => new Response("private details", { status: 429 }));
    await expect(searchTheMealDbRecipes(["rice"], { fetcher: rateLimited })).rejects.toMatchObject<Partial<RecipeSearchError>>({ code: "rate-limit" });

    const timeout = Object.assign(new Error("internal timeout"), { name: "TimeoutError" });
    const timedOut = vi.fn(async () => { throw timeout; });
    await expect(searchTheMealDbRecipes(["rice"], { fetcher: timedOut })).rejects.toMatchObject<Partial<RecipeSearchError>>({ code: "timeout" });
  });
});