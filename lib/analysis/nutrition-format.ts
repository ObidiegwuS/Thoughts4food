import type { EstimateValue, NumericRange, NutritionEstimate } from "@/lib/analysis/types";

export function formatEstimate(value: EstimateValue | null, unit: string): string {
  if (value === null) return "Unavailable";
  if (typeof value === "number") return `${Math.round(value)}${unit}`;
  return `${Math.round(value.min)}-${Math.round(value.max)}${unit}`;
}

export function addEstimate(left: EstimateValue | null, right: EstimateValue | null): EstimateValue | null {
  if (left === null || right === null) return null;
  if (typeof left === "number" && typeof right === "number") return left + right;
  const toRange = (value: EstimateValue): NumericRange =>
    typeof value === "number" ? { min: value, max: value } : value;
  const leftRange = toRange(left);
  const rightRange = toRange(right);
  return { min: leftRange.min + rightRange.min, max: leftRange.max + rightRange.max };
}

export function formatNutritionLabel(nutrition: NutritionEstimate): string {
  return nutrition.precisionStatus === "range" ? "Estimated range" : nutrition.precisionStatus === "unavailable" ? "Unavailable" : "Estimated";
}
