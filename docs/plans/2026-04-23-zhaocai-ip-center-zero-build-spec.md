# zhaocai-IP-center Zero-Build Spec

## 1. Document Purpose

This document is the clean start specification for a new agent to build `zhaocai-IP-center` from zero.

Use this document as the primary implementation brief.

Do not treat the project as a research workbench.
Do not infer product shape from older modules unless they are explicitly described here.

The target system is:

- creator-first
- stage-driven
- multi-agent
- powered by `zhaocai-gateway`

## 2. Product Definition

### Product name

`zhaocai-IP-center`

### Product type

A creator operating center.

### Core promise

Help a creator move from unclear self-positioning to continuous content output and ongoing evolution.

### Primary user

The creator themself.

### Secondary user

An operator or strategist helping a creator.

## 3. Product Scope

The first version should include six workflow stages:

1. `IP提炼`
2. `创作者画像`
3. `方向与选题`
4. `风格与内容`
5. `每日复盘`
6. `升级进化`

These six stages are the product.

The system settings area exists, but it is not the main product surface.

## 4. User Journey

### 4.1 First-time user

The user lands on the homepage.

The homepage must clearly explain:

- what this system is
- what stage the user is in
- what the next best action is

The default first action is:

- start `IP提炼`

### 4.2 Ongoing user

The user should return to the homepage and immediately see:

- current stage
- recommended next action
- recent memory snapshot
- recent system observations

The homepage should route the user into the correct stage agent.

## 5. Homepage Structure

The homepage must contain exactly these areas:

1. `Current Judgment`
   - current stage
   - why this is the next step
   - one primary CTA

2. `Six-Stage Workflow`
   - show all six stages at once
   - each stage has status and one action

3. `Quick Actions`
   - only a few common actions

4. `System Snapshot`
   - current profile snapshot
   - current style snapshot
   - recent key conclusion
   - recent trend or evolution hint

5. `System Observations`
   - short hotspot/trend summaries
   - not raw search results

## 6. Stage Agents

Each stage must have its own page under:

- `/agents/ip-extraction`
- `/agents/creator-profile`
- `/agents/topic-direction`
- `/agents/style-content`
- `/agents/daily-review`
- `/agents/evolution`

Each stage page should follow the same structure:

1. stage title
2. current judgment
3. stage outputs
4. main workspace
5. next step links

## 7. Stage Definitions

### 7.1 IP提炼 Agent

Purpose:

- help the user clarify who they are
- help them name what they should talk about
- help them define a defensible creator direction

Important rule:

- this is not a questionnaire
- this is not field-by-field form filling

Required behavior:

- conversational
- one question at a time
- supports `Brainstorming: OFF / AUTO / ON`
- can restore active sessions
- can explicitly start a new session
- asks user name and agent name at the start of a new session

Outputs:

- extraction transcript
- first draft profile
- enough clarity to move into creator profile

### 7.2 创作者画像 Agent

Purpose:

- turn extraction into a stable creator profile
- let the user edit and confirm the profile

Outputs:

- profile name
- positioning
- persona
- audience
- core themes
- voice style
- growth goal
- content boundaries

### 7.3 方向与选题 Agent

Purpose:

- generate directions
- generate topic lines
- generate daily content candidates
- show trend and hotspot observations

Important UI rule:

- one shared model-tier selector at the top
- do not repeat tier selectors for directions, topics, and candidates separately

Outputs:

- directions
- topics
- topic candidates

### 7.4 风格与内容 Agent

Purpose:

- collect style samples
- compare AI draft vs user revisions
- build an evolving style skill
- produce content assets

Outputs:

- style skill
- Xiaohongshu post draft
- short-video script
- WeChat long-form article
- livestream script
- publish-ready content package

### 7.5 每日复盘 Agent

Purpose:

- record manual performance data
- summarize review results

Outputs:

- review snapshots
- short trend notes

### 7.6 升级进化 Agent

Purpose:

- turn reviews and observations into suggestions
- write those suggestions back into long-term assets

Outputs:

- evolution decisions
- profile updates
- style updates
- platform strategy updates

## 8. IP Extraction Agent Protocol

This stage is the most important and needs its own operating rule.

### 8.1 Core principle

The agent must think before it asks.

It must not act like:

- a survey bot
- a static question tree
- a generic creator-type classifier

It must act like:

- a positioning interviewer
- a collaborative thinking partner
- a structured synthesis engine

### 8.2 Turn inputs

