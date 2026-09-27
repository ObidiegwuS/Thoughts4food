# Research: Food Nutrition and Ingredients Analysis

**Date**: 2026-09-27
**Scope**: Resolve planning unknowns from the repository and current feature specification.

## Decision 1: Move from the static mockup to Next.js + shadcn/ui on Vercel

**Decision**: Use Next.js App Router with TypeScript as the application framework, shadcn/ui for editable accessible interface components, and Vercel as the deployment target. Treat the existing `Mockup/` files as visual reference material during migration, not as the production implementation.

**Rationale**: The product requires stateful image submission, server-side provider calls, protected secrets, review/correction states, automated browser validation, and preview deployments. Next.js provides the application and server boundary, shadcn/ui provides customizable accessible primitives, and Vercel provides a natural deployment path for Next.js with environment management and preview deployments.

**Alternatives considered**:
- Keep the static mockup: rejected as the production architecture because it has no secure server boundary, typed application structure, or durable path to profile and analysis state.
- Choose a different frontend framework: deferred because the requested Vercel direction and existing UI scope align well with Next.js.
- Use a closed component library: rejected because shadcn/ui components are copied into the project and remain customizable for the product's trust-oriented result presentation.

## Decision 2: Use a provider-neutral analysis result contract

**Decision**: Define the analysis output around user-observable concepts: image status, identified food items, ingredients, portion estimates, nutrition values, uncertainty reasons, allergens, dietary conflicts, and review state. Do not select a recognition or nutrition vendor in this plan.

**Rationale**: The spec requires safe presentation and correction behavior, but does not name a recognition model, nutrition database, or external service. The UI contract can be implemented with deterministic fixture data first and later connected to a provider without changing the user-facing states.

**Alternatives considered**:
- Select a specific computer-vision or nutrition API: rejected because provider accuracy, licensing, privacy, cost, and data coverage are unresolved.
- Represent results as only a single confidence score: rejected because the spec requires separate uncertainty for identification, ingredients, and portion size.

## Decision 3: Model uncertainty as explicit state, not numeric precision alone

**Decision**: Every result item carries an evidence status and zero or more human-readable uncertainty reasons. Nutrition values support a single estimate or range, but the display must also identify the assumption behind the value.

**Rationale**: A numeric confidence value alone does not explain hidden ingredients, unknown portions, or dietary conflicts. Explicit reasons support correction, safer interpretation, and the constitution's trust requirements.

**Alternatives considered**:
- Display precise values with a generic disclaimer: rejected because it creates false precision.
- Reject every uncertain image: rejected because the spec permits useful estimates when uncertainty is clearly communicated.

## Decision 4: Treat profile restrictions as input data for this feature, not a new account system

**Decision**: The analysis workflow consumes the user's stored restrictions as an available profile input. This feature does not define profile creation, account management, or persistence; it only defines how restrictions affect result warnings and assumptions.

**Rationale**: Dietary restrictions are required to drive safety warnings, but account-management functionality is explicitly out of scope. Keeping them as input data avoids inventing unrelated product behavior.

**Alternatives considered**:
- Build restriction editing and account storage: rejected as unrelated scope.
- Ignore restrictions until a backend exists: rejected because conflict flagging is a core acceptance behavior.

## Decision 5: Validate behavior at the browser workflow boundary

**Decision**: Use focused unit tests for domain rules and Playwright browser tests for successful single-food, multi-food, uncertainty, allergen/restriction, and unusable-image states. Use Vercel preview deployments for repeatable acceptance checks.

**Rationale**: The product requirements are primarily observable UI behavior, while nutrition safety rules benefit from isolated tests. Playwright validates the complete interaction and accessibility boundary; preview deployments make the result reviewable before production.

**Alternatives considered**:
- Unit tests only: rejected because they cannot prove the result presentation and correction workflow.
- Manual testing only as the final quality gate: rejected by the constitution's test-first requirement.

## Decision 6: Keep analysis providers behind a server-side adapter

**Decision**: The browser submits an image to a narrow server-side analysis boundary. Recognition and nutrition services are selected later and conform to the provider-neutral result contract.

**Rationale**: Provider credentials must not be exposed to the browser, and the product may need to combine visual recognition with nutrition data and conservative safety rules. A server-side adapter allows provider replacement without changing the UI contract.

**Alternatives considered**:
- Call an analysis provider directly from the browser: rejected because it exposes credentials and makes privacy, rate limiting, and normalization harder to control.
- Hard-code one provider into UI components: rejected because it couples presentation to an unresolved external dependency.

## Decision 7: Treat image receipt and image submission as a product-language clarification

**Decision**: The implementation should support a user action that makes a food image available for analysis, whether that is upload, camera capture, or receipt from another flow. The UI language should use one consistent term after product clarification; the current spec's mixed "receive," "submit," and text/list wording remains an open product issue.

**Rationale**: The current edited spec contains conflicting wording: the goal describes receiving an image, while several scenarios refer to lists or text. The acceptance behavior is clearly image analysis, but silently changing the product input contract would be risky.

**Alternatives considered**:
- Treat text/list input as a second analysis mode: rejected because it is not supported by the stated food-photo behavior and would expand scope.
- Silently rewrite the spec back to upload-only: rejected because the user's edits must remain the source of truth until clarified.

## Resolved planning unknowns

- **Language/platform**: TypeScript, Next.js App Router, React, shadcn/ui, and Vercel-hosted responsive web application.
- **Dependencies**: Browser APIs, shadcn/ui primitives, server-side provider adapter, and a future recognition/nutrition provider.
- **Storage**: The initial vertical slice is session-scoped with no durable image retention. Durable profile restrictions and result history are deferred until a separate persistence decision is approved.
- **Testing**: Playwright browser workflows plus focused unit tests; manual checks remain useful during design review but are not the final gate.
- **Target support**: Responsive modern desktop and mobile browsers; exact browser versions remain a release decision.
- **Scale**: One analysis workflow and its state transitions; service capacity and retention are outside this plan.
