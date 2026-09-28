import { describe, expect, it } from "vitest";
import { formatEstimate } from "@/lib/analysis/nutrition-format";

describe("formatEstimate", () => {
  it("shows a range rather than false precision", () => expect(formatEstimate({ min: 400, max: 600 }, " kcal")).toBe("400-600 kcal"));
  it("shows unavailable data explicitly", () => expect(formatEstimate(null, "g")).toBe("Unavailable"));
});
