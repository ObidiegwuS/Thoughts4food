# Implementation Plan: Food Nutrition and Ingredients Analysis

**Branch**: `001-food-nutrition-analysis` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-food-nutrition-analysis/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver a production-oriented browser experience for food image analysis that presents item-level and meal-level nutrition while explicitly communicating uncertainty, portion assumptions, allergens, dietary conflicts, and recovery paths. The existing static mockup becomes the visual reference; the implementation should move to a typed Next.js application with reusable shadcn/ui components and Vercel deployment, while keeping recognition and nutrition providers replaceable.

## Technical Context

**Language/Version**: TypeScript with Next.js App Router and React; responsive modern desktop and mobile browser baseline

**Primary Dependencies**: Next.js, React, shadcn/ui, Tailwind CSS, browser image APIs, and a server-side adapter for recognition/nutrition providers

**Storage**: Initial vertical slice uses session-scoped analysis state with no durable image retention; durable profile restrictions and result history require a separately approved persistence task

**Testing**: Vitest or equivalent focused unit tests plus Playwright browser workflow tests; exact test tooling configuration is an implementation task

**Target Platform**: Vercel-hosted Next.js application serving responsive modern desktop and mobile web browsers

**Project Type**: Full-stack web application with a browser UI and server-side analysis boundary

**Performance Goals**: Show an immediate analysis-progress state and present normal successful scan results within approximately 5 seconds

**Constraints**: Must not fabricate nutrition when food is not identifiable; must distinguish estimates, ranges, hidden ingredients, allergens, and dietary conflicts; must preserve keyboard, screen-reader, contrast, and privacy expectations

**Scale/Scope**: One analysis workflow covering image receipt/submission, single and multi-food results, review/correction, uncertainty, allergen and restriction warnings, and unusable-image recovery; authentication, logging destination, and service-scale behavior remain bounded follow-up decisions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The plan passes the pre-design gate:

- Quality-first delivery: analysis states and conservative result rules are defined before implementation.
- User experience consistency: success, uncertainty, failure, correction, and confirmation states use a shared result vocabulary.
- Test-first quality gates: the design includes focused unit rules and Playwright browser scenarios as required implementation dependencies.
- Real-world photo robustness: image quality, no-food, ambiguous-food, and multi-food cases are explicit workflow states.
- Performance and responsiveness: progress feedback and the approximately 5-second normal-scan target are included in the contract and quickstart.
- Additional constraints: visible uncertainty, accessibility, and image/profile-information protection are treated as acceptance conditions.

No constitution violations are identified. The recognition provider remains replaceable, Vercel server boundaries protect provider secrets, and the selected framework supports the required testing and accessibility gates.

**Post-design re-check**: PASS. The research and design preserve conservative uncertainty handling, explicit image-quality failures, visible allergen and dietary-conflict warnings, accessible review states, progress feedback, and the approximately 5-second target. Next.js server boundaries and Vercel environment controls support secret protection, but storage retention, provider selection, and authentication remain explicit follow-up decisions.

## Project Structure

### Documentation (this feature)

```text
specs/001-food-nutrition-analysis/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx
├── layout.tsx
└── api/
	└── analyze/route.ts

components/
├── analysis/
├── ui/
└── upload/

lib/
├── analysis/
├── providers/
└── validation/

tests/
├── unit/
└── e2e/

public/
└── mockup-assets/

Mockup/
└── # retained as visual reference during migration

specs/001-food-nutrition-analysis/
├── contracts/
├── data-model.md
├── plan.md
├── quickstart.md
└── research.md
```

**Structure Decision**: Migrate the existing visual mockup into a single Next.js App Router application at the repository root. Use shadcn/ui components as editable source code under `components/ui/`, keep domain logic in `lib/`, expose only a narrow server-side analysis boundary, and use Playwright plus unit tests under `tests/`. Retain the existing mockup as a visual reference until the migration is verified; do not maintain two production UI implementations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | The selected static-web structure does not violate the constitution. |
