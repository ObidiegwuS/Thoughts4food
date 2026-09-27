# Feature Specification: Food Nutrition and Ingredients Analysis

**Feature Branch**: `001-food-nutrition-analysis`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: Create a functional specification for a food ingredients with nutritional vaules analysis application based on aggregated test cases and requirements.

## 1. Overview

The application lets a user to receive a food image and an analysis of visible food items, ingredients, estimated nutrition, portion uncertainty, allergens, and dietary-restriction conflicts. Results must favor understandable, conservative communication over unsupported precision. The user must be able to correct or confirm uncertain findings before the analysis is treated as consumed or logged nutrition.

The feature covers image analysis and presentation of its results. Exercise tracking, meal planning, social features, and unrelated account-management capabilities are out of scope.

## 2. User Stories

### User Story 1 - Analyze a Food Image (Priority: P1)

As a user, I want to receive a clear food image so that I can see the foods, ingredients, and estimated nutrition represented in it.

**Why this priority**: This is the primary product value and the minimum viable user journey.

**Independent Test**: Revieves a clear imgae containing one identifiable food and verify that the application presents the food, ingredients, nutrition estimates, estimate labeling, and a correction or confirmation opportunity.

**Acceptance Scenarios**:

1. **Given** a clear list containing one identifiable food, **When** the user submits it, **Then** the application identifies and displays the food and its visible or inferred ingredients.
2. **Given** an identified food, **When** analysis completes, **Then** the application displays estimated calories, protein, carbohydrates, fat, and relevant available vitamins and minerals.
3. **Given** nutrition calculated from a food, **When** results are shown, **Then** the application clearly labels the nutrition as estimated and does not imply unsupported precision.
4. **Given** a normal successful food idea or list, **When** the user submits the text, **Then** results are presented within approximately 5 seconds under normal conditions.

### User Story 2 - Understand a Multi-Food Meal (Priority: P1)

As a user, I want each food in a meal analyzed separately and together so that I can understand both item-level and meal-level nutrition.

**Why this priority**: Meals commonly contain multiple foods, and item-level detail is needed to identify assumptions and uncertainty.

**Independent Test**: Submit a clear food list containing grilled chicken, rice, and broccoli and verify separate food results plus combined totals and a combined summary.

**Acceptance Scenarios**:

1. **Given** an image containing multiple identifiable foods, **When** analysis completes, **Then** each food is displayed as an individual item.
2. **Given** multiple identified foods, **When** nutrition is calculated, **Then** each item has its own estimated nutrition and available micronutrients.
3. **Given** multiple identified foods, **When** the result is displayed, **Then** the application provides combined calorie, protein, carbohydrate, and fat totals and a combined nutritional summary.

### User Story 3 - Review Uncertainty and Portion Size (Priority: P1)

As a user, I want uncertainty and portion assumptions explained so that I do not mistake an approximate result for a measured fact.

**Why this priority**: Portion size and hidden ingredients materially affect nutrition and are central to preventing misleading results.

**Independent Test**: Recieve a imgae with an unusually large serving and concealed sauce, then verify the result shows the larger serving assumption, uncertainty, and an editable confirmation path.

**Acceptance Scenarios**:

1. **Given** an unusually large visible portion, **When** analysis completes, **Then** the estimate reflects the larger serving rather than silently using a standard serving.
2. **Given** an undetermined portion size, **When nutrition is shown, **Then** the application presents a reasonable range or uncertainty warning instead of false precision.
3. **Given** a hidden sauce, topping, filling, or similar ingredient, **When analysis completes, **Then** the application identifies that ingredient as uncertain and provides an estimate only when reasonable.
4. **Given** uncertain foods, ingredients, or portions, **When the user reviews results, **Then** the user can correct or confirm them before they are treated as consumed or logged nutrition.

### User Story 4 - Detect Allergens and Dietary Conflicts (Priority: P1)

As a user, I want allergen warnings and dietary-restriction conflicts shown explicitly so that I can make a safer decision.

**Why this priority**: Missing or ambiguous allergen information can cause harm, and warnings must not depend on a profile setting.

**Independent Test**: Analyze a food containing a detectable peanut or shellfish ingredient with and without a stored restriction, then verify an explicit allergen label and, when applicable, a separate profile conflict flag.

**Acceptance Scenarios**:

