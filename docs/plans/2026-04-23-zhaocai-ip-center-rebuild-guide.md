# zhaocai-IP-center Rebuild Guide

## 1. Purpose

This document is the current rebuild guide for the project now running as `zhaocai-IP-center`.

Its purpose is:

- explain what the project has become
- explain what was removed from the old `content-ip-strategy` / research-workbench direction
- give a clean rebuild sequence from zero
- make it possible to rebuild and compare behavior against the current production deployment

This guide is intentionally operational, not aspirational.

## 2. Current Product Definition

The current product is no longer the original `content-ip-strategy` workbench.

It is now:

- `zhaocai-IP-center`
- a creator-first stage-driven product shell
- centered on these six stages:
  - `IP提炼`
  - `创作者画像`
  - `方向与选题`
  - `风格与内容`
  - `每日复盘`
  - `升级进化`

The current runtime still uses:

- `Next.js App Router`
- `Prisma`
- `Supabase Postgres`
- `zhaocai-gateway`

## 3. What Was Kept

The following backbone parts were intentionally kept:

1. gateway access and capability routing
2. plan-based tier access
3. creator profile core table
4. direction / topic / topic-candidate generation chain
5. the newer center-native data layer:
   - `CenterWorkspace`
   - `AgentThread`
   - `SharedMemoryRecord`
   - `StyleSkill`
   - `StyleSample`
   - `StyleRevision`
   - `ContentProject`
   - `ContentAsset`
   - `PublishRecord`
   - `ReviewSnapshot`
   - `EvolutionDecision`
   - `PlatformStrategyMemo`
   - `ProfileExtractionSession`

## 4. What Was Removed

The old workbench surface was not only hidden. A large part of it was physically removed from runtime code.

Removed runtime modules included:

- legacy quick profile extraction path
- old `signals` API and UI
- old `sources` API and UI
- old `reviews` API and UI
- old `research-cards` API and UI
- old `drafts` API and UI
- old ingest routes
- old homepage workbench sections that depended on those modules

Important meaning:

- the current product should be rebuilt as a creator workflow product
- not as a signal-research workbench with a new skin

## 5. Key Product-Surface Files

### Global shell

- [app/layout.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/layout.tsx)
- [app/globals.css](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/globals.css)

### Homepage

- [app/page.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/page.tsx)
- [components/center/center-judgment-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/center/center-judgment-section.tsx)
- [components/center/center-agent-grid.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/center/center-agent-grid.tsx)
- [components/center/center-memory-snapshot-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/center/center-memory-snapshot-section.tsx)
- [components/center/center-quick-actions-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/center/center-quick-actions-section.tsx)
- [components/learning/learning-insights-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/learning/learning-insights-panel.tsx)

### Stage-agent routing

- [app/agents/[agentKey]/page.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/agents/[agentKey]/page.tsx)
- [components/agents/agent-shell.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/agents/agent-shell.tsx)
- [components/agents/agent-summary-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/agents/agent-summary-panel.tsx)
- [lib/center/agent-stage-config.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/center/agent-stage-config.ts)
- [lib/services/agent-stage-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/agent-stage-service.ts)

### IP extraction

- [components/profile-extract-conversation.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/profile-extract-conversation.tsx)
- [components/profile-extract-draft-preview.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/profile-extract-draft-preview.tsx)
- [components/profile/ip-extraction-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/profile/ip-extraction-agent-panel.tsx)
- [app/api/profile/extract/conversation/route.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/api/profile/extract/conversation/route.ts)
- [app/api/profile/extract/conversation/[id]/reply/route.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/api/profile/extract/conversation/[id]/reply/route.ts)
- [app/api/profile/extract/conversation/[id]/finalize/route.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/api/profile/extract/conversation/[id]/finalize/route.ts)
- [lib/services/profile-extraction-conversation-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/profile-extraction-conversation-service.ts)

### Creator profile

- [components/profile/creator-profile-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/profile/creator-profile-agent-panel.tsx)
- [components/creator-profile-editor.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/creator-profile-editor.tsx)
- [app/api/profile/route.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/app/api/profile/route.ts)
- [lib/services/profile-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/profile-service.ts)

### Topic direction

