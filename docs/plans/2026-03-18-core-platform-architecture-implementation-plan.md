# Core Platform Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the current Creator OS codebase from a web-first application into a reusable core platform with clear service boundaries and future-ready channel adapters.

**Architecture:** Keep the current Next.js app as the first runtime host, but progressively move business logic into reusable platform services and treat the web UI as one client of the system core. Prioritize service extraction, API normalization, and channel-safe boundaries before building mini program or OpenClaw adapters.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL (Supabase), React, TypeScript

---

### Task 1: Establish explicit service-layer conventions

**Files:**
- Create: `docs/plans/2026-03-18-core-platform-architecture-design.md`
- Modify: `docs/plans/2026-03-13-content-ip-strategy-design.md`
- Modify: `docs/plans/2026-03-17-creator-os-phase1-implementation-plan.md`

- [x] **Step 1: Document the platform-layer rule**

Write the rule in the design docs:

- pages render and trigger
- services own business logic
- channels adapt services

- [x] **Step 2: Add a short codebase note to the running design log**

Append a short note that all new Phase 2 work should prefer service-layer placement over page-local logic.

- [x] **Step 3: Commit**

```bash
git add docs/plans/2026-03-18-core-platform-architecture-design.md docs/plans/2026-03-13-content-ip-strategy-design.md docs/plans/2026-03-17-creator-os-phase1-implementation-plan.md
git commit -m "Document core platform architecture"
```

### Task 2: Introduce `lib/services` as the canonical business-capability layer

**Files:**
- Create: `lib/services/profile-service.ts`
- Create: `lib/services/direction-service.ts`
- Create: `lib/services/topic-service.ts`
- Create: `lib/services/topic-candidate-service.ts`
- Create: `lib/services/profile-evolution-service.ts`
- Modify: `app/api/profile/extract/route.ts`
- Modify: `app/api/profile/route.ts`
- Modify: `app/api/directions/route.ts`
- Modify: `app/api/directions/generate/route.ts`
- Modify: `app/api/topics/route.ts`
- Modify: `app/api/topics/generate/route.ts`
- Modify: `app/api/topic-candidates/route.ts`
- Modify: `app/api/topic-candidates/generate/route.ts`
- Modify: `app/api/profile-updates/route.ts`
- Modify: `app/api/profile-updates/generate/route.ts`

- [x] **Step 1: Create thin service wrappers**

Each service should export stable capability-style functions such as:

- `extractCreatorProfileAndActivate`
- `getActiveDirections`
- `regenerateTopics`
- `regenerateTopicCandidates`
- `regenerateProfileEvolutionSuggestions`

- [x] **Step 2: Move orchestration out of routes**

Keep route files thin:

- parse request
- call service
- return response

- [x] **Step 3: Verify locally**

Run:

```bash
npm run build
```

Expected:

- build passes
- no route should contain large workflow logic blocks

- [x] **Step 4: Commit**

```bash
git add lib/services app/api
git commit -m "Extract creator OS services"
```

### Task 3: Normalize channel-safe API contracts

**Files:**
- Create: `lib/domain/contracts.ts`
- Modify: existing `app/api/**/route.ts` files for creator-os endpoints

- [x] **Step 1: Define shared request/response types**

Add explicit TypeScript types for:

- profile extraction input/output
- direction generation output
- topic generation output
- topic-candidate generation output
- profile-update mutation output

- [x] **Step 2: Update API handlers to use contract types**

Return structured `ok / error / data` style payloads consistently.

- [x] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected:

- all creator-os API routes compile with explicit typed contracts

- [x] **Step 4: Commit**

```bash
git add lib/domain/contracts.ts app/api
git commit -m "Normalize creator OS API contracts"
```

### Task 4: Prepare a mini-program adapter boundary

**Files:**
- Create: `lib/channels/miniprogram/README.md`
- Create: `lib/channels/miniprogram/actions.ts`
- Create: `docs/plans/2026-03-18-mini-program-entry-scope.md`

- [x] **Step 1: Define first mini-program actions**

Document a minimal supported action set:

- get today summary
- get directions
- get topic recommendations
- confirm/reject profile update suggestion
- capture quick note

- [x] **Step 2: Create adapter placeholders**

The adapter file should not build the mini program itself. It should expose which core service calls will back mini-program actions.

- [x] **Step 3: Commit**

```bash
git add lib/channels/miniprogram docs/plans/2026-03-18-mini-program-entry-scope.md
git commit -m "Define mini program channel boundary"
```

### Task 5: Prepare an OpenClaw integration boundary

**Files:**
- Create: `lib/channels/openclaw/README.md`
- Create: `lib/channels/openclaw/tools.ts`
- Create: `docs/plans/2026-03-18-openclaw-integration-scope.md`

- [x] **Step 1: Define the initial OpenClaw tool set**

Document capability candidates:

- `extract_ip_profile`
- `generate_directions`
- `generate_topics`
- `generate_topic_candidates`
- `generate_profile_updates`
- later:
  - `draft_content`
  - `run_review`

- [x] **Step 2: Describe the main-agent/sub-agent split**

Clarify:

- web remains primary runtime
- OpenClaw becomes an agentic channel
- sub-agents are temporary task-specific workflows

- [x] **Step 3: Commit**

```bash
git add lib/channels/openclaw docs/plans/2026-03-18-openclaw-integration-scope.md
git commit -m "Define OpenClaw integration boundary"
```

### Task 6: Refactor Today and channel entry points onto service-backed composition

**Files:**
- Modify: `lib/today-data.ts`
- Modify: `app/page.tsx`
- Modify: any newly created service files as needed

- [x] **Step 1: Replace direct library fan-out with service-backed composition**

Today should call a smaller number of service-layer entry functions instead of directly aggregating every helper.

- [x] **Step 2: Keep Today a web client, not a workflow owner**

Move orchestration decisions into services if they begin to grow.

- [x] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected:

- Today still works
- page code is thinner

- [x] **Step 4: Commit**

```bash
git add app/page.tsx lib/today-data.ts lib/services
git commit -m "Refactor Today onto platform services"
```

### Task 7: Final verification and deployment handoff

**Files:**
- Modify: `docs/plans/2026-03-13-content-ip-strategy-design.md`

- [x] **Step 1: Update running design log**

Append the completed architecture-extraction milestones.

- [x] **Step 2: Verify**

Run:

```bash
npm run build
git status --short
```

Expected:

- build passes
- worktree is clean except intentional doc changes

- [x] **Step 3: Commit**

```bash
git add docs/plans/2026-03-13-content-ip-strategy-design.md
git commit -m "Record core platform architecture progress"
```

- [ ] **Step 4: Push and deploy when approved**

```bash
git push origin main
```