1. **Given** a detected or reasonably inferred common allergen, **When results are shown, **Then** it is explicitly labeled as an allergen regardless of the user's stored restrictions.
2. **Given** a food that potentially conflicts with a stored restriction such as gluten-free, vegetarian, or nut allergy, **When results are shown, **Then** the item is flagged as a potential dietary conflict and is not silently treated as safe.
3. **Given** a restriction that changes an estimation assumption, **When the estimate is shown, **Then** the affected assumption is communicated to the user.
4. **Given** an ingredient that is only uncertain, **When results are shown, **Then** it is distinguished from a confirmed or identified allergen.

### User Story 5 - Recover from an Unusable Image (Priority: P1)

As a user, I want a clear explanation when a imgae cannot be analyzed so that I can correct the problem without receiving fabricated nutrition.

**Why this priority**: Safe rejection is required when evidence is insufficient.

**Independent Test**: Receive blurry, poorly lit, obstructed, non-food, and no-identifiable-food images and verify that each produces an understandable failure state without nutrition values.

**Acceptance Scenarios**:

1. **Given** a blurry, poorly lit, obstructed, or otherwise insufficient image, **When the user receives it, **Then** the application explains that image quality is insufficient and identifies the relevant reason when available.
2. **Given** an image in which no food can be identified, **When analysis completes, **Then** the application does not fabricate or display nutrition information and guides the user to submit a better image.
3. **Given** an ambiguous image, **When the application cannot confidently identify food, **Then** it requests user correction or a replacement image rather than presenting uncertain nutrition as reliable.

## 3. Functional Requirements

### Food Image Analysis

- **FR-001**: The application MUST allow the user to recieve a food image for analysis.
  - **Acceptance criteria**: A received supported image enters an analysis state and eventually produces either a result or an actionable failure message.
- **FR-002**: The application MUST identify and display each food item that can be identified in the image.
  - **Acceptance criteria**: A single-food image shows one identified item; a multi-food image shows separate items rather than only one combined label.
- **FR-003**: The application MUST display visible ingredients and identify inferred ingredients as inferred rather than confirmed.
  - **Acceptance criteria**: Known or visible ingredients are labeled as identified; hidden or inferred ingredients carry an uncertainty indication.
- **FR-004**: For an identified food, the application MUST estimate and display calories, protein, carbohydrates, and fat.
  - **Acceptance criteria**: A successful result includes all four nutrition categories or explicitly marks a category unavailable; it never substitutes an invented value.
- **FR-005**: The application MUST display relevant available micronutrients, including vitamins and minerals, for individual foods where information supports an estimate.
  - **Acceptance criteria**: Available micronutrients are shown at item level; unavailable micronutrients are not presented as measured facts.
- **FR-006**: For multiple identified foods, the application MUST provide item-level nutrition and combined meal totals and summary.
  - **Acceptance criteria**: Combined totals equal the displayed item estimates within the displayed rounding convention, and the result distinguishes item values from meal totals.

### Uncertainty and Portion Size

- **FR-007**: The application MUST label image-derived nutrition as estimated and communicate the evidence or assumption causing material uncertainty.
  - **Acceptance criteria**: Every estimate has an estimate label, and results with uncertain ingredients, portions, or identification name the relevant uncertainty.
- **FR-008**: The application MUST account for visible portion size, including unusually large portions.
  - **Acceptance criteria**: A visibly large portion produces an estimate based on the larger serving and identifies the serving assumption.
- **FR-009**: When portion size cannot be reliably determined, the application MUST present a reasonable range or uncertainty warning rather than unsupported precise values.
  - **Acceptance criteria**: The result uses a range or clear warning and does not display precision that the image cannot support.
- **FR-010**: The application MUST treat hidden, obscured, or visually indeterminate ingredients as uncertain.
  - **Acceptance criteria**: A concealed sauce, topping, or filling is never labeled confirmed solely because it is a plausible ingredient; an estimate may be shown only with an uncertainty notice.

### Restrictions and Allergens

- **FR-011**: The application MUST compare identified or reasonably inferred foods and ingredients against dietary restrictions stored in the user's profile.
  - **Acceptance criteria**: Potential conflicts with gluten-free, vegetarian, nut allergy, or user-defined restrictions are flagged per item and are not silently treated as safe.
- **FR-012**: The application MUST explain when a dietary restriction changes an estimation assumption.
  - **Acceptance criteria**: The result states which assumption was affected and how it affects interpretation of the estimate.
- **FR-013**: The application MUST explicitly label common allergens when detected or reasonably inferred from available food information.
  - **Acceptance criteria**: Peanuts, tree nuts, shellfish, and other detected common allergens appear in a distinct allergen warning, whether or not the user has a matching profile restriction.
