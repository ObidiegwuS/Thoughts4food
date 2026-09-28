import { describe, expect, it } from "vitest";
import { validateImage } from "@/lib/analysis/image-validation";

describe("unusable image rules", () => {
  it("suppresses nutrition for poor image quality and no-food input", () => {
    expect(validateImage({ mimeType: "image/jpeg", sizeBytes: 1, qualityIssues: ["blur"] }).valid).toBe(false);
    expect(validateImage({ mimeType: "image/jpeg", sizeBytes: 1, identifiableFood: false }).valid).toBe(false);
  });
});
