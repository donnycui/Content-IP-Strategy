# Project File Governance

**Date:** 2026-04-18  
**Applies To:** `content-ip-research-workbench`

## Goal

Use file-based planning and explicit folder responsibility rules to keep the repo maintainable as the project grows.

This document is the practical replacement for the requested “Planning with Files” workflow in this repo.

## 1. Folder Responsibilities

### `app/`

Purpose:

- Route entrypoints
- Page shells
- Server-rendered composition
- Route-local loading / layout behavior

Rules:

- Keep page files thin
- Prefer page shell + imported section components over large inline pages
- Avoid embedding heavy business logic directly in route files

### `components/`

Purpose:

- UI building blocks
- Route-specific section components
- Small client-side interaction units

Rules:

- If a page grows, split route-specific chunks into subfolders like:
  - `components/home/`
  - `components/signals/`
  - `components/topics/`
  - `components/candidates/`
- Keep components named by responsibility, not by visual position only

### `lib/services/`

Purpose:

- Business workflows
- Orchestration logic
- Cross-table coordination
- External integration calls

Rules:

- Put workflow logic here, not in `app/`
- Prefer one service file per workflow boundary
- Use this folder for agent-like orchestration before introducing broader agent abstractions

### `lib/models/`

Purpose:

- Model gateway integration
- Endpoint normalization
- Model request execution
- Route target resolution

Rules:

- Keep all model-routing and provider/gateway execution code centralized here
- Do not scatter raw provider request logic across unrelated files

### `lib/domain/`

Purpose:

- Shared contracts
- Request/response payload types
- Cross-layer type definitions

Rules:

- API contracts belong here
- Avoid putting workflow logic here

### `prisma/`

Purpose:

- Schema
- Migrations
- Seed artifacts

Rules:

- Every schema change must be paired with an explicit migration file
- Avoid implicit database shape changes without migration artifacts

### `scripts/`

Purpose:

- One-off operational utilities
- Bootstrap tools
- Controlled maintenance tasks

Rules:

- Scripts should be explicit and narrow
- If a script changes live configuration, document it in `docs/plans/`

### `tests/`

Purpose:

- Focused regression and smoke coverage

Rules:

- Prefer small scenario-based tests
- Use tests to lock down workflow-critical behavior, not only helper functions

### `docs/plans/`

Purpose:

- Design docs
- Implementation plans
- Handoffs
- Operational notes

Rules:

- Use dated file names: `YYYY-MM-DD-topic-purpose.md`
- New active handoff docs should explicitly supersede older ones
- Do not leave major architectural changes undocumented

## 2. Naming Rules

### New route-related components

Use:

- `components/<area>/<area>-<responsibility>.tsx`

Examples:

- `components/home/home-summary-section.tsx`
- `components/signals/signals-table-section.tsx`

### New service files

Use:

- `lib/services/<workflow>-service.ts`

Examples:

- `lib/services/homepage-service.ts`
- `lib/services/profile-extraction-conversation-service.ts`

### New handoff / plan docs

Use:

- `docs/plans/YYYY-MM-DD-<topic>-design.md`
- `docs/plans/YYYY-MM-DD-<topic>-implementation-plan.md`
- `docs/plans/YYYY-MM-DD-<topic>-handoff.md`

## 3. Growth Rules

When adding a new feature:

1. Add or update a design / plan doc first
2. Keep route files thin
3. Put orchestration into `lib/services/`
4. If a page gets heavy, split UI sections into `components/<area>/`
5. If the work changes operations or architecture, update the active handoff doc

## 4. Anti-Patterns

Avoid these:

- Massive route files that contain UI + business logic + data access
- Scattering model request code across unrelated modules
- Introducing new folders without clear ownership
- Making schema changes without migrations
- Treating `docs/plans/` as historical junk rather than active operating context

## 5. Current Version Rule

This governance doc applies starting with project version **v2.0.0**.