- **FR-014**: The application MUST distinguish confirmed or identified allergens from merely uncertain ingredients.
  - **Acceptance criteria**: A confirmed or identified allergen has an allergen label; an uncertain possible ingredient uses uncertainty language and is not represented as confirmed.

### Safe Review and Failure Handling

- **FR-015**: The application MUST not display nutrition information when no food can be identified with sufficient evidence.
  - **Acceptance criteria**: No-identifiable-food and non-food submissions produce no calorie or nutrient values and provide a retry or replacement-image action.
- **FR-016**: The application MUST provide an opportunity for the user to correct or confirm uncertain identified foods, ingredients, portions, restrictions, or allergen assumptions before treating the result as consumed or logged nutrition.
  - **Acceptance criteria**: A result with uncertainty includes correction or confirmation controls; consumption/logging cannot be treated as confirmed solely from an unreviewed uncertain result.
- **FR-017**: The application MUST explain insufficient image quality and the reason analysis cannot be trusted.
  - **Acceptance criteria**: Blurry, dark, obstructed, or otherwise inadequate images show an understandable reason and a path to submit another image, without misleading nutrition output.
- **FR-018**: The application MUST communicate analysis progress during a wait and present results within approximately 5 seconds for normal successful scans.
  - **Acceptance criteria**: The user sees an immediate progress state, and normal successful scan completion meets the approximately 5-second target.

## 4. User Workflows

### Successful Single-Food Scan

1. The user receives a clear image.
2. The application indicates that analysis is in progress.
3. The application identifies the food and ingredients, estimates portion and nutrition, and marks assumptions.
4. The user reviews calories, macronutrients, micronutrients, uncertainty, allergens, and dietary conflicts.
5. The user corrects or confirms uncertain details before treating the result as consumed or logged nutrition.

### Successful Multi-Food Scan

1. The user receives a clear meal image.
2. The application identifies each food separately.
3. The application presents item-level ingredients, portion assumptions, nutrition, micronutrients, warnings, and uncertainty.
4. The application presents combined macronutrient totals and a combined meal summary.
5. The user reviews and confirms or corrects uncertain details.

### Unclear or Unusable Scan

1. The user receievs a blurry, dark, obstructed, non-food, or ambiguous image.
2. The application explains why the result cannot be trusted.
3. The application withholds fabricated or misleading nutrition values.
4. The user receives a replacement image or corrects the identified information when correction is available.

## 5. Error and Edge Cases

- Blurry, dark, obstructed, tightly cropped, or otherwise insufficient image must produce an understandable quality error and no misleading nutrition.
- Image containing no food or only non-food objects must not produce nutrition values.
- Multiple foods must not be collapsed into a single item when they can be distinguished.
- A single identifiable food must still be labeled estimated, even when identification confidence is high.
- Hidden sauces, toppings, fillings, and preparation ingredients must remain uncertain unless confirmed by the user.
- Unusually large portions must not be normalized to a standard serving without disclosure.
- Unknown portion size must yield a range or an uncertainty warning.
- An allergen warning must remain visible even when no matching user restriction exists.
- A possible allergen inferred from uncertain information must be distinguished from a confirmed allergen.
- A restriction conflict must be flagged even when the application cannot conclusively determine whether the ingredient is present.
- Unavailable nutrition or micronutrient data must be identified as unavailable, not replaced by fabricated precision.
- A user correction or confirmation must be able to resolve an uncertain result before consumption/logging treatment.

## 6. Data/Information Requirements

The application must present or use the following information without implying more certainty than the evidence supports:

- **Food item**: Display name, identification status, and any identification uncertainty.
- **Ingredient**: Ingredient name, visibility or inference status, and uncertainty explanation when applicable.
- **Portion**: Estimated amount or serving range, visible-size basis, and portion uncertainty.
- **Nutrition estimate**: Calories, protein, carbohydrates, fat, units, estimate status, and supported precision.
- **Micronutrients**: Relevant vitamins and minerals available for an item, with unavailable data distinguished from zero.
- **Meal summary**: Combined calories and macronutrients, plus supported combined micronutrient information.
- **Allergen**: Allergen name, detection or inference status, and explicit allergen label.
- **Dietary restriction**: Stored restriction, affected food or ingredient, conflict status, and assumption impact.
- **Review status**: Whether uncertain findings are unreviewed, user-confirmed, or user-corrected before consumption/logging.
- **Image analysis status**: Progress, success, insufficient quality, no-identifiable-food, or other actionable failure state.

