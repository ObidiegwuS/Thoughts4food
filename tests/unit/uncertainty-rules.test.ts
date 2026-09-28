import { describe, expect, it } from "vitest";
import { formatEstimate } from "@/lib/analysis/nutrition-format";
import { fixtureProvider } from "@/lib/providers/fixture-analysis-provider";

describe("uncertainty rules", () => {
  it("uses a large-serving assumption", async () => {
    const result = await fixtureProvider.analyze({ requestId: "test", imageReference: "large", mimeType: "image/jpeg", sizeBytes: 1, restrictions: [] });
    expect(result.foodItems[0]?.portion.assumptionText).toMatch(/larger than a standard/);
  });
  it("uses a range when the portion is unclear", async () => {
    const result = await fixtureProvider.analyze({ requestId: "test", imageReference: "unclear-sauce", mimeType: "image/jpeg", sizeBytes: 1, restrictions: [] });
    expect(formatEstimate(result.foodItems[0]?.portion.amount ?? null, " servings")).toBe("1-2 servings");
    expect(result.foodItems[0]?.ingredients.some((ingredient) => ingredient.evidenceStatus === "hidden-possible")).toBe(true);
  });
});
