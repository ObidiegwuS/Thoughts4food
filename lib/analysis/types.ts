export type AnalysisStatus =
  | "received"
  | "analyzing"
  | "succeeded"
  | "insufficient-quality"
  | "no-identifiable-food"
  | "failed";

export type IdentificationStatus = "identified" | "inferred" | "ambiguous" | "unidentified";
export type EvidenceStatus = "visible" | "inferred" | "hidden-possible" | "user-confirmed";
export type AllergenStatus = "none" | "identified" | "uncertain-possible";
export type PortionCertainty = "estimated" | "range" | "confirmed";
export type PrecisionStatus = "estimated" | "range" | "unavailable" | "user-confirmed-input";
export type ReviewStatus = "unreviewed" | "confirmed" | "corrected";

export interface NumericRange {
  min: number;
  max: number;
}

export type EstimateValue = number | NumericRange;

export interface NutritionEstimate {
  calories: EstimateValue | null;
  protein: EstimateValue | null;
  carbohydrates: EstimateValue | null;
  fat: EstimateValue | null;
  precisionStatus: PrecisionStatus;
  assumptions: string[];
}

export interface Micronutrient {
  nutrientName: string;
  value: string | null;
  availabilityStatus: "available" | "estimated" | "unavailable";
}

export interface PortionEstimate {
  amount: EstimateValue;
  unit: string;
  basis: string;
  certainty: PortionCertainty;
  assumptionText: string;
}

export interface IngredientObservation {
  name: string;
  evidenceStatus: EvidenceStatus;
  uncertaintyExplanation?: string;
  allergenStatus: AllergenStatus;
}

export interface AllergenFinding {
  name: string;
  status: "identified" | "uncertain-possible";
  source: string;
  warningText: string;
}

export interface DietaryConflict {
  restrictionName: string;
  affectedItemOrIngredient: string;
  status: "potential-conflict" | "confirmed-conflict" | "uncertain-conflict";
  assumptionImpact: string;
  warningText: string;
}

export interface FoodItem {
  itemId: string;
  displayName: string;
  identificationStatus: IdentificationStatus;
  portion: PortionEstimate;
  ingredients: IngredientObservation[];
  nutrition: NutritionEstimate;
  micronutrients: Micronutrient[];
  uncertaintyReasons: string[];
  allergens: AllergenFinding[];
  dietaryConflicts: DietaryConflict[];
  reviewStatus: ReviewStatus;
}

export interface MealSummary {
  items: FoodItem[];
  combinedNutrition: NutritionEstimate;
  combinedMicronutrients: Micronutrient[];
  summaryText: string;
  uncertaintyReasons: string[];
  reviewStatus: ReviewStatus;
}

export interface AnalysisResult {
  requestId: string;
  status: AnalysisStatus;
  imageReference: string;
  qualityIssues: string[];
  createdAt: string;
  foodItems: FoodItem[];
  mealSummary?: MealSummary;
}

export interface AnalysisRequest {
  requestId?: string;
  imageReference?: string;
  foodQuery?: string;
  mimeType?: string;
  sizeBytes?: number;
  restrictions: string[];
}
