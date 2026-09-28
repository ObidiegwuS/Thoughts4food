const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 10 * 1024 * 1024;

export interface ImageValidationInput {
  mimeType: string;
  sizeBytes: number;
  qualityIssues?: string[];
  identifiableFood?: boolean;
}

export interface ImageValidationResult {
  valid: boolean;
  status: "received" | "insufficient-quality" | "no-identifiable-food" | "failed";
  issues: string[];
}

export function validateImage(input: ImageValidationInput): ImageValidationResult {
  if (!supportedImageTypes.has(input.mimeType)) {
    return { valid: false, status: "failed", issues: ["This file type is not supported."] };
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > maxImageBytes) {
    return { valid: false, status: "failed", issues: ["The image must be smaller than 10 MB."] };
  }
  if (input.qualityIssues?.length) {
    return { valid: false, status: "insufficient-quality", issues: input.qualityIssues };
  }
  if (input.identifiableFood === false) {
    return { valid: false, status: "no-identifiable-food", issues: ["No food could be identified with sufficient evidence."] };
  }
  return { valid: true, status: "received", issues: [] };
}
