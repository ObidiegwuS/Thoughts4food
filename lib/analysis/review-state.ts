import type { FoodItem, ReviewStatus } from "@/lib/analysis/types";

export function canConfirm(item: FoodItem): boolean {
  return item.identificationStatus !== "unidentified" && item.reviewStatus !== "unreviewed";
}

export function updateReviewStatus(item: FoodItem, status: Exclude<ReviewStatus, "unreviewed">): FoodItem {
  return { ...item, reviewStatus: status };
}