Each turn should include:

- full transcript
- current draft
- brainstorming mode
- current turn count

### 8.3 Turn outputs

Each model turn should return:

- `responseMode`
- `nextQuestion`
- `questionType`
- `draftProfile`
- `readyToFinalize`
- optional `userName`
- optional `agentName`

### 8.4 UX rules

- user messages should show the user name
- assistant messages should show the agent name
- finalization prompts should be standardized
- when enough information exists, show a clear instruction to click the finalization button

## 9. Data Model

### 9.1 Core profile layer

- `CreatorProfile`
- `ProfileExtractionSession`

### 9.2 Center layer

- `CenterWorkspace`
- `AgentThread`
- `SharedMemoryRecord`

### 9.3 Content/style layer

- `StyleSkill`
- `StyleSample`
- `StyleRevision`
- `ContentProject`
- `ContentAsset`
- `PublishRecord`

### 9.4 Review/evolution layer

- `ReviewSnapshot`
- `EvolutionDecision`
- `PlatformStrategyMemo`

## 10. Model and Gateway Integration

The project does not call upstream model providers directly.

It uses:

- `zhaocai-gateway`

Runtime base URL:

- `https://zhaocai.mintstudio.cn`

The app must support:

- gateway alias routing
- capability routing
- plan-based tier access

### Important current routing expectation

For `ip_extraction_interview`:

- default = `profile/extract`
- deep fallback = `tier/deep`

For `STANDARD` plan:

- default behavior = `BALANCED`
- `IP提炼` specifically can use `BALANCED + DEEP`

## 11. Environment Variables

The system should expect:

### Database

- `DATABASE_URL`
- `DIRECT_URL`

### Gateway

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`

Compatibility variables may also be required because some gateway rows can still refer to older secret-ref names:

- `ZHAOCAI_GATEWAY_BASE_URL`
- `ZHAOCAI_GATEWAY_CLIENT_KEY`
- `ZHAOCAI_GATEWAY_ADMIN_TOKEN`

### Access and plan

- `STAGING_ACCESS_PASSWORD`
- `CREATOR_OS_DEFAULT_PLAN`

## 12. Database Setup

Apply Prisma migrations in order.

Required migrations:

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

If rebuilding against a partially drifted database that already has the extraction session enum/table but Prisma has not recorded it:

```bash
npx prisma migrate resolve --applied 20260418093000_profile_extraction_sessions
npx prisma migrate deploy
```

## 13. Performance Constraints

The target build should avoid slow page loads caused by heavy server rendering.

Required performance rules:

1. homepage shell should render fast
2. non-critical blocks should load after the shell
3. do not write to the database while rendering the homepage
4. avoid repeated duplicate queries inside a single page load
5. keep heavy sections behind delayed loading when needed

For `IP提炼` specifically:

- the page shell should appear quickly
- active session restore should not feel blocked by unnecessary extra work

## 14. Deployment

Main deployment target:

- Vercel

Database:

- Supabase Postgres

Model runtime:

- `zhaocai-gateway`

If an old project named `content-ip-strategy` still exists in Vercel:

- disconnect it from Git
- remove its public aliases

That old project should not continue auto-deploying from the shared repository.

## 15. Build Order For a New Agent

A new agent should build the system in this order:

1. global shell and navigation
2. homepage with six-stage workflow
3. stage-agent routing
4. creator profile layer
5. IP extraction conversation engine
6. topic-direction layer
7. style/content layer
8. review/evolution layer
9. gateway/plan admin pages
10. deployment wiring

## 16. Acceptance Checklist

The rebuilt system should satisfy:

1. Homepage shows:
   - current judgment
   - six stages
   - quick actions
   - system snapshot
   - system observations

2. `IP提炼`:
   - supports active session restore
   - supports starting a new session
   - asks for both names at the start of a new session
   - uses named dialogue roles after that
   - shows a clear finalization instruction when enough information exists

3. `创作者画像`:
   - editable
   - profile name is carried from the extraction stage

4. `方向与选题`:
   - one shared model-tier selector
   - directions/topics/candidates all render in one workspace

5. `风格与内容`:
   - style skill visible
   - content projects visible

6. `每日复盘`:
   - review snapshots can be recorded

7. `升级进化`:
   - evolution decisions visible
   - learning observations visible

8. Gateway integration:
   - direct runtime call through `zhaocai-gateway` works
   - `DEEP` works for `IP提炼`