- [components/topics/topic-direction-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/topics/topic-direction-agent-panel.tsx)
- [components/topics/topic-direction-actions.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/topics/topic-direction-actions.tsx)
- [components/topics/topics-profile-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/topics/topics-profile-section.tsx)
- [components/topics/topics-list-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/topics/topics-list-section.tsx)
- [components/candidates/candidates-profile-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/candidates/candidates-profile-section.tsx)
- [components/candidates/candidates-list-section.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/candidates/candidates-list-section.tsx)
- [lib/direction-data.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/direction-data.ts)
- [lib/direction-generation.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/direction-generation.ts)
- [lib/topic-data.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/topic-data.ts)
- [lib/topic-generation.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/topic-generation.ts)
- [lib/topic-candidate-data.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/topic-candidate-data.ts)
- [lib/topic-candidate-generation.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/topic-candidate-generation.ts)

### Style/content

- [components/style/style-content-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/style/style-content-agent-panel.tsx)
- [components/style/style-skill-summary.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/style/style-skill-summary.tsx)
- [components/style/style-sample-upload-form.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/style/style-sample-upload-form.tsx)
- [components/style/style-revision-form.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/style/style-revision-form.tsx)
- [components/content/content-project-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/content/content-project-panel.tsx)
- [lib/services/style-skill-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/style-skill-service.ts)
- [lib/services/content-project-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/content-project-service.ts)

### Review/evolution

- [components/review/review-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/review/review-agent-panel.tsx)
- [components/evolution/evolution-agent-panel.tsx](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/components/evolution/evolution-agent-panel.tsx)
- [lib/services/review-snapshot-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/review-snapshot-service.ts)
- [lib/services/evolution-decision-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/evolution-decision-service.ts)
- [lib/services/proactive-learning-service.ts](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/lib/services/proactive-learning-service.ts)

## 6. Current Runtime URLs

Primary product:

