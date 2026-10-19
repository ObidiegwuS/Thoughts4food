import { RecipeSearchError, type RecipeSearchItem } from "@/lib/recipes/types";
import { normalizeCaloriesPerServing, normalizePerServingNutrient } from "@/lib/recipes/nutrition";

const spoonacularBaseUrl = "https://api.spoonacular.com";
const maxSearchResults = 100;
const recipeDetailBatchSize = 12;
const targetRecipeCount = 3;

interface SpoonacularIngredient {
  original?: unknown;
  originalName?: unknown;
  name?: unknown;
  amount?: unknown;
  unit?: unknown;
  unitLong?: unknown;
}

interface SpoonacularSearchResult {
  id?: unknown;
  title?: unknown;
  image?: unknown;
  usedIngredients?: SpoonacularIngredient[];
  missedIngredients?: SpoonacularIngredient[];
}

interface SpoonacularRecipeInformation {
  id?: unknown;
  title?: unknown;
  image?: unknown;
  sourceName?: unknown;
  sourceUrl?: unknown;
  extendedIngredients?: SpoonacularIngredient[];
  servings?: unknown;
  readyInMinutes?: unknown;
  nutrition?: { nutrients?: Array<{ name?: unknown; amount?: unknown; unit?: unknown }> };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asPositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function asNonNegativeNumber(value: unknown): number | null {
  return normalizePerServingNutrient(value);
}

function asWebUrl(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function asHttpsUrl(value: unknown): string | null {
  const url = asWebUrl(value);
  return url && new URL(url).protocol === "https:" ? url : null;
}

function asRecipeImageUrl(value: unknown): string | null {
  const url = asWebUrl(value);
  if (!url) return null;
  return new URL(url).hostname === "img.spoonacular.com" ? url : null;
}

function ingredientNames(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.flatMap((value) => {
    if (!isRecord(value)) return [];
    const original = asString(value.original);
    if (original) return [original];
    const name = asString(value.name) ?? asString(value.originalName);
    if (!name) return [];
    const amount = typeof value.amount === "number" && Number.isFinite(value.amount) ? String(value.amount) : null;
    const unit = asString(value.unitLong) ?? asString(value.unit);
    return [`${[amount, unit, name].filter(Boolean).join(" ")}`];
  });
}

function nutritionAmount(info: SpoonacularRecipeInformation, name: string): number | null {
  const nutrients = info.nutrition?.nutrients;
  if (!Array.isArray(nutrients)) return null;
  const nutrient = nutrients.find((item) => asString(item.name)?.toLowerCase() === name.toLowerCase());
  return asNonNegativeNumber(nutrient?.amount);
}

function matchSubmittedIngredient(name: string, requestedIngredients: string[]): string {
  const normalizedName = name.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/);
  return requestedIngredients.find((ingredient) => {
    const normalizedIngredient = ingredient.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/);
    return containsPhrase(normalizedName, normalizedIngredient) || containsPhrase(normalizedIngredient, normalizedName);
  }) ?? "";
}

function containsPhrase(tokens: string[], phrase: string[]): boolean {
  if (phrase.length === 0 || phrase.length > tokens.length) return false;
  return tokens.some((_, index) => phrase.every((token, offset) => tokens[index + offset] === token));
}

function canonicalUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function throwProviderError(status: number): never {
  if (status === 401 || status === 403) throw new RecipeSearchError("invalid-key");
  if (status === 402) throw new RecipeSearchError("quota");
  if (status === 429) throw new RecipeSearchError("rate-limit");
  throw new RecipeSearchError("provider");
}

async function requestJson(url: URL, apiKey: string, fetcher: typeof fetch): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { "x-api-key": apiKey, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new RecipeSearchError("timeout");
    }
    throw new RecipeSearchError("provider");
  }
  if (!response.ok) throwProviderError(response.status);
  return readJson(response);
}

function normalizeRecipe(
  searchResult: SpoonacularSearchResult,
  infoValue: unknown,
  requestedIngredients: string[]
): RecipeSearchItem | null {
  if (!isRecord(infoValue)) return null;
  const info = infoValue as SpoonacularRecipeInformation;
  const id = asPositiveNumber(info.id) ?? asPositiveNumber(searchResult.id);
  const title = asString(info.title) ?? asString(searchResult.title);
   const sourceUrl = asHttpsUrl(info.sourceUrl);
  if (!id || !title || !sourceUrl) return null;

  let publisher = asString(info.sourceName);
  if (!publisher) publisher = new URL(sourceUrl).hostname.replace(/^www\./i, "");

  const returnedUsed = ingredientNames(searchResult.usedIngredients);
  const requestedNames = new Map(requestedIngredients.map((ingredient) => [ingredient.toLocaleLowerCase(), ingredient]));
  const usedIngredients = Array.from(new Set(returnedUsed.flatMap((name) => {
    const matched = requestedNames.get(name.toLocaleLowerCase()) ?? matchSubmittedIngredient(name, requestedIngredients);
    return matched ? [matched] : [];
  })));
  const missingIngredients = ingredientNames(searchResult.missedIngredients);
  const nutrition = info.nutrition?.nutrients;
  const caloriesNutrient = nutrition?.find((item) => asString(item.name)?.toLowerCase() === "calories");
  const proteinNutrient = nutrition?.find((item) => asString(item.name)?.toLowerCase() === "protein");
  const carbohydrateNutrient = nutrition?.find((item) => asString(item.name)?.toLowerCase() === "carbohydrates");
  const fatNutrient = nutrition?.find((item) => asString(item.name)?.toLowerCase() === "fat");

  return {
    id: String(id),
    title,
    imageUrl: asRecipeImageUrl(info.image) ?? asRecipeImageUrl(searchResult.image),
    publisher,
    sourceUrl,
    usedIngredients,
    missingIngredients,
    ingredients: ingredientNames(info.extendedIngredients),
    servings: asPositiveNumber(info.servings),
    caloriesPerServing: normalizeCaloriesPerServing({
      caloriesPerServing: caloriesNutrient ? asNonNegativeNumber(caloriesNutrient.amount) : nutritionAmount(info, "Calories"),
      totalCalories: null,
      servings: asPositiveNumber(info.servings)
    }),
    proteinGramsPerServing: proteinNutrient ? asNonNegativeNumber(proteinNutrient.amount) : nutritionAmount(info, "Protein"),
    carbohydratesGramsPerServing: carbohydrateNutrient ? asNonNegativeNumber(carbohydrateNutrient.amount) : nutritionAmount(info, "Carbohydrates"),
    fatGramsPerServing: fatNutrient ? asNonNegativeNumber(fatNutrient.amount) : nutritionAmount(info, "Fat"),
    preparationTimeMinutes: asPositiveNumber(info.readyInMinutes)
  };
}

