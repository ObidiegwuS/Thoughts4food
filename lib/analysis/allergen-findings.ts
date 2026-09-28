import type { AllergenFinding, IngredientObservation } from "@/lib/analysis/types";

export function normalizeAllergenFindings(ingredients: IngredientObservation[]): AllergenFinding[] {
  return ingredients.filter((ingredient) => ingredient.allergenStatus !== "none").map((ingredient) => ({ name: ingredient.name, status: ingredient.allergenStatus === "identified" ? "identified" : "uncertain-possible", source: ingredient.evidenceStatus, warningText: ingredient.allergenStatus === "identified" ? `${ingredient.name} is identified as an allergen.` : `${ingredient.name} may be present; this allergen is uncertain.` }));
}