- production: [content-ip-research-workbench.vercel.app](https://content-ip-research-workbench.vercel.app)

Old project:

- `content-ip-strategy` was disconnected from Git auto-deploy
- its public aliases were removed

## 7. Current Environment Variables

The project expects, at minimum:

### Database

- `DATABASE_URL`
- `DIRECT_URL`

### Gateway runtime

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`

Compatibility variables are also used because the live database still references the older secret-ref naming in at least one gateway row:

- `ZHAOCAI_GATEWAY_BASE_URL`
- `ZHAOCAI_GATEWAY_CLIENT_KEY`
- `ZHAOCAI_GATEWAY_ADMIN_TOKEN`

### Other

- `STAGING_ACCESS_PASSWORD`
- `CREATOR_OS_DEFAULT_PLAN`

See:

- [.env.example](/Users/cuijunpeng/Documents/New project/content-ip-research-workbench/.env.example)

## 8. Current Gateway Truth

The current product still depends on:

- `zhaocai-gateway`

The current public gateway base URL is:

- `https://zhaocai.mintstudio.cn`

Current runtime facts:

- direct calls to `POST /v1/chat/completions` are working
- `ip_extraction_interview` is routed through gateway alias routing
- `DEEP` for IP extraction works only after:
  - adding deep-tier fallback to the capability route
  - allowing `DEEP` specifically for `STANDARD + ip_extraction_interview`

## 9. Current Plan / Tier Behavior

Important live behavior:

- `STANDARD` remains `BALANCED` by default
- `STANDARD` was explicitly opened for `ip_extraction_interview -> BALANCED + DEEP`
- the tier picker is now capability-aware and should only show allowed tiers for that capability

## 10. Current Database Migration State

The production database was originally behind and did not contain the center-native tables.

It has now been reconciled and the following migrations are required as part of a rebuild:

1. `20260314153000_init`
2. `20260315012000_signal_score_priority_fields`
3. `20260315014500_human_review_manual_overrides`
4. `20260315114500_observation_clusters`
5. `20260317093000_creator_os_phase1_foundation`
6. `20260319114500_model_gateway_foundation`
7. `20260418093000_profile_extraction_sessions`
8. `20260419032000_zhaocai_ip_center_workspace`
9. `20260419041000_zhaocai_ip_center_shared_memory`
10. `20260419045500_zhaocai_ip_center_style_skill`
11. `20260419053500_zhaocai_ip_center_content_layer`
12. `20260419061500_zhaocai_ip_center_review_evolution`
13. `20260419073500_zhaocai_ip_center_evolution_payloads`
14. `20260419082000_zhaocai_ip_center_platform_strategy_memo`

Operational note:

One production database had `ProfileExtractionSessionStatus`, `ProfileExtractionSourceMode`, and `ProfileExtractionSession` already present but not recorded in `_prisma_migrations`.

In that case:

1. run:

```bash
npx prisma migrate resolve --applied 20260418093000_profile_extraction_sessions
```

2. then run:

```bash
npx prisma migrate deploy
```

## 11. What Was Recently Fixed

### IP extraction

- old quick extraction path deleted
- session restore path added
- session reset path added
- naming-first opening question added
- participant names supported in transcript metadata
- finalization prompt standardized to avoid repeated “如果你愿意...” phrasing
- `BALANCED` is the default visible tier
- `DEEP` is available for IP extraction once route + plan access allow it

### Product shell

- old workbench surfaces were silenced or deleted
- top nav simplified into creator workflow
- topic-direction page now uses one shared model-tier controller
- IP extraction transcript panel scroll behavior adjusted

### Performance

- homepage no longer writes workspace/thread/memory during read
- some heavy sections were moved behind `Suspense`
- production database now contains the newer center tables
- homepage remains dynamic because static pre-render repeatedly timed out

## 12. Known Remaining Issues

These still require verification or follow-up when rebuilding:

1. `IP提炼` refresh recovery works at the API level, but browser-level user verification still matters
2. an old active extraction session can hide the new naming-first flow until the user starts a new session
3. some pages are still slow because:
   - server rendering is still heavy
   - data loaders are still split
   - the database is remote
4. homepage performance is improved but not fully solved

## 13. Rebuild From Zero

### Step 1: Clone and install

```bash
git clone <repo>
cd content-ip-research-workbench
npm install
```

### Step 2: Prepare env

Create `.env.local` or runtime envs with:

```bash
DATABASE_URL=...
DIRECT_URL=...
MODEL_ROUTER_GATEWAY_BASE_URL=https://zhaocai.mintstudio.cn
MODEL_ROUTER_GATEWAY_CLIENT_KEY=...
MODEL_ROUTER_GATEWAY_ADMIN_TOKEN=...
ZHAOCAI_GATEWAY_BASE_URL=https://zhaocai.mintstudio.cn
ZHAOCAI_GATEWAY_CLIENT_KEY=...
ZHAOCAI_GATEWAY_ADMIN_TOKEN=...
STAGING_ACCESS_PASSWORD=...
CREATOR_OS_DEFAULT_PLAN=STANDARD
```

### Step 3: Generate Prisma client

```bash
npm run prisma:generate
```

### Step 4: Migrate the database

If building a clean database:

```bash
npx prisma migrate deploy
```

If rebuilding against a partially-drifted production-like database:

```bash
npx prisma migrate resolve --applied 20260418093000_profile_extraction_sessions
npx prisma migrate deploy
```

### Step 5: Start locally

```bash
npm run dev
```

### Step 6: Re-create or verify gateway routing

In admin:

1. create / verify one gateway row for `zhaocai-gateway`
2. sync aliases
3. verify capability routing
4. specifically ensure:
   - `ip_extraction_interview`
     - default = `profile/extract`
     - fallback = `tier/deep`

### Step 7: Verify plan access

Ensure:

- `STANDARD` global default = `BALANCED`
- `STANDARD + ip_extraction_interview` = `BALANCED + DEEP`

### Step 8: Deploy

On Vercel:

1. create / link project
2. set env vars
3. deploy production

If an older `content-ip-strategy` project still exists:

- disconnect Git integration
- remove its public aliases

## 14. Verification Checklist

After rebuild, verify:

1. homepage loads
2. `/agents/ip-extraction` loads
3. `IP提炼` can:
   - restore an active session
   - start a new session
   - ask naming-first opening question in a new session
4. `/agents/topic-direction` shows a single shared model tier control
5. `DEEP` works for IP extraction
6. content/style/review/evolution pages load with the new center tables available

## 15. Current Ground Truth

If something in code, docs, and production disagree:

- trust production behavior first
- trust current `main` code second
- treat older March and early-April documents as historical unless they still match the current runtime