Dietary-restriction and allergen information must be handled as sensitive safety-related user information: it should be shown only in the context needed for the user’s decision, protected from unauthorized access, and not exposed through unnecessary messages or displays.

## 7. Non-Functional Requirements

- **NFR-001 Performance**: Normal successful food scans SHOULD present results within approximately 5 seconds of submission under normal conditions.
- **NFR-002 Responsiveness**: The application MUST provide immediate progress feedback while analysis is pending and must not leave the user uncertain whether the submission was received.
- **NFR-003 Clarity**: Results, warnings, estimates, ranges, unavailable data, and user actions MUST use clear, understandable language and consistent labels.
- **NFR-004 Trust and safety**: The application MUST prevent misleading nutrition results by withholding unsupported values, avoiding false precision, and surfacing material assumptions.
- **NFR-005 Accessibility**: Upload, progress, error, warning, correction, confirmation, and nutrition-result states MUST be usable with keyboard navigation, understandable to assistive technology, and readable with sufficient visual contrast.
- **NFR-006 Information safety**: Allergen and dietary-restriction information MUST be protected against unauthorized disclosure and displayed with enough context to avoid unsafe interpretation.

## 8. Acceptance Criteria

The feature is acceptable when all of the following are demonstrated:

1. A clear single-food image produces an identified food, ingredients, estimated calories, protein, carbohydrates, fat, relevant micronutrients where available, estimate labeling, and a review action.
2. A clear multi-food image produces separate item analyses, item-level micronutrients where available, combined macronutrient totals, and a combined summary.
3. Large visible portions affect the estimate, while indeterminate portions produce ranges or warnings rather than false precision.
4. Hidden ingredients are explicitly uncertain and are not represented as confirmed facts.
5. Stored dietary restrictions produce potential-conflict flags and never silently mark a conflicting item safe.
6. Detected or reasonably inferred common allergens receive explicit allergen labels independent of profile restrictions, and uncertain ingredients remain distinguishable from confirmed allergens.
7. Blurry, poorly lit, obstructed, non-food, or no-identifiable-food images produce an explanation and recovery path without fabricated nutrition.
8. Every uncertain result can be corrected or confirmed before being treated as consumed or logged nutrition.
9. Normal successful scans meet the approximately 5-second response target and show progress while pending.
10. The result presentation distinguishes identified items, estimates, item totals, combined totals, portion uncertainty, ingredient uncertainty, allergen warnings, and dietary conflicts.

## 9. Assumptions and Constraints

- The user has permission to receive the image and has access to any profile dietary restrictions relevant to the analysis.
- A image can support estimates but cannot reliably establish exact ingredient quantities, preparation methods, or nutritional values in every case.
- "Normal conditions" for the performance target means a supported image, ordinary service availability, and typical network conditions.
- Relevant micronutrients means vitamins and minerals for which the available food information supports a meaningful estimate; the application does not need to invent or display every micronutrient.
- Common allergen coverage is limited to allergens that can be detected or reasonably inferred from available food information; absence of a warning is not proof that a food is allergen-free.
- The feature does not replace medical, dietary, or allergy advice and must not present uncertain results as guarantees of safety.
- User confirmation resolves the application's review state but does not turn an estimate into a measured fact.
- The constitution's requirements for image-quality validation, conservative output, visible confidence, accessibility, and secure image handling apply to this feature.

## 10. Open Questions

- **OQ-001: Consumption/logging scope**: The requirement says uncertain results must be confirmed before they are treated as consumed/logged nutrition, but it does not define whether this feature includes a logging destination or only a review gate. The implementation plan must decide the boundary before adding any logging behavior.
- **OQ-002: Restriction and allergen terminology**: Should a user-defined restriction that is also a possible allergen use both a dietary-conflict warning and an allergen warning, or may one warning reference the other? The specification assumes both safety concepts remain distinguishable.
- **OQ-003: Confidence presentation**: Should confidence be shown as a numeric score, qualitative label, or explanatory text? The specification requires visible uncertainty but leaves the exact presentation unresolved.
- **OQ-004: Portion ranges**: What range conventions and rounding policy should be used for calories and nutrients when portion size is uncertain? The specification requires ranges or warnings but does not prescribe a numeric interval.
- **OQ-005: Confirmation of hidden ingredients**: When a user confirms an uncertain ingredient, should that confirmation be treated as applying only to the current scan or also as a reusable preference for future scans? The specification assumes current-scan confirmation unless resolved otherwise.
