import { describe, expect, it } from "vitest";
import { normalizeCaloriesPerServing } from "@/lib/recipes/nutrition";

describe("recipe calorie normalization", () => {
  it("uses provider calories-per-serving directly without dividing again", () => {
    expect(normalizeCaloriesPerServing({ caloriesPerServing: 420, totalCalories: 1680, servings: 4 })).toBe(420);
  });

  it("divides explicit whole-recipe calories by a valid serving count", () => {
    expect(normalizeCaloriesPerServing({ totalCalories: 1680, servings: 4 })).toBe(420);
  });

  it("preserves zero calories as a valid provider value", () => {
    expect(normalizeCaloriesPerServing({ caloriesPerServing: 0, totalCalories: 800, servings: 4 })).toBe(0);
  });

  it.each([null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])("does not divide a total when serving count is invalid (%s)", (servings) => {
    expect(normalizeCaloriesPerServing({ totalCalories: 800, servings })).toBeNull();
  });

  it("does not invent calories when neither supported source value exists", () => {
    expect(normalizeCaloriesPerServing({ servings: 2 })).toBeNull();
  });
});