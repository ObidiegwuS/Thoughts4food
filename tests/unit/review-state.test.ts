import { describe, expect, it } from "vitest";
import { canConfirm, updateReviewStatus } from "@/lib/analysis/review-state";
import { fixtureFoods } from "@/lib/providers/fixture-analysis-provider";

describe("review state", () => {
  it("requires explicit review before confirmation", () => {
    expect(canConfirm(fixtureFoods[0])).toBe(false);
    expect(canConfirm(updateReviewStatus(fixtureFoods[0], "confirmed"))).toBe(true);
  });
});
