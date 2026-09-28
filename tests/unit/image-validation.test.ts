import { describe, expect, it } from "vitest";
import { validateImage } from "@/lib/analysis/image-validation";

describe("validateImage", () => {
  it("accepts supported images", () => expect(validateImage({ mimeType: "image/jpeg", sizeBytes: 100 }).valid).toBe(true));
  it("rejects weak evidence without nutrition", () => expect(validateImage({ mimeType: "image/jpeg", sizeBytes: 100, qualityIssues: ["The image is too dark."] }).status).toBe("insufficient-quality"));
  it("rejects images with no identifiable food", () => expect(validateImage({ mimeType: "image/jpeg", sizeBytes: 100, identifiableFood: false }).status).toBe("no-identifiable-food"));
});
