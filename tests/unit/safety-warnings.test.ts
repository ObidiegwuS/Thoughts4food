import { describe, expect, it } from "vitest";
import { normalizeAllergenFindings } from "@/lib/analysis/allergen-findings";
import { fixtureFoods } from "@/lib/providers/fixture-analysis-provider";

describe("safety warnings", () => {
  it("keeps possible ingredients distinct from confirmed allergens", () => {
    const findings = normalizeAllergenFindings(fixtureFoods[0].ingredients);
    expect(findings[0]?.status).toBe("uncertain-possible");
  });
  it("labels a confirmed allergen independently of profile restrictions", async () => {
    const result = await (await import("@/lib/providers/fixture-analysis-provider")).fixtureProvider.analyze({ requestId: "test", imageReference: "allergen", mimeType: "image/jpeg", sizeBytes: 1, restrictions: [] });
    expect(result.foodItems[0]?.allergens.some((finding) => finding.name === "Peanuts" && finding.status === "identified")).toBe(true);
  });
});
