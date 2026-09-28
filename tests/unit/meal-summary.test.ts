import { describe, expect, it } from "vitest";
import { buildMealSummary } from "@/lib/analysis/meal-summary";
import { fixtureFoods } from "@/lib/providers/fixture-analysis-provider";

describe("buildMealSummary", () => {
  it("combines separate item estimates", () => {
    const summary = buildMealSummary(fixtureFoods.slice(1));
    expect(summary?.combinedNutrition.calories).toBe(551);
    expect(summary?.items).toHaveLength(3);
  });
});
