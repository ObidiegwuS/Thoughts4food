import type { DietaryConflict, FoodItem } from "@/lib/analysis/types";

export function findDietaryConflicts(item: FoodItem, restrictions: string[]): DietaryConflict[] {
  const normalized = restrictions.map((restriction) => restriction.toLowerCase());
  return item.ingredients.flatMap((ingredient) => normalized.filter((restriction) => ingredient.name.toLowerCase().includes(restriction) || (restriction.includes("nut") && ingredient.allergenStatus !== "none")).map((restriction) => ({ restrictionName: restriction, affectedItemOrIngredient: ingredient.name, status: ingredient.evidenceStatus === "hidden-possible" ? "uncertain-conflict" as const : "potential-conflict" as const, assumptionImpact: "This restriction changes whether the ingredient can be treated as suitable for you.", warningText: `Potential conflict with your ${restriction} restriction.` })));
}
