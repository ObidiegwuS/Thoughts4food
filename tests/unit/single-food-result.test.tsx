import { describe, expect, it } from "vitest";
import { formatEstimate, formatNutritionLabel } from "@/lib/analysis/nutrition-format";
import { fixtureFoods } from "@/lib/providers/fixture-analysis-provider";

describe("single food result data", () => {
  it("contains a labeled estimate and identified ingredients", () => {
    const food = fixtureFoods[0];
    expect(formatNutritionLabel(food.nutrition)).toBe("Estimated");
    expect(food.ingredients.some((ingredient) => ingredient.evidenceStatus === "visible")).toBe(true);
    expect(formatEstimate(food.nutrition.calories, " kcal")).toBe("548 kcal");
  });
});
