import { buildMealSummary } from "@/lib/analysis/meal-summary";
import { normalizeAllergenFindings } from "@/lib/analysis/allergen-findings";
import { findDietaryConflicts } from "@/lib/analysis/dietary-conflicts";
import type { AnalysisProvider } from "@/lib/providers/analysis-provider";
import type { FoodItem } from "@/lib/analysis/types";

export const foodSearchCatalog = [
  "salmon",
  "salmon grain bowl",
  "chicken",
  "grilled chicken",
  "rice",
  "brown rice",
  "broccoli",
  "vegetable bowl",
  "meal"
] as const;

const foodPhraseCatalog = Array.from(new Set(foodSearchCatalog.map((phrase) => phrase.trim().toLowerCase().replace(/\s+/g, " "))))
  .sort((left, right) => right.split(/\s+/).length - left.split(/\s+/).length || right.length - left.length);

export function parseFoodSearchTerms(query: string): string[] {
  if (!query) return [];

  const normalizedWords = query
    .replace(/&/g, " and ")
    .replace(/\s+and\s+/gi, " ")
    .replace(/[\n\r]+/g, ",")
    .split(/\s*,\s*|\s*\|\s*|\s*\/\s*|\s+/)
    .flatMap((segment) => segment.split(/\s*\|\s*|\s*\/\s*/))
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !/^(and|or|with|plus)$/i.test(term));

  const matchedTerms: string[] = [];
  let index = 0;

  while (index < normalizedWords.length) {
    const remaining = normalizedWords.slice(index);
    const phraseMatch = foodPhraseCatalog.find((phrase) => {
      const phraseWords = phrase.split(/\s+/);
      if (phraseWords.length > remaining.length) return false;
      return remaining.slice(0, phraseWords.length).join(" ") === phrase;
    });

    if (phraseMatch) {
      matchedTerms.push(phraseMatch);
      index += phraseMatch.split(/\s+/).length;
      continue;
    }

    matchedTerms.push(normalizedWords[index]);
    index += 1;
  }

  return Array.from(new Set(matchedTerms.map((term) => term.replace(/\s+/g, " ").trim()).filter(Boolean)));
}

export function appendFoodSearchTerm(currentValue: string, suggestion: string): string {
  const trimmedCurrent = currentValue.trim();
  const trimmedSuggestion = suggestion.trim();

  if (!trimmedCurrent) return trimmedSuggestion;
  if (!trimmedSuggestion) return trimmedCurrent;

  const alreadyPresent = parseFoodSearchTerms(trimmedCurrent).includes(trimmedSuggestion);
  if (alreadyPresent) return trimmedCurrent;

  const hasComma = trimmedCurrent.includes(",");
  const currentEndsWithComma = /,$/.test(trimmedCurrent);

  if (hasComma && !currentEndsWithComma) {
    const lastSegment = trimmedCurrent.split(",").at(-1)?.trim() ?? "";
    if (lastSegment) {
      return `${trimmedCurrent}, ${trimmedSuggestion}`;
    }
  }

  if (currentEndsWithComma) {
    return `${trimmedCurrent} ${trimmedSuggestion}`;
  }

  return `${trimmedCurrent} ${trimmedSuggestion}`;
}

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

const matchFoodByQuery = (query: string): FoodItem[] => {
  const normalizedQuery = query.toLowerCase();
  const terms = parseFoodSearchTerms(query);
  const catalogue = [
    { keywords: ["salmon", "salmon bowl", "salmon grain", "grain bowl"], food: fixtureFoods[0] },
    { keywords: ["chicken", "grilled chicken"], food: fixtureFoods[1] },
    { keywords: ["rice", "brown rice"], food: fixtureFoods[2] },
    { keywords: ["broccoli", "veggies"], food: fixtureFoods[3] }
  ];

  const seen = new Map<string, FoodItem>();
  for (const term of terms.length > 0 ? terms : [normalizedQuery]) {
    const matchedFood = catalogue.find(({ keywords }) => keywords.some((keyword) => term.includes(keyword) || keyword.includes(term)))?.food;
    if (matchedFood) seen.set(matchedFood.itemId, matchedFood);
  }

  if (seen.size > 0) return [...seen.values()];

  const matches = catalogue.filter(({ keywords }) => keywords.some((keyword) => normalizedQuery.includes(keyword))).map(({ food }) => food);
  if (matches.length > 0) return matches;

  const exact = fixtureFoods.find((food) => normalizedQuery.includes(food.displayName.toLowerCase().replace(/[^a-z\s]/g, "")));
  return exact ? [exact] : [fixtureFoods[0]];
};

export const fixtureProvider: AnalysisProvider = {
  async analyze(request) {
    const querySource = (request.foodQuery ?? request.imageReference ?? "single-food").trim();
    const matchedFoods = matchFoodByQuery(querySource);
    const foods = matchedFoods.map((food) => {
      const ingredients = /allergen/i.test(querySource) ? [...food.ingredients, { name: "Peanuts", evidenceStatus: "user-confirmed" as const, allergenStatus: "identified" as const }] : food.ingredients;
      const updatedFood = {
        ...food,
        ingredients,
        portion: /large/i.test(querySource) ? { amount: 1.75, unit: "servings", basis: "Visible larger-than-standard serving", certainty: "estimated" as const, assumptionText: "The serving looks larger than a standard portion, so the estimate is scaled up." } : /unclear|sauce/i.test(querySource) ? { amount: { min: 0.75, max: 1.5 }, unit: "servings", basis: "Portion boundaries are not clear", certainty: "range" as const, assumptionText: "The portion is shown as a range because its boundaries are unclear." } : food.portion,
        uncertaintyReasons: /large|unclear|sauce/i.test(querySource) ? Array.from(new Set([...food.uncertaintyReasons, /large/i.test(querySource) ? "The visible serving is unusually large." : "The portion or hidden sauce is not fully visible."])) : food.uncertaintyReasons
      };
      return { ...updatedFood, allergens: normalizeAllergenFindings(ingredients), dietaryConflicts: findDietaryConflicts(updatedFood, request.restrictions) };
    });
    return { requestId: request.requestId ?? crypto.randomUUID(), status: "succeeded", imageReference: querySource, qualityIssues: [], createdAt: new Date().toISOString(), foodItems: foods, mealSummary: buildMealSummary(foods) };
  }
};
