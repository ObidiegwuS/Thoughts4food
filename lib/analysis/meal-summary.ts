import { addEstimate } from "@/lib/analysis/nutrition-format";
import type { EstimateValue, FoodItem, MealSummary, Micronutrient, NutritionEstimate } from "@/lib/analysis/types";

export function buildMealSummary(items: FoodItem[]): MealSummary | undefined {
  if (items.length < 2) return undefined;
  const sum = (values: (EstimateValue | null)[]) => values.reduce<EstimateValue | null>((total, value) => addEstimate(total, value), 0);
  const combinedNutrition: NutritionEstimate = {
    calories: sum(items.map((item) => item.nutrition.calories)),
    protein: sum(items.map((item) => item.nutrition.protein)),
    carbohydrates: sum(items.map((item) => item.nutrition.carbohydrates)),
    fat: sum(items.map((item) => item.nutrition.fat)),
    precisionStatus: items.some((item) => item.nutrition.precisionStatus === "range") ? "range" : "estimated",
    assumptions: ["Combined from the displayed item estimates."]
  };
  const micronutrients: Micronutrient[] = Array.from(new Set(items.flatMap((item) => item.micronutrients.map((nutrient) => nutrient.nutrientName)))).map((name) => {
    const matches = items.flatMap((item) => item.micronutrients).filter((nutrient) => nutrient.nutrientName === name);
    return { nutrientName: name, value: matches.every((nutrient) => nutrient.value) ? "Available" : null, availabilityStatus: matches.every((nutrient) => nutrient.value) ? "estimated" : "unavailable" };
  });
  return {
    items,
    combinedNutrition,
    combinedMicronutrients: micronutrients,
    summaryText: `Combined estimate for ${items.length} identified foods.`,
    uncertaintyReasons: Array.from(new Set(items.flatMap((item) => item.uncertaintyReasons))),
    reviewStatus: items.every((item) => item.reviewStatus !== "unreviewed") ? "confirmed" : "unreviewed"
  };
}
