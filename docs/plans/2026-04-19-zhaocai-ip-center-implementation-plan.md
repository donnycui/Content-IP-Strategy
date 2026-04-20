# zhaocai-IP-center Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the current `content-ip-research-workbench` into a creator-first `zhaocai-IP-center` shell with visible stage agents, shared memory, style-skill content production, and a basic review/evolution loop on top of the existing v2.0 backbone.

**Architecture:** Keep the current strategy/research/model-routing core in place. Add a new center shell, center-native workflow tables, and a new content/review layer rather than overloading the existing draft-only model. Roll out in vertical slices so the creator journey works end to end before direct-publishing integrations deepen.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma/PostgreSQL, existing `zhaocai-gateway` model-routing stack, current service-layer patterns in `lib/services/`

---

### Task 1: Rebrand the app shell into zhaocai-IP-center

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `components/top-nav.tsx` if navigation structure changes
- Modify: `docs/plans/2026-04-18-v2.0-project-handoff.md` only if a superseding handoff pointer is needed

- [ ] Update package/app naming from `content-ip-research-workbench` to `zhaocai-IP-center` where user-facing.
- [ ] Replace homepage metadata, shell copy, and top-level positioning text with creator-center language.
- [ ] Keep old v2.0 capabilities reachable while the new shell is introduced.
- [ ] Run `npm run build`.
- [ ] Commit with a shell-branding message.

### Task 2: Build the center homepage shell

**Files:**
- Modify: `app/page.tsx`
- Create: `components/center/center-judgment-section.tsx`
- Create: `components/center/center-agent-grid.tsx`
- Create: `components/center/center-coordinator-section.tsx`
- Create: `components/center/center-memory-snapshot-section.tsx`
- Create: `components/center/center-quick-actions-section.tsx`
- Create: `lib/services/center-home-service.ts`
- Modify: `app/loading.tsx`

- [ ] Add a service that resolves homepage stage status, recommended action, and quick summaries.
- [ ] Replace the current workbench homepage with the new five-zone center shell.
- [ ] Show all stage agents with status labels: `当前`, `待解锁`, `建议回看`.
- [ ] Add a coordinator conversation placeholder that routes users into stage agents.
- [ ] Run `npm run build`.
- [ ] Commit the homepage shell slice.

### Task 3: Add center-native workspace and agent-thread persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_zhaocai_ip_center_workspace/migration.sql`
- Create: `lib/services/center-workspace-service.ts`
- Create: `lib/services/agent-thread-service.ts`
- Modify: `lib/domain/contracts.ts`

- [ ] Add a `CenterWorkspace` model for creator-centered state.
- [ ] Add an `AgentThread` model for one thread per lifecycle agent.
- [ ] Define typed contracts for stage-agent summaries and homepage status payloads.
- [ ] Add service helpers to create/read/update the active workspace and stage threads.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run build`.
- [ ] Commit the workspace/thread foundation.

### Task 4: Add shared longitudinal memory persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_zhaocai_ip_center_shared_memory/migration.sql`
- Create: `lib/services/shared-memory-service.ts`
- Create: `lib/center/shared-memory-types.ts`
- Modify: `lib/domain/contracts.ts`

- [ ] Add a `SharedMemoryRecord` model with typed categories for profile/style/conclusion/review/learning memory.
- [ ] Implement read/write helpers for current-effective versus historical records.
- [ ] Add projection helpers so the homepage and stage agents can render a memory snapshot without reading raw transcripts.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run build`.
- [ ] Commit the shared-memory layer.

### Task 5: Generalize the stage-agent shell

**Files:**
- Create: `app/agents/[agentKey]/page.tsx`
- Create: `components/agents/agent-shell.tsx`
- Create: `components/agents/agent-thread-panel.tsx`
- Create: `components/agents/agent-summary-panel.tsx`
- Create: `lib/services/agent-stage-service.ts`
- Modify: `components/top-nav.tsx`

- [ ] Introduce a route pattern for explicit stage agents.
- [ ] Render one shared shell that loads the correct thread and summary for each agent.
- [ ] Link homepage agent cards into these routes.
- [ ] Keep the old pages accessible temporarily while the new shell grows.
- [ ] Run `npm run build`.
- [ ] Commit the stage-agent shell slice.

### Task 6: Map existing IP extraction and profile flows into the new agent shell

**Files:**
- Modify: `app/profile/extract/page.tsx`
- Modify: `components/profile-extract-workbench.tsx`
- Modify: `components/profile-extract-conversation.tsx`
- Modify: `app/profile/page.tsx`
- Modify: `components/creator-profile-editor.tsx`
- Modify: `lib/services/profile-service.ts`
- Modify: `lib/services/profile-extraction-conversation-service.ts`

- [ ] Route `IP提炼 Agent` through the new agent shell while reusing the current conversational extraction logic.
- [ ] Route `创作者画像 Agent` through the new agent shell while reusing current profile editing/storage logic.
- [ ] Write important extraction/profile milestones into shared memory.
- [ ] Verify the extraction flow still finalizes into `CreatorProfile`.
- [ ] Run `npm run build`.
- [ ] Commit the extraction/profile integration slice.

### Task 7: Map existing direction/topic generation into the new agent shell

**Files:**
- Modify: `app/directions/page.tsx`
- Modify: `app/topics/page.tsx`
- Modify: `app/candidates/page.tsx`
- Modify: `lib/services/direction-service.ts`
- Modify: `lib/services/topic-service.ts`
- Modify: `lib/services/topic-candidate-service.ts`
- Modify: `lib/services/center-home-service.ts`

- [ ] Route `选题方向 Agent` through the new shell.
- [ ] Make the agent capable of showing directions, topic pools, and today’s recommendations.
- [ ] Connect agent status and “next best action” back to homepage judgment.
- [ ] Run `npm run build`.
- [ ] Commit the direction/topic slice.

### Task 8: Introduce a style-skill domain

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_zhaocai_ip_center_style_skill/migration.sql`
- Create: `lib/services/style-skill-service.ts`
- Create: `lib/services/style-sample-service.ts`
- Create: `lib/services/style-revision-service.ts`
- Create: `app/agents/style-content/page.tsx` or map through `app/agents/[agentKey]/page.tsx`
- Create: `components/style/style-sample-upload-form.tsx`
- Create: `components/style/style-skill-summary.tsx`

