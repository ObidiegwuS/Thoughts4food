# Data Model: Food Nutrition and Ingredients Analysis

## Analysis Request

Represents one user-provided food image made available for analysis.

**Fields**:
- `requestId`: Identifier for the current analysis attempt.
- `imageReference`: Reference to the image currently being analyzed; the model does not define storage or retention.
- `status`: `received`, `analyzing`, `succeeded`, `insufficient-quality`, `no-identifiable-food`, or `failed`.
- `qualityIssues`: Zero or more reasons the image may not support reliable analysis, such as blur, low light, obstruction, or incomplete framing.
- `createdAt`: Time the analysis attempt began.

**Validation rules**:
- The request must not enter a nutrition-result state when no food is identifiable with sufficient evidence.
- A pending request must expose progress feedback.
- A failure state must expose an actionable recovery path.

## Food Item

Represents one separately identified food within the image.

**Fields**:
- `itemId`: Identifier unique within the analysis.
- `displayName`: User-facing food name.
- `identificationStatus`: `identified`, `inferred`, `ambiguous`, or `unidentified`.
- `portion`: Estimated amount or range, plus the basis and uncertainty status.
- `ingredients`: Related ingredient observations.
- `nutrition`: Item-level nutrition estimate.
- `micronutrients`: Relevant available vitamins and minerals.
- `uncertaintyReasons`: Reasons the item result is approximate.
- `allergens`: Related allergen findings.
- `dietaryConflicts`: Related profile-restriction conflicts.
- `reviewStatus`: `unreviewed`, `confirmed`, or `corrected`.

**Validation rules**:
- Only identified or reasonably inferred foods may receive an estimate.
- An ambiguous item must be visibly marked and must not be treated as confirmed without user review.
- Each item in a multi-food image remains separately addressable.

## Ingredient Observation

Represents a visible, inferred, hidden, or user-confirmed ingredient associated with a food item.

**Fields**:
- `name`: Ingredient name.
- `evidenceStatus`: `visible`, `inferred`, `hidden-possible`, or `user-confirmed`.
- `uncertaintyExplanation`: Why the ingredient is not known with certainty.
- `allergenStatus`: `none`, `identified`, or `uncertain-possible`.

**Validation rules**:
- Hidden or inferred ingredients cannot be displayed as confirmed facts without user confirmation.
- An identified allergen must be labeled independently of profile restrictions.
- An uncertain possible allergen must remain distinct from an identified allergen.

## Portion Estimate

Represents the amount assumption used by item nutrition.

**Fields**:
- `amount`: Single amount when supported or lower/upper values for a range.
- `unit`: User-facing unit.
- `basis`: Visible serving size, comparison, or user confirmation.
- `certainty`: `estimated`, `range`, or `confirmed`.
- `assumptionText`: Plain-language explanation.

**Validation rules**:
- A visibly large portion must not be normalized to a standard serving without disclosure.
- An indeterminate portion must use a range or explicit uncertainty warning.

## Nutrition Estimate

Represents the energy and macronutrient result for a food item or meal summary.

**Fields**:
- `calories`: Estimated value or range, with units.
- `protein`: Estimated value or range, with units.
- `carbohydrates`: Estimated value or range, with units.
- `fat`: Estimated value or range, with units.
- `precisionStatus`: `estimated`, `range`, `unavailable`, or `user-confirmed-input`.
- `assumptions`: Relevant preparation, portion, or ingredient assumptions.

**Validation rules**:
- Values must not imply more precision than image evidence supports.
- Missing values are displayed as unavailable, never as invented zeroes.
- Meal totals are derived from displayed item estimates under a stated rounding convention.

## Micronutrient Set

Represents supported relevant vitamins and minerals for an item or meal.

**Fields**:
- `nutrientName`: Vitamin or mineral name.
- `value`: Estimated value or supported relative amount.
- `availabilityStatus`: `available`, `estimated`, or `unavailable`.

**Validation rules**:
- Unavailable data is distinct from zero.
- Item-level micronutrients remain associated with their food item where available.

## Allergen Finding

Represents an allergen identified or reasonably inferred from food information.

**Fields**:
- `name`: Allergen name, such as peanut, tree nut, or shellfish.
- `status`: `identified` or `uncertain-possible`.
- `source`: Food identification, ingredient observation, or user confirmation.
- `warningText`: Explicit user-facing warning.

**Validation rules**:
- Identified allergens are displayed whether or not the profile has a matching restriction.
- Uncertain possible allergens use uncertainty language and are not displayed as confirmed.

## Dietary Conflict

Represents a potential conflict between an item or ingredient and a stored user restriction.

**Fields**:
- `restrictionName`: Stored or user-defined restriction.
- `affectedItemOrIngredient`: Related food or ingredient.
- `status`: `potential-conflict`, `confirmed-conflict`, or `uncertain-conflict`.
- `assumptionImpact`: How the restriction changes the interpretation or estimate.
- `warningText`: Plain-language warning.

**Validation rules**:
- Potential conflicts are flagged and are never silently marked safe.
- A restriction that affects assumptions must explain that impact.

## Meal Summary

Represents the combined result for all identified food items.

**Fields**:
- `items`: Ordered set of food items.
- `combinedNutrition`: Combined calories and macronutrients.
- `combinedMicronutrients`: Supported combined micronutrients.
- `summaryText`: Plain-language meal summary.
- `uncertaintyReasons`: Aggregated material uncertainties.
- `reviewStatus`: Unreviewed until all required uncertain details are confirmed or corrected.

**Relationships and transitions**:
- One analysis request has zero or more food items.
- One food item has zero or more ingredient observations, allergen findings, and dietary conflicts.
- A successful multi-food analysis creates one meal summary from two or more item results.
- A result moves from `unreviewed` to `confirmed` or `corrected` only through explicit user action.
- A result with unresolved uncertainty cannot be treated as consumed or logged nutrition.
