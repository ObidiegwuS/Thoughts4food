---

description: "Executable task list for Food Nutrition and Ingredients Analysis"
---

# Tasks: Food Nutrition and Ingredients Analysis

**Input**: Design documents from `/specs/001-food-nutrition-analysis/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/analysis-ui-contract.md, quickstart.md

**Technology**: Next.js App Router, TypeScript, React, shadcn/ui, Tailwind CSS, Vercel, Playwright, and focused unit tests

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment after the shared foundation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Replace the static mockup implementation path with a typed Next.js application while retaining the mockup as visual reference.

- [X] T001 Initialize the repository root as a Next.js App Router TypeScript application in `package.json`, `tsconfig.json`, `next.config.ts`, and `app/layout.tsx`
- [X] T002 [P] Configure Tailwind CSS, shadcn/ui, path aliases, and global design tokens in `components.json`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, and `lib/utils.ts`
- [X] T003 [P] Establish the production source tree with `app/`, `components/`, `lib/`, `public/mockup-assets/`, and `tests/` directories, leaving `Mockup/` as reference-only
- [X] T004 [P] Add linting, formatting, type-checking, and package scripts in `package.json` and the repository configuration files
- [X] T005 [P] Add Playwright and unit-test configuration with browser base URL and test scripts in `playwright.config.ts`, `vitest.config.ts`, and `tests/setup.ts`
- [X] T006 [P] Define local and Vercel environment-variable documentation without committing secrets in `.env.example` and `README.md`
- [X] T007 [P] Copy approved visual reference assets from `Mockup/` into `public/mockup-assets/` and document the migration boundary in `README.md`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared domain types, provider boundaries, validation, and accessible result-state primitives required by every story.

**Checkpoint**: Foundation must be complete before user-story work begins.

- [X] T008 Define the analysis request and status types with statuses `received`, `analyzing`, `succeeded`, `insufficient-quality`, `no-identifiable-food`, and `failed` in `lib/analysis/types.ts`
- [X] T009 Define food-item, ingredient-observation, portion-estimate, nutrition-estimate, micronutrient, allergen-finding, dietary-conflict, meal-summary, and review-status types with the exact enum values from `data-model.md` in `lib/analysis/types.ts`
- [X] T010 [P] Implement request/image validation for supported image input, blur, low light, obstruction, framing, and no-food conditions in `lib/analysis/image-validation.ts`
- [X] T011 [P] Implement conservative nutrition formatting that supports estimates, ranges, unavailable values, units, and displayed rounding without fabricated zeroes in `lib/analysis/nutrition-format.ts`
- [X] T012 [P] Implement meal aggregation from item-level displayed estimates and supported micronutrients in `lib/analysis/meal-summary.ts`
- [X] T013 [P] Define the provider-neutral analysis adapter interface and fixture adapter in `lib/providers/analysis-provider.ts` and `lib/providers/fixture-analysis-provider.ts`
- [X] T014 Implement the server-side analysis route contract for image receipt, progress-compatible responses, provider errors, and provider-neutral results in `app/api/analyze/route.ts`
- [X] T015 [P] Add shared accessible status, alert, badge, button, card, dialog, progress, and tabs primitives through `components/ui/`
- [X] T016 [P] Build shared analysis-state, warning, uncertainty, and review-status components in `components/analysis/analysis-state.tsx`, `components/analysis/uncertainty-notice.tsx`, and `components/analysis/review-status.tsx`
- [X] T017 [P] Add unit tests for image validation, nutrition formatting, meal aggregation, and review-state transition rules in `tests/unit/image-validation.test.ts`, `tests/unit/nutrition-format.test.ts`, `tests/unit/meal-summary.test.ts`, and `tests/unit/review-state.test.ts`
- [X] T018 [P] Add an analysis-route contract test for accepted image input, provider-neutral output, missing-result safety, and server-side error handling in `tests/contract/analyze-route.test.ts`

## Phase 3: User Story 1 - Analyze a Food Image (Priority: P1) 🎯 MVP

**Goal**: A user can make a clear single-food image available for analysis and review a labeled food, ingredient, nutrition, micronutrient, and estimate result.

**Independent Test**: Provide a clear single-food fixture image, verify the analyzing state appears immediately, then verify one identified food, visible/inferred ingredients, calories, protein, carbohydrates, fat, supported micronutrients, estimate labeling, and a review action.

### Tests for User Story 1

- [X] T019 [P] [US1] Add Playwright coverage for single-food image receipt, immediate analyzing feedback, successful result rendering, estimate labels, and review controls in `tests/e2e/single-food-analysis.spec.ts`
- [X] T020 [P] [US1] Add component tests for single-food nutrition, ingredient, micronutrient, and estimate presentation in `tests/unit/single-food-result.test.tsx`

### Implementation for User Story 1

- [X] T021 [P] [US1] Build the image receipt and preview interface with accessible file/camera affordances and supported-image validation in `components/upload/image-receiver.tsx` and `components/upload/image-preview.tsx`
- [X] T022 [P] [US1] Build the analysis progress state with immediate status feedback and retry behavior in `components/analysis/analysis-progress.tsx`
- [X] T023 [US1] Implement the single-food analysis page state, server route submission, and session-scoped result handling in `app/page.tsx` and `app/api/analyze/route.ts`
- [X] T024 [P] [US1] Render identified food, ingredient evidence status, portion assumption, macronutrients, micronutrients, and estimate labeling in `components/analysis/food-item-result.tsx`, `components/analysis/ingredient-list.tsx`, and `components/analysis/nutrition-summary.tsx`
- [X] T025 [US1] Add current-analysis review controls that require explicit confirmation or correction before the result can be treated as consumed or logged in `components/analysis/review-actions.tsx` and `lib/analysis/review-state.ts`
- [X] T026 [US1] Integrate the migrated visual direction from `Mockup/styles.css` into responsive accessible tokens and layout in `app/globals.css` and `app/page.tsx`

**Checkpoint**: User Story 1 works independently with the fixture provider and passes its unit, component, route, and Playwright checks.

## Phase 4: User Story 2 - Understand a Multi-Food Meal (Priority: P1)

**Goal**: A user can review each identifiable food separately and see combined meal nutrition.

**Independent Test**: Provide a fixture meal containing grilled chicken, rice, and broccoli; verify three separate food items, item-level nutrition and micronutrients where available, combined calories and macronutrients, and a combined summary.

### Tests for User Story 2

- [X] T027 [P] [US2] Add Playwright coverage for multi-food item separation, item-level details, combined totals, and combined meal summary in `tests/e2e/multi-food-meal.spec.ts`
- [X] T028 [P] [US2] Add unit tests proving combined totals use displayed item estimates and preserve unavailable micronutrient data in `tests/unit/multi-food-summary.test.ts`

### Implementation for User Story 2

- [X] T029 [P] [US2] Add multi-food fixture results with separate food items, portions, ingredients, and micronutrients in `lib/providers/fixture-analysis-provider.ts`
- [X] T030 [US2] Render independently addressable food-item result sections and item-level details for multi-food analyses in `components/analysis/food-item-list.tsx` and `components/analysis/food-item-result.tsx`
- [X] T031 [US2] Render combined meal calories, protein, carbohydrates, fat, supported micronutrients, and summary text separately from item results in `components/analysis/meal-summary.tsx`
- [X] T032 [US2] Integrate item-level results and meal summary into the successful analysis page without collapsing distinguishable foods in `app/page.tsx`
- [X] T033 [US2] Add responsive comparison and accessible labeling for item totals versus combined meal totals in `components/analysis/meal-summary.tsx` and `app/globals.css`

**Checkpoint**: User Stories 1 and 2 both remain functional, and multi-food totals match the displayed item estimates.

## Phase 5: User Story 3 - Review Uncertainty and Portion Size (Priority: P1)

**Goal**: A user can understand large-serving assumptions, uncertain portions, hidden ingredients, and correct or confirm them before consumption/logging treatment.

**Independent Test**: Provide fixtures for an unusually large portion, an indeterminate portion, and a concealed sauce; verify disclosed assumptions, ranges or warnings, uncertain ingredient status, and correction/confirmation controls.

### Tests for User Story 3

- [X] T034 [P] [US3] Add Playwright coverage for large portions, portion ranges, hidden ingredients, uncertainty notices, and review-gate behavior in `tests/e2e/uncertainty-and-portions.spec.ts`
- [X] T035 [P] [US3] Add unit tests for large-serving calculations, range formatting, hidden-ingredient status, and confirmation/correction transitions in `tests/unit/uncertainty-rules.test.ts`

### Implementation for User Story 3

- [X] T036 [P] [US3] Add large-portion, unknown-portion, and hidden-ingredient fixtures with explicit evidence statuses and assumptions in `lib/providers/fixture-analysis-provider.ts`
- [X] T037 [P] [US3] Render portion amount/range, basis, certainty, and assumption text in `components/analysis/portion-estimate.tsx`
- [X] T038 [US3] Render material uncertainty reasons and distinguish inferred or hidden-possible ingredients from confirmed ingredients in `components/analysis/uncertainty-notice.tsx` and `components/analysis/ingredient-list.tsx`
- [X] T039 [US3] Implement editable food, ingredient, and portion correction controls with current-analysis state updates in `components/analysis/correction-form.tsx` and `lib/analysis/review-state.ts`
- [X] T040 [US3] Prevent consumption/logging confirmation while required uncertain details remain unreviewed and expose the blocked reason in `components/analysis/review-actions.tsx`

**Checkpoint**: Uncertainty is visible and actionable; no uncertain result is treated as confirmed solely by being displayed.

## Phase 6: User Story 4 - Detect Allergens and Dietary Conflicts (Priority: P1)

**Goal**: A user sees explicit allergen labels and profile-restriction conflicts, including uncertainty distinctions and assumption impact.

**Independent Test**: Analyze a fixture with peanut, tree-nut, or shellfish information both with and without a matching profile restriction; verify allergen warnings always appear, conflicts are separately flagged, and uncertain possible allergens are distinct.

### Tests for User Story 4

- [X] T041 [P] [US4] Add Playwright coverage for identified allergens, uncertain possible allergens, profile conflicts, and assumption-impact messaging in `tests/e2e/safety-warnings.spec.ts`
- [X] T042 [P] [US4] Add unit tests for allergen status distinction, restriction matching, uncertain conflicts, and warning aggregation in `tests/unit/safety-warnings.test.ts`

### Implementation for User Story 4

- [X] T043 [P] [US4] Add allergen and dietary-restriction fixture data for peanuts, tree nuts, shellfish, gluten-free, vegetarian, nut allergy, and user-defined restrictions in `lib/providers/fixture-analysis-provider.ts` and `lib/analysis/types.ts`
- [X] T044 [P] [US4] Implement dietary-restriction comparison and assumption-impact rules without silently treating potential conflicts as safe in `lib/analysis/dietary-conflicts.ts`
- [X] T045 [P] [US4] Implement allergen detection/status normalization that distinguishes `identified` from `uncertain-possible` in `lib/analysis/allergen-findings.ts`
- [X] T046 [US4] Render explicit allergen warnings independently from profile conflicts in `components/analysis/allergen-warning.tsx` and `components/analysis/dietary-conflict-warning.tsx`
- [X] T047 [US4] Add profile-restriction input handling for the current analysis session without introducing account-management scope in `components/profile/restriction-context.tsx` and `app/page.tsx`
- [X] T048 [US4] Integrate safety warnings into item results and review actions while preserving keyboard, screen-reader, and contrast requirements in `components/analysis/food-item-result.tsx` and `components/analysis/review-actions.tsx`

**Checkpoint**: All identified allergens are explicitly labeled regardless of profile settings, and all potential dietary conflicts are visible and actionable.

## Phase 7: User Story 5 - Recover from an Unusable Image (Priority: P1)

**Goal**: A user receives clear, actionable failure states for poor-quality, non-food, and no-identifiable-food images without fabricated nutrition.

**Independent Test**: Provide blurry, poorly lit, obstructed, non-food, and ambiguous fixtures; verify each shows its reason and recovery action, with no calorie or nutrient values presented as a result.

### Tests for User Story 5

- [X] T049 [P] [US5] Add Playwright coverage for blurry, dark, obstructed, non-food, ambiguous, and no-identifiable-food recovery flows in `tests/e2e/unusable-image-recovery.spec.ts`
- [X] T050 [P] [US5] Add regression tests for image-quality gating and nutrition suppression in `tests/unit/unusable-image-rules.test.ts`

### Implementation for User Story 5

- [X] T051 [P] [US5] Add poor-quality, non-food, and ambiguous fixture outcomes with quality issue reasons in `lib/providers/fixture-analysis-provider.ts`
- [X] T052 [US5] Render accessible insufficient-quality, no-identifiable-food, and failed analysis states with reason text and replacement/retry actions in `components/analysis/analysis-error.tsx`
- [X] T053 [US5] Enforce nutrition suppression for `insufficient-quality`, `no-identifiable-food`, and unsupported `failed` states in `app/page.tsx`, `app/api/analyze/route.ts`, and `lib/analysis/image-validation.ts`
- [X] T054 [US5] Connect replacement-image actions back to the received/analyzing flow and clear stale results in `components/upload/image-receiver.tsx` and `app/page.tsx`
- [X] T055 [US5] Add accessible live-region announcements for progress, errors, warnings, and recovery outcomes in `components/analysis/analysis-state.tsx` and `app/layout.tsx`

**Checkpoint**: Weak evidence produces safe, understandable recovery states and never fabricated nutrition values.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Harden the complete workflow for accessibility, privacy, performance, deployment, and release validation.

- [X] T056 [P] Add shared accessibility assertions for keyboard navigation, accessible names, focus management, live regions, and contrast-sensitive states in `tests/e2e/accessibility.spec.ts`
- [X] T057 [P] Add performance assertions for immediate progress feedback and approximately 5-second normal successful scans in `tests/e2e/performance.spec.ts`
- [X] T058 [P] Add server-side request limits, image type/size validation, provider timeout handling, and secret-safe error messages in `app/api/analyze/route.ts` and `lib/analysis/image-validation.ts`
- [X] T059 [P] Add Vercel deployment configuration, preview environment documentation, and production environment-variable guidance in `vercel.json`, `.env.example`, and `README.md`
- [X] T060 [P] Review image retention, profile-restriction exposure, and client/server boundaries against the constitution in `docs/privacy-and-safety.md`
- [X] T061 Run the full unit, contract, and Playwright suites and resolve regressions across `tests/`
- [ ] T062 Run every scenario in `quickstart.md` against a local build and Vercel preview deployment, recording any unresolved behavior in `specs/001-food-nutrition-analysis/quickstart.md`
- [X] T063 Remove or archive obsolete production references to the duplicate `Thoughts4food/Mockup/` copy after the Next.js migration is verified in `README.md` and repository structure

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; initialize the Next.js application and test tooling first.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories because shared types, provider boundary, route contract, validation, and accessible primitives are required.
- **Phase 3 User Story 1**: Depends on Phase 2; defines the MVP single-food vertical slice.
- **Phase 4 User Story 2**: Depends on Phase 2 and can reuse the US1 result components; it must remain independently testable with the fixture provider.
- **Phase 5 User Story 3**: Depends on Phase 2 and can reuse US1 result/review components; uncertainty rules must be independently testable.
- **Phase 6 User Story 4**: Depends on Phase 2 and can reuse item/review components; safety rules must be independently testable.
- **Phase 7 User Story 5**: Depends on Phase 2 and can reuse image/status components; failure states must be independently testable.
- **Phase 8 Polish**: Depends on all desired user stories and must complete before production deployment.

### User Story Dependencies

- **US1**: No dependency on another user story after Foundational; MVP.
- **US2**: No behavioral dependency on US1 after Foundational, though it reuses the shared result component contracts.
- **US3**: No behavioral dependency on US1 or US2 after Foundational; it consumes the shared item and review types.
- **US4**: No behavioral dependency on US1, US2, or US3 after Foundational; it consumes shared item and warning types.
- **US5**: No behavioral dependency on another story after Foundational; it consumes shared image-status and recovery primitives.

### Parallel Opportunities

- Phase 1 tasks T002-T007 can run in parallel after T001 establishes the application.
- Phase 2 tasks T010-T013, T015-T018 can run in parallel after shared types T008-T009 exist.
- After Phase 2, US1-US5 can be assigned to separate contributors because each has its own fixtures, tests, and UI integration files; coordinate shared edits to `app/page.tsx` and `lib/providers/fixture-analysis-provider.ts`.
- Within US1, T019-T022 and T024 can proceed in parallel once the shared foundation exists; T023/T025 integrate their outputs.
- Within US3, T034-T038 can proceed in parallel before T039-T040 integrate review behavior.
- Within US4, T041-T045 can proceed in parallel before T046-T048 integrate the warnings into the page.
- Polish tasks T056-T060 can run in parallel after story behavior stabilizes; T061-T062 are final validation gates.

## Parallel Example: User Story 1

```text
Task T019: Playwright single-food flow in tests/e2e/single-food-analysis.spec.ts
Task T020: Single-food component tests in tests/unit/single-food-result.test.tsx
Task T021: Image receiver in components/upload/image-receiver.tsx and components/upload/image-preview.tsx
Task T022: Analysis progress in components/analysis/analysis-progress.tsx
Task T024: Single-food result components in components/analysis/food-item-result.tsx, components/analysis/ingredient-list.tsx, and components/analysis/nutrition-summary.tsx
```

## Parallel Example: User Stories After Foundation

```text
Team A: Phase 3 User Story 1 - single-food MVP
Team B: Phase 4 User Story 2 - multi-food meal totals
Team C: Phase 5 User Story 3 - uncertainty and portion review
Team D: Phase 6 User Story 4 - allergens and dietary conflicts
Team E: Phase 7 User Story 5 - unusable-image recovery
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 User Story 1 with fixture data.
4. Run the US1 unit, contract, and Playwright checks independently.
5. Deploy a Vercel preview for stakeholder review.

### Incremental Delivery

1. Add User Story 2 for multi-food meals and verify item/meal totals.
2. Add User Story 3 for uncertainty and portion review.
3. Add User Story 4 for allergen and dietary-conflict safety.
4. Add User Story 5 for poor-quality and no-food recovery.
5. Complete cross-cutting accessibility, security, performance, and deployment validation.
6. Select and integrate real analysis providers only behind the established server-side adapter and contract.

## Format Validation

- All implementation tasks use `- [ ]` checkboxes, sequential `T###` IDs, and exact file paths.
- User-story tasks include the required `[US#]` label.
- Parallelizable tasks include `[P]` only when they target independent files or work after their stated prerequisites.
- Tests are included because the plan and constitution explicitly require unit, contract, integration/browser, regression, accessibility, and performance validation.
