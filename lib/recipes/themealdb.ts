import { RecipeSearchError, type RecipeSearchItem } from "@/lib/recipes/types";

const mealDbBaseUrl = "https://www.themealdb.com/api/json/v1/1";
const candidateLimit = 3;

interface MealSummary {
  idMeal?: unknown;
  strMeal?: unknown;
  strMealThumb?: unknown;
}

interface MealDetails extends MealSummary {
  strSource?: unknown;
  strCategory?: unknown;
  strArea?: unknown;
  strInstructions?: unknown;
  [field: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeHttps(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

function ingredientKey(value: string): string[] {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter(Boolean);
}

function includesTerms(source: string, query: string): boolean {
  const sourceTerms = ingredientKey(source);
  const queryTerms = ingredientKey(query);
  if (queryTerms.length === 0 || queryTerms.length > sourceTerms.length) return false;
  return sourceTerms.some((_, index) => queryTerms.every((term, offset) => sourceTerms[index + offset] === term));
}

function recipeIngredients(meal: MealDetails): string[] {
  const values: string[] = [];
  for (let index = 1; index <= 20; index += 1) {
    const name = text(meal[`strIngredient${index}`]);
    if (!name) continue;
    const measure = text(meal[`strMeasure${index}`]);
    values.push(measure ? `${measure} ${name}` : name);
  }
  return values;
}

async function mealDbJson(url: URL, fetcher: typeof fetch): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12000) });
  } catch (error) {
    throw new RecipeSearchError(error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "provider");
  }
  if (response.status === 429) throw new RecipeSearchError("rate-limit");
  if (!response.ok) throw new RecipeSearchError("provider");
  try {
    return await response.json();
  } catch {
    throw new RecipeSearchError("provider");
  }
}

function recipeUrl(meal: MealDetails): string | null {
  const source = safeHttps(meal.strSource);
  if (source) return source;
  const id = text(meal.idMeal);
  return id ? `https://www.themealdb.com/meal/${encodeURIComponent(id)}` : null;
}

export async function searchTheMealDbRecipes(
  ingredients: string[],
  options: { fetcher?: typeof fetch; apiKey?: string } = {}
): Promise<{ recipes: RecipeSearchItem[]; message?: string }> {
  const fetcher = options.fetcher ?? fetch;
  const apiKey = options.apiKey ?? process.env.THEMEALDB_API_KEY ?? "1";
  const byId = new Map<string, { meal: MealSummary; matches: Set<string> }>();

  const ingredientLookups = await Promise.all(ingredients.map(async (ingredient) => {
    const url = new URL(`${mealDbBaseUrl}/filter.php`);
    url.searchParams.set("i", ingredient.replace(/\s+/g, "_").slice(0, 80));
    url.searchParams.set("key", apiKey);
    const payload = await mealDbJson(url, fetcher);
    const meals = isRecord(payload) && Array.isArray(payload.meals) ? payload.meals : [];
    return { ingredient, meals: meals.filter(isRecord) as MealSummary[] };
  }));

  for (const { ingredient, meals } of ingredientLookups) {
    for (const meal of meals) {
      const id = text(meal.idMeal);
      if (!id || !text(meal.strMeal)) continue;
      const candidate = byId.get(id) ?? { meal, matches: new Set<string>() };
      candidate.matches.add(ingredient);
      byId.set(id, candidate);
    }
  }

  const candidates = Array.from(byId.entries())
    .sort((left, right) => right[1].matches.size - left[1].matches.size || (text(left[1].meal.strMeal) ?? "").localeCompare(text(right[1].meal.strMeal) ?? ""))
    .slice(0, candidateLimit);

  if (candidates.length === 0) {
    return { recipes: [], message: "No matching recipes were returned. Try adding or changing ingredients." };
  }

  const details = await Promise.all(candidates.map(async ([id, candidate]) => {
    const url = new URL(`${mealDbBaseUrl}/lookup.php`);
    url.searchParams.set("i", id);
    url.searchParams.set("key", apiKey);
    const payload = await mealDbJson(url, fetcher);
    const meal = isRecord(payload) && Array.isArray(payload.meals) ? payload.meals.find(isRecord) as MealDetails | undefined : undefined;
    return { candidate, meal };
  }));

  const recipes: RecipeSearchItem[] = [];
  const ids = new Set<string>();
  const sources = new Set<string>();
  for (const { meal } of details) {
    if (!meal) continue;
    const id = text(meal.idMeal);
    const title = text(meal.strMeal);
    const sourceUrl = recipeUrl(meal);
    if (!id || !title || !sourceUrl || !safeHttps(sourceUrl) || ids.has(id) || sources.has(sourceUrl)) continue;
    ids.add(id);
    sources.add(sourceUrl);

    const fullIngredients = recipeIngredients(meal);
    const ingredientNamesOnly = fullIngredients.map((item) => item.replace(/^\s*[\d./\s-]+(?:cups?|tbsp|tsp|g|kg|oz|lb|ml|l|cloves?|pinch(?:es)?|cans?|packages?)?\s*/i, "").trim());
    const usedIngredients = ingredients.filter((requested) => ingredientNamesOnly.some((name) => includesTerms(name, requested) || includesTerms(requested, name)));
    const missingIngredients = fullIngredients.filter((item) => !usedIngredients.some((used) => {
      const normalized = item.replace(/^\s*[\d./\s-]+(?:cups?|tbsp|tsp|g|kg|oz|lb|ml|l|cloves?|pinch(?:es)?|cans?|packages?)?\s*/i, "").trim();
      return includesTerms(normalized, used) || includesTerms(used, normalized);
    }));
    const publisher = text(meal.strSource) ? new URL(sourceUrl).hostname.replace(/^www\./i, "") : "TheMealDB";
    const imageUrl = safeHttps(meal.strMealThumb);

    recipes.push({
      id,
      title,
      imageUrl,
      publisher,
      sourceUrl,
      usedIngredients,
      missingIngredients,
      ingredients: fullIngredients,
      servings: null,
      caloriesPerServing: null,
      proteinGramsPerServing: null,
      carbohydratesGramsPerServing: null,
      fatGramsPerServing: null,
      preparationTimeMinutes: null
    });
    if (recipes.length >= 3) break;
  }

  if (recipes.length === 0) return { recipes, message: "The provider did not return complete, source-linked recipe details for these ingredients." };
  const message = recipes.length < 3
    ? `Found ${recipes.length} verified recipe${recipes.length === 1 ? "" : "s"}. The provider returned fewer than three matches for this search.`
    : undefined;
  return { recipes, message };
}