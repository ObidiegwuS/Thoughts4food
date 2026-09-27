# Analysis UI Contract

This contract defines observable states and information presented by the food analysis experience. It is provider-neutral and applies whether the image is uploaded, captured, or received from another supported flow.

## Analysis States

| State | Required user-visible behavior |
|---|---|
| `received` | Show the received image or image reference and acknowledge that analysis has started. |
| `analyzing` | Show immediate progress feedback; do not imply results are ready. |
| `succeeded` | Show one or more identified food items, item nutrition, uncertainty, warnings, and review controls. |
| `insufficient-quality` | Explain image-quality reasons such as blur, poor lighting, obstruction, or framing; show replacement/retry action; show no misleading nutrition. |
| `no-identifiable-food` | State that no food could be identified with sufficient evidence; show replacement/retry action; show no nutrition values. |
| `failed` | Explain that analysis could not be completed, avoid fabricated values, and provide recovery guidance. |

## Successful Result Requirements

A successful result must expose:

- `foodItems`: Separate display records for every individually identified food.
- `ingredients`: Visible, inferred, hidden-possible, and user-confirmed statuses.
- `itemNutrition`: Calories, protein, carbohydrates, fat, and supported micronutrients per item.
- `mealSummary`: Combined calories and macronutrients for multiple items.
- `portion`: Amount or range, basis, and assumption text.
- `uncertainty`: Human-readable reason(s) for material uncertainty.
- `allergenWarnings`: Explicit identified or uncertain allergen labels.
- `dietaryConflicts`: Potential or confirmed conflicts against stored restrictions.
- `reviewStatus`: Unreviewed, confirmed, or corrected.
- `reviewActions`: Controls that let the user correct or confirm uncertain details before consumption/logging treatment.

## Presentation Rules

1. Every photo-derived nutrition value is labeled as an estimate unless explicitly replaced by user-provided input.
2. A range or uncertainty warning is used when portion size cannot support a single value.
3. Hidden or inferred ingredients are not phrased as confirmed facts.
4. Identified allergens are labeled regardless of profile restrictions.
5. Uncertain possible allergens are visually and textually distinct from identified allergens.
6. Dietary conflicts are not silently treated as safe.
7. Item-level values and combined meal totals are labeled separately.
8. Missing nutrition or micronutrient data is shown as unavailable, not zero.
9. Unreviewed uncertain results cannot be marked consumed or logged.
10. Warning, error, and progress states remain understandable to keyboard and assistive-technology users.

## Review Actions

The UI must provide a user-observable path to:

- Confirm an identified food or ingredient.
- Correct an identified food, ingredient, or portion.
- Acknowledge or revisit allergen and dietary-conflict warnings.
- Confirm the result only after required uncertain details have been reviewed.

The contract does not define persistence, account management, or a logging destination.
