export interface RecipeCaloriesInput {
  caloriesPerServing?: number | null;
  totalCalories?: number | null;
  servings?: number | null;
}

export function normalizeCaloriesPerServing({ caloriesPerServing, totalCalories, servings }: RecipeCaloriesInput): number | null {
  if (typeof caloriesPerServing === "number" && Number.isFinite(caloriesPerServing) && caloriesPerServing >= 0) {
    return caloriesPerServing;
  }
  if (typeof totalCalories !== "number" || !Number.isFinite(totalCalories) || totalCalories < 0) return null;
  if (typeof servings !== "number" || !Number.isFinite(servings) || servings <= 0) return null;
  return totalCalories / servings;
}

export function normalizePerServingNutrient(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}