# Quickstart Validation: Food Nutrition and Ingredients Analysis

## Prerequisites

- A modern desktop or mobile browser.
- A local checkout of the repository.
- Node.js and the package manager selected during project initialization.
- A Vercel project and environment variables for any server-side analysis provider used during implementation.
- Representative test images for: one identifiable food, multiple foods, large portion, hidden ingredient, blurry/dark image, non-food image, and an image containing a detectable allergen.

## Start the Next.js Application

From the repository root, install dependencies and start the development server:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/` in a browser.

The existing `Mockup/` directory is visual reference material during migration. The Next.js application must implement the observable requirements in [analysis-ui-contract.md](contracts/analysis-ui-contract.md); fixture data may be used until a real provider is selected, but it must preserve uncertainty and failure states.

## Manual Scenarios

1. **Single food**: Make one clear food image available to the page. Verify one food item, ingredients, calories, protein, carbohydrates, fat, supported micronutrients, estimate labeling, and a review action.
2. **Multiple foods**: Use a meal image containing grilled chicken, rice, and broccoli. Verify separate item results, item-level micronutrients where available, combined macronutrients, and a combined summary.
3. **Portion uncertainty**: Use an unusually large serving and then an image where serving size is unclear. Verify the large-serving assumption and a range or uncertainty warning for the unclear serving.
4. **Hidden ingredient**: Use a meal with an obscured sauce, topping, or filling. Verify it is marked uncertain and not stated as confirmed.
5. **Restrictions**: Provide a profile containing gluten-free, vegetarian, nut-allergy, or user-defined restrictions. Verify potential conflicts and any changed estimation assumptions are visible.
6. **Allergens**: Use a food with a detectable peanut, tree-nut, or shellfish ingredient. Verify the explicit allergen warning appears even when no matching profile restriction exists, and that uncertain possible allergens are distinct.
7. **Unusable image**: Use blurry, dark, obstructed, tightly cropped, non-food, and no-identifiable-food images. Verify an explanation and retry/replacement path with no fabricated nutrition values.
8. **Review gate**: Leave an uncertain result unconfirmed. Verify it cannot be treated as consumed or logged until the user corrects or confirms the uncertainty.
9. **Performance**: On a normal successful scan, verify immediate progress feedback and result presentation within approximately 5 seconds under ordinary local conditions.
10. **Accessibility**: Navigate upload, progress, warning, result, correction, and confirmation controls using the keyboard and inspect their names and state changes with browser accessibility tooling.

## Automated Validation

Before production changes merge, run Playwright browser scenarios and focused unit tests for:

- Image-quality and no-identifiable-food gating.
- Portion range and large-serving rules.
- Hidden-ingredient uncertainty.
- Item-to-meal total aggregation.
- Allergen versus uncertain-ingredient labeling.
- Dietary-restriction conflict handling.
- Review-gate state transitions.
- Approximately 5-second successful-scan performance.

Use the Vercel preview deployment to repeat the browser scenarios against a production-like environment before release.

Use [data-model.md](data-model.md) for entity and state rules and [analysis-ui-contract.md](contracts/analysis-ui-contract.md) for observable result requirements.
