# Model Gateway / Model Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a model-management layer into Creator OS so model choice, routing, and future pricing can be controlled by capability and sub-agent, with `zhaocai-gateway` as the preferred infrastructure source.

**Architecture:** Keep Creator OS as the product and workflow system. Treat `zhaocai-gateway` as the provider/model truth source. Add a local model adapter and routing layer so business capabilities stop reading environment variables directly.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL (Supabase), React, TypeScript

---

### Task 1: Add core model-management data structures

**Files:**
- Modify: `prisma/schema.prisma`
- Create migration under: `prisma/migrations/*_model_gateway_foundation/`

- [x] **Step 1: Add core entities**

Add:

- `GatewayConnection`
- `ManagedModel`
- `CapabilityRoute`
- `PlanModelAccess`
- `ModelUsageLog`

- [x] **Step 2: Keep relationships simple**

Use straightforward relations:

- one gateway -> many managed models
- one managed model -> many capability routes
- one managed model -> many usage logs

- [x] **Step 3: Generate and verify**

Run:

```bash
npm run prisma:generate
npx prisma migrate dev --name model_gateway_foundation
```

Actual execution note:

- Prisma Client regenerated successfully
- because the current Supabase database had been bootstrapped outside Prisma migrate history, the migration was generated with `prisma migrate diff` and then applied with `prisma migrate deploy` after baselining prior migrations

- [ ] **Step 4: Commit**

```bash
git add prisma
git commit -m "Add model gateway data foundation"
```

### Task 2: Add a model adapter layer

**Files:**
- Create: `lib/models/model-adapter.ts`
- Create: `lib/models/model-types.ts`
- Create: `lib/models/gateway-client.ts`

- [ ] **Step 1: Define a normalized request/response shape**

The adapter should standardize:

- prompt/messages input
- system instructions
- structured JSON expectations
- text output
- usage metadata

- [ ] **Step 2: Implement an initial gateway client**

Support a first `chat-completions`-style client compatible with `zhaocai-gateway`.

- [ ] **Step 3: Leave room for protocol expansion**

Do not hardcode all business logic to one protocol. The adapter should support future variants such as:

- OpenAI Responses
- Anthropic Messages

- [ ] **Step 4: Commit**

```bash
git add lib/models
git commit -m "Add model adapter foundation"
```

### Task 3: Add capability routing resolution

**Files:**
- Create: `lib/services/model-routing-service.ts`
- Modify: service files that perform LLM work

- [ ] **Step 1: Resolve capability -> model policy**

Implement a resolver that can determine:

- default model
- fallback model
- whether fallback is allowed
- whether user override is allowed

- [ ] **Step 2: Add capability keys**

Normalize the first capability keys:

- `signal_scoring`
- `ip_extraction_interview`
- `ip_strategy_report`
- `direction_generation`
- `topic_generation`
- `topic_candidate_generation`
- `profile_evolution`

- [ ] **Step 3: Commit**

```bash
git add lib/services
git commit -m "Add capability routing service"
```

### Task 4: Refactor existing LLM entry points to use the adapter

**Files:**
- Modify: `lib/signal-scoring.ts`
- Modify: `lib/profile-extraction.ts`
- Modify: later Creator OS generation files as needed

- [ ] **Step 1: Move direct env-based calls behind the adapter**

Stop calling provider endpoints directly from business logic.

- [ ] **Step 2: Route the first two critical capabilities**

Refactor:

- signal scoring
- IP extraction

to use:

- capability resolver
- model adapter
- gateway client

- [ ] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected:

- build passes
- no direct raw model call remains in these two core paths

- [ ] **Step 4: Commit**

```bash
git add lib/signal-scoring.ts lib/profile-extraction.ts lib/models lib/services
git commit -m "Route core AI capabilities through model adapter"
```

### Task 5: Add gateway sync services

**Files:**
- Create: `lib/services/gateway-sync-service.ts`
- Create: optional supporting files under `lib/models/`

- [ ] **Step 1: Connect to zhaocai-gateway model endpoints**

Use:

- `/v1/models`
- `/v1/providers`

to pull provider/model metadata.

- [ ] **Step 2: Persist managed-model cache**

Store synchronized model records into `ManagedModel` and mark their gateway source.

- [ ] **Step 3: Commit**

```bash
git add lib/services lib/models
git commit -m "Add gateway sync service"
```

### Task 6: Add lightweight admin pages

**Files:**
- Create: `app/admin/gateways/page.tsx`
- Create: `app/admin/models/page.tsx`
- Create: `app/admin/routing/page.tsx`
- Add supporting components under `components/`

- [ ] **Step 1: Build Gateway admin page**

Allow:

- viewing current gateway configs
- testing connection
- triggering sync

- [ ] **Step 2: Build Models admin page**

Allow:

- viewing synchronized models
- enabling/disabling visibility
- assigning tier labels

- [ ] **Step 3: Build Routing admin page**

Allow:

- assigning default model to a capability
- assigning fallback
- toggling fallback/override flags

- [ ] **Step 4: Verify**

Run:

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/admin components
git commit -m "Add model management admin pages"
```

### Task 7: Add usage logging and phase handoff

**Files:**
- Modify: model adapter / gateway client
- Modify: `docs/plans/2026-03-13-content-ip-strategy-design.md`

- [ ] **Step 1: Record usage logs**

Capture:

- capability
- model
- gateway
- latency
- estimated cost
- success/error

- [ ] **Step 2: Update running design log**

Append the completed model-gateway milestones to the central log.

- [ ] **Step 3: Final verification**

Run:

```bash
npm run build
git status --short
```

Expected:

- build passes
- worktree is clean except intentional changes

- [ ] **Step 4: Commit**

```bash
git add docs/plans/2026-03-13-content-ip-strategy-design.md lib/models lib/services
git commit -m "Record model gateway progress"
```
