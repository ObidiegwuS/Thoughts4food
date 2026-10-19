export interface RecipeSearchItem {
  id: string;
  title: string;
  imageUrl: string | null;
  publisher: string;
  sourceUrl: string;
  usedIngredients: string[];
  missingIngredients: string[];
  ingredients: string[];
  servings: number | null;
  caloriesPerServing: number | null;
  proteinGramsPerServing: number | null;
  carbohydratesGramsPerServing: number | null;
  fatGramsPerServing: number | null;
  preparationTimeMinutes: number | null;
}

export interface RecipeSearchResponse {
  recipes: RecipeSearchItem[];
  message?: string;
}

export type RecipeSearchErrorCode = "not-configured" | "invalid-key" | "rate-limit" | "quota" | "timeout" | "provider";

export class RecipeSearchError extends Error {
  constructor(readonly code: RecipeSearchErrorCode) {
    super(code);
    this.name = "RecipeSearchError";
  }
}