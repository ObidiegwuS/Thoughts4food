import { buildMealSummary } from "@/lib/analysis/meal-summary";
import { normalizeAllergenFindings } from "@/lib/analysis/allergen-findings";
import { findDietaryConflicts } from "@/lib/analysis/dietary-conflicts";
import type { AnalysisProvider } from "@/lib/providers/analysis-provider";
import type { FoodItem } from "@/lib/analysis/types";

const baseNutrition = (calories: number, protein: number, carbohydrates: number, fat: number) => ({
  calories,
  protein,
  carbohydrates,
  fat,
  precisionStatus: "estimated" as const,
  assumptions: ["Estimated from the visible portion."]
});

const item = (data: Partial<FoodItem> & Pick<FoodItem, "itemId" | "displayName">): FoodItem => ({
  itemId: data.itemId,
  displayName: data.displayName,
  identificationStatus: data.identificationStatus ?? "identified",
  portion: data.portion ?? { amount: 1, unit: "serving", basis: "Visible serving size", certainty: "estimated", assumptionText: "Portion is estimated from the image." },
  ingredients: data.ingredients ?? [],
  nutrition: data.nutrition ?? baseNutrition(0, 0, 0, 0),
  micronutrients: data.micronutrients ?? [],
  uncertaintyReasons: data.uncertaintyReasons ?? [],
  allergens: data.allergens ?? [],
  dietaryConflicts: data.dietaryConflicts ?? [],
  reviewStatus: data.reviewStatus ?? "unreviewed"
});

export const fixtureFoods: FoodItem[] = [
  item({ itemId: "salmon", displayName: "Salmon grain bowl", nutrition: baseNutrition(548, 36, 42, 22), ingredients: [{ name: "Salmon", evidenceStatus: "visible", allergenStatus: "none" }, { name: "Lemon tahini dressing", evidenceStatus: "hidden-possible", uncertaintyExplanation: "The sauce is partly hidden by the bowl ingredients.", allergenStatus: "uncertain-possible" }], micronutrients: [{ nutrientName: "Vitamin D", value: "72%", availabilityStatus: "estimated" }, { nutrientName: "Iron", value: "31%", availabilityStatus: "estimated" }], uncertaintyReasons: ["The dressing and exact portion are estimated."] }),
  item({ itemId: "chicken", displayName: "Grilled chicken", nutrition: baseNutrition(280, 42, 0, 12), ingredients: [{ name: "Chicken breast", evidenceStatus: "visible", allergenStatus: "none" }], micronutrients: [{ nutrientName: "Vitamin B6", value: "28%", availabilityStatus: "estimated" }] }),
  item({ itemId: "rice", displayName: "Brown rice", nutrition: baseNutrition(216, 5, 45, 2), ingredients: [{ name: "Brown rice", evidenceStatus: "visible", allergenStatus: "none" }], micronutrients: [{ nutrientName: "Magnesium", value: "21%", availabilityStatus: "estimated" }] }),
  item({ itemId: "broccoli", displayName: "Broccoli", nutrition: baseNutrition(55, 4, 11, 1), ingredients: [{ name: "Broccoli", evidenceStatus: "visible", allergenStatus: "none" }], micronutrients: [{ nutrientName: "Vitamin C", value: "84%", availabilityStatus: "estimated" }] })
];

export const fixtureProvider: AnalysisProvider = {
  async analyze(request) {
    const foods = (request.imageReference.includes("meal") ? fixtureFoods.slice(1) : [fixtureFoods[0]]).map((food) => {
      const ingredients = /allergen/i.test(request.imageReference) ? [...food.ingredients, { name: "Peanuts", evidenceStatus: "user-confirmed" as const, allergenStatus: "identified" as const }] : food.ingredients;
      const updatedFood = {
        ...food,
        ingredients,
        portion: /large/i.test(request.imageReference) ? { amount: 1.75, unit: "servings", basis: "Visible larger-than-standard serving", certainty: "estimated" as const, assumptionText: "The serving looks larger than a standard portion, so the estimate is scaled up." } : /unclear|sauce/i.test(request.imageReference) ? { amount: { min: 0.75, max: 1.5 }, unit: "servings", basis: "Portion boundaries are not clear", certainty: "range" as const, assumptionText: "The portion is shown as a range because its boundaries are unclear." } : food.portion,
        uncertaintyReasons: /large|unclear|sauce/i.test(request.imageReference) ? Array.from(new Set([...food.uncertaintyReasons, /large/i.test(request.imageReference) ? "The visible serving is unusually large." : "The portion or hidden sauce is not fully visible."])) : food.uncertaintyReasons
      };
      return { ...updatedFood, allergens: normalizeAllergenFindings(ingredients), dietaryConflicts: findDietaryConflicts(updatedFood, request.restrictions) };
    });
    return { requestId: request.requestId, status: "succeeded", imageReference: request.imageReference, qualityIssues: [], createdAt: new Date().toISOString(), foodItems: foods, mealSummary: buildMealSummary(foods) };
  }
};