async function mapConcurrent<T, R>(items: T[], limit: number, map: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await map(items[index]);
    }
  }));
  return results;
}

export async function searchSpoonacularRecipes(
  ingredients: string[],
  options: { apiKey?: string; fetcher?: typeof fetch } = {}
): Promise<{ recipes: RecipeSearchItem[]; message?: string }> {
  const apiKey = options.apiKey ?? process.env.SPOONACULAR_API_KEY;
  if (!apiKey?.trim()) throw new RecipeSearchError("not-configured");
  const fetcher = options.fetcher ?? fetch;

  const searchUrl = new URL("/recipes/findByIngredients", spoonacularBaseUrl);
  searchUrl.searchParams.set("ingredients", ingredients.join(","));
  searchUrl.searchParams.set("number", String(maxSearchResults));
  searchUrl.searchParams.set("ranking", "1");
  searchUrl.searchParams.set("ignorePantry", "true");

  const searchValue = await requestJson(searchUrl, apiKey, fetcher);
  if (!Array.isArray(searchValue)) throw new RecipeSearchError("provider");
  const candidates = searchValue.filter((value): value is SpoonacularSearchResult =>
    isRecord(value) && asPositiveNumber(value.id) !== null && ingredientNames(value.usedIngredients).length > 0
  );
  const candidateIds = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const id = String(candidate.id);
    if (candidateIds.has(id)) return false;
    candidateIds.add(id);
    return true;
  });
  if (uniqueCandidates.length === 0) {
    return { recipes: [], message: "No matching recipes were returned. Try adding or changing ingredients." };
  }

  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const uniqueRecipes: RecipeSearchItem[] = [];
  const failures: RecipeSearchError[] = [];

  for (let offset = 0; offset < uniqueCandidates.length && uniqueRecipes.length < targetRecipeCount; offset += recipeDetailBatchSize) {
    const batch = uniqueCandidates.slice(offset, offset + recipeDetailBatchSize);
    const enriched = await mapConcurrent(batch, 4, async (candidate) => {
      const infoUrl = new URL(`/recipes/${encodeURIComponent(String(candidate.id))}/information`, spoonacularBaseUrl);
      infoUrl.searchParams.set("includeNutrition", "true");
      try {
        return { candidate, info: await requestJson(infoUrl, apiKey, fetcher), failure: null as RecipeSearchError | null };
      } catch (error) {
        return { candidate, info: null, failure: error instanceof RecipeSearchError ? error : new RecipeSearchError("provider") };
      }
    });
    for (const result of enriched) {
      if (result.failure) {
        failures.push(result.failure);
        continue;
      }
      if (result.info === null) continue;
      const recipe = normalizeRecipe(result.candidate, result.info, ingredients);
      if (!recipe) continue;
      const url = canonicalUrl(recipe.sourceUrl);
      if (seenIds.has(recipe.id) || seenUrls.has(url)) continue;
      seenIds.add(recipe.id);
      seenUrls.add(url);
      uniqueRecipes.push(recipe);
    }
  }

  if (uniqueRecipes.length === 0 && failures.length > 0) throw failures[0];

  if (uniqueRecipes.length === 0) {
    return { recipes: [], message: "The provider returned matches without enough verified source details to show safely. Try another ingredient search." };
  }
  if (uniqueRecipes.length < 3) {
    if (failures.length > 0) {
      return { recipes: uniqueRecipes, message: `Only ${uniqueRecipes.length} complete, source-linked recipe${uniqueRecipes.length === 1 ? " was" : "s were"} available. Some additional recipe details could not be loaded.` };
    }
    return {
      recipes: uniqueRecipes,
      message: `Found ${uniqueRecipes.length} verified recipe${uniqueRecipes.length === 1 ? "" : "s"}. The provider returned fewer than three complete, source-linked matches for this search.`
    };
  }
  if (failures.length > 0) return { recipes: uniqueRecipes, message: "Some recipe details could not be loaded, so only complete, source-linked recipes are shown." };
  return { recipes: uniqueRecipes };
}