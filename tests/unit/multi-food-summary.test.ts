import { describe, expect, it } from "vitest";
import { buildMealSummary } from "@/lib/analysis/meal-summary";
import { fixtureFoods } from "@/lib/providers/fixture-analysis-provider";

describe("multi-food summary", () => {
  it("preserves item separation and sums displayed values", () => {
    const summary = buildMealSummary(fixtureFoods.slice(1));
    expect(summary?.items.map((item) => item.displayName)).toEqual(["Grilled chicken", "Brown rice", "Broccoli"]);
    expect(summary?.combinedNutrition.calories).toBe(551);
  });
});