- [ ] Add `StyleSkill`, `StyleSample`, and `StyleRevision` models.
- [ ] Support sample ingestion and initial style-skill generation.
- [ ] Store user edits as revision signals for future skill updates.
- [ ] Show current style summary inside the content agent.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run build`.
- [ ] Commit the style-skill foundation.

### Task 9: Build a center-native content layer

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_zhaocai_ip_center_content_layer/migration.sql`
- Create: `lib/services/content-project-service.ts`
- Create: `lib/services/content-asset-service.ts`
- Create: `lib/services/publish-record-service.ts`
- Create: `components/content/content-project-panel.tsx`
- Create: `components/content/content-asset-editor.tsx`
- Create: `components/content/publish-prep-panel.tsx`
- Modify: existing draft-generation entry points if reused

- [ ] Add `ContentProject`, `ContentAsset`, and `PublishRecord` models.
- [ ] Model one selected topic flowing into multiple channel-specific assets.
- [ ] Support at least these asset types in v1: Xiaohongshu image-post, short-video script, WeChat article, livestream script.
- [ ] Support export-ready publish packages before deep direct-publishing work.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run build`.
- [ ] Commit the center-native content layer.

### Task 10: Add review and evolution persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_zhaocai_ip_center_review_evolution/migration.sql`
- Create: `lib/services/review-snapshot-service.ts`
- Create: `lib/services/evolution-decision-service.ts`
- Create: `components/review/review-metrics-form.tsx`
- Create: `components/review/review-summary-panel.tsx`
- Create: `components/evolution/evolution-decision-panel.tsx`

- [ ] Add `ReviewSnapshot` and `EvolutionDecision` models.
- [ ] Support manual metric entry for v1.
- [ ] Produce simple review summaries and proposed updates to profile/style/direction.
- [ ] Write accepted decisions back into shared memory and existing suggestion/profile systems.
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run build`.
- [ ] Commit the review/evolution slice.

### Task 11: Add proactive-learning foundation

**Files:**
- Create: `lib/services/proactive-learning-service.ts`
- Create: `components/learning/learning-insights-panel.tsx`
- Modify: `lib/url-ingest.ts`
- Modify: `lib/rss-ingest.ts`
- Modify: `lib/services/center-home-service.ts`
- Modify: shared-memory-related files from Task 4

- [ ] Build a first-pass service that turns current signal/research data into “learning insights”.
- [ ] Support manually triggered deep-dive insight generation.
- [ ] Persist accepted insights into shared memory as separate learning records.
- [ ] Surface recent insights on the homepage.
- [ ] Run `npm run build`.
- [ ] Commit the proactive-learning foundation.

### Task 12: Verification and migration hardening

**Files:**
- Modify: `tests/model-routing-env.test.mjs` if gateway assumptions change
- Create: `tests/zhaocai-ip-center-stage-service.test.mjs`
- Create: `tests/zhaocai-ip-center-shared-memory.test.mjs`
- Create: `docs/plans/2026-04-19-zhaocai-ip-center-handoff.md` when implementation is done

- [ ] Add targeted tests for stage resolution and shared-memory projection using the repo’s existing Node test style.
- [ ] Run `./node_modules/.bin/tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Manually verify the creator path: first visit -> extraction -> profile -> topic -> content package -> review -> evolution.
- [ ] Manually verify degraded paths: missing style samples, publish fallback to export, incomplete review data.
- [ ] Commit the verification and hardening pass.

### Task 13: Branch hygiene and merge preparation

**Files:**
- Modify: `task_plan.md`
- Modify: `findings.md`
- Modify: `progress.md`
- Modify: final handoff docs under `docs/plans/`

- [ ] Keep planning files updated during execution.
- [ ] Maintain focused commits by vertical slice.
- [ ] Document any schema or API assumptions that block later direct-publishing work.
- [ ] Prepare a clear merge summary back to the main branch.
