# zhaocai-IP-center Design

**Date:** 2026-04-19  
**Project:** `zhaocai-IP-center`  
**Base Repo:** `content-ip-research-workbench`

## 1. Goal

Upgrade the current `content-ip-research-workbench` v2.0 application into `zhaocai-IP-center`: a stage-driven, multi-agent personal-IP operating center for creators.

The first release should support the full creator journey at a product-shell level while prioritizing the path from:

`IP提炼 -> 画像固化 -> 方向/选题 -> 风格学习 -> 内容产出 -> 发布准备`

The product should also include a lighter but real loop for:

`每日复盘 -> 升级进化 -> 回写画像/风格/方向`

## 2. Product Positioning

`zhaocai-IP-center` is not a traditional research workbench and not a single chat interface.

It is:

- a creator-first operating center
- a visible multi-agent workspace
- a system that accumulates long-term memory about the creator
- a product whose model execution continues to run through `zhaocai-gateway`

Primary user:

- creator themself

Secondary user:

- operator / strategist acting on behalf of a creator

## 3. Core Product Thesis

The system should not ask the user to manually discover “which module to use next”.

Instead:

- the system judges the creator’s current stage
- the homepage recommends the next best action
- every lifecycle stage is represented by an explicit agent
- every agent has its own thread
- the system also maintains a shared cross-stage memory layer

## 4. Lifecycle and Agent Model

The creator lifecycle is represented through explicit stage agents:

1. `IP提炼 Agent`
2. `创作者画像 Agent`
3. `选题方向 Agent`
4. `风格提炼与内容 Agent`
5. `每日复盘 Agent`
6. `升级进化 Agent`

### 4.1 IP提炼 Agent

Purpose:

- guide first-time creators through conversational IP extraction
- allow brainstorming-style probing instead of rigid forms
- produce an initial extraction report

Outputs:

- extraction report
- first-pass positioning ideas
- initial boundary/goal signals

### 4.2 创作者画像 Agent

Purpose:

- turn extraction output into a stable creator profile
- allow edits, clarification, and versioned updates
- become the authoritative current profile

Outputs:

- current creator profile
- profile change history

### 4.3 选题方向 Agent

Purpose:

- produce direction suggestions
- generate candidate topics
- support “today’s recommendations”
- consume market signals and proactive learning results

Outputs:

- directions
- topic pool
- daily topic suggestions

### 4.4 风格提炼与内容 Agent

Purpose:

- learn the creator’s style from samples and edits
- maintain a living style skill
- produce platform-ready content assets
- support export and future direct publishing

Supported content in v1:

- Xiaohongshu image-post content
- short-video scripts
- WeChat Official Account long-form articles
- livestream scripts

### 4.5 每日复盘 Agent

Purpose:

- capture content performance data
- produce per-content and per-period reviews
- monitor longer-term trends

Outputs:

- daily review notes
- period review notes
- trend observations

### 4.6 升级进化 Agent

Purpose:

- convert reviews and proactive learning into system updates
- propose changes to profile, style, direction, and platform strategy

Outputs:

- evolution suggestions
- profile update suggestions
- style update suggestions
- strategy adjustments

## 5. Homepage Information Architecture

The homepage is a dynamic operating center, not a static dashboard.

It always contains five zones:

### 5.1 Center Judgment Zone

Shows:

- current lifecycle stage
- recommended next action
- reason for the recommendation

Primary CTA examples:

- `开始第一次 IP 提炼`
- `继续完善画像`
- `生成今日选题`
- `进入今日复盘`

### 5.2 Stage Agent Overview Zone

All stage agents remain visible at once.

Each card shows:

- agent name
- stage status
- recent completion time
- missing requirement / why blocked
- one quick action

Allowed status labels:

- `当前`
- `待解锁`
- `建议回看`

### 5.3 Homepage Coordinator Conversation Zone

The homepage still contains a coordinator-style conversation block.

This is not the same as hiding all agents behind one bot. Its job is to:

- explain why the system made its recommendation
- accept fuzzy user intent
- route the user into the correct stage agent
- surface recent reminders

### 5.4 Long-Term Asset Snapshot Zone

Shows condensed system memory:

- current profile snapshot
- current style snapshot
- recent key conclusions
- recent proactive-learning insights
- recent long-term trend alerts

### 5.5 Quick Actions Zone

Examples:

- start new IP extraction
- upload writing samples
- generate today’s topics
- generate short-video script
- generate livestream script
- record review metrics
- open latest learning insight

## 6. Memory Architecture

Memory is hybrid:

- each stage agent owns its own thread
- the system also keeps a shared cross-stage longitudinal record

### 6.1 Per-Agent Threading

Each explicit agent has its own thread for:

- focused conversation context
- draft state
- next recommended action
- stage-local summaries

### 6.2 Shared Longitudinal Memory

The shared record should start as a long-term asset layer, not an everything-store.

V1 categories:

1. `创作者画像主档`
2. `画像演变记录`
3. `个人风格资产`
4. `风格演变记录`
5. `关键结论库`
6. `复盘与长期曲线`
7. `主动学习沉淀`

The product should avoid storing every raw transcript or every discarded draft in shared memory by default.

## 7. Data Strategy

Use this principle:

`Reuse existing v2.0 backbone objects where their semantics still fit. Create center-native objects only where the product meaning has changed.`

### 7.1 Existing Objects to Reuse

Directly reuse:

- `CreatorProfile`
- `Direction`
- `Topic`
- `TopicCandidate`
- `ProfileExtractionSession`
- `ProfileUpdateSuggestion`
- `Source`
- `Signal`
- `SignalScore`
- `HumanReview`
- `ResearchCard`
- `GatewayConnection`
- `ManagedModel`
- `CapabilityRoute`
- `PlanModelAccess`
- `ModelUsageLog`

Why:

- the current repo already has a usable strategy/research/model-routing backbone
- these tables align with the upgraded center’s core domain

### 7.2 New Center-Native Objects

Add a new layer for center-native workflow and content objects:

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

These objects should carry the new semantics that the old `ContentDraft` / `ContentFeedback` pair cannot represent cleanly.

## 8. Style Skill Strategy

The style system should not be implemented as a prompt-only feature.

It should follow a persistent skill model:

- ingest user-owned writing samples
- infer initial style rules
- generate draft content using the current style skill
- compare AI draft with user-edited result
- extract revision rules
- update the style skill over time

This enables the system to become more creator-specific with repeated use.

## 9. Proactive Learning Strategy

Proactive learning is hybrid:

- continuous background learning
- user-triggered deep-dive research

It should focus on:

- which styles perform better on which platforms
- current market hotspots
- possible future hotspots

The system should store learning output separately from user-specific conclusions so confidence and provenance stay clear.

The current repo’s signal/source ingestion foundation can be used as the starting point for this capability.

## 10. Channel and Publishing Strategy

Target channels in scope:

- Xiaohongshu image posts + short-video coordination
- WeChat Channels short video
- Douyin short video
- WeChat Official Account articles + image-text content
- Zhihu
- X
- Reddit

### 10.1 First-Release Publishing Priority

Record the direct-publishing priority order as:

1. Xiaohongshu
2. WeChat Official Account
3. WeChat Channels
4. Douyin
5. X

API feasibility for direct publishing is intentionally deferred to a later technical investigation.

### 10.2 First-Release Delivery Model

The first release should support:

- one-click publishing for priority channels when feasible
- export-ready content packages for all other channels

## 11. First-Release Scope

### 11.1 P0: Must Exist

- homepage center shell
- IP extraction agent
- creator profile agent
- topic direction agent
- style-and-content agent
- publish-preparation layer

### 11.2 P1: Must Exist in Lighter Form

- daily review agent
- evolution agent
- proactive-learning agent/domain

### 11.3 Explicitly Deferred

- full direct publishing across every desired channel
- full automatic performance-data ingestion from all platforms
- heavy operator/agency collaboration model
- full productization of OpenClaw as an external channel

## 12. Risks

Primary risks:

1. old workbench semantics conflicting with the new center shell
2. content-system complexity outpacing the mature research-system core
3. style learning collapsing into a fake prompt feature
4. review/evolution staying at display-only level
5. direct-publishing API complexity delaying the whole release

## 13. Error-Handling Principles

Use one rule throughout the system:

`Failure in one stage must not break the whole creator journey.`

Examples:

- IP extraction failure should preserve transcript and draft, and allow quick-mode fallback
- style-learning gaps should fall back to base drafts plus user edits
- publish failures should degrade to export packages
- review without API data should still allow manual input
- proactive-learning uncertainty should not overwrite stronger prior conclusions

## 14. Validation Strategy

Validation should be chain-based, not only page-based.

Minimum full-path validation:

`first visit -> IP extraction -> profile solidification -> direction/topic generation -> style learning -> content package generation -> publish record -> review input -> evolution suggestion`

Also validate:

- degraded/failure paths
- shared-memory accumulation
- agent-stage status transitions

## 15. Delivery Strategy

The correct delivery model is:

`stand up the zhaocai-IP-center shell first, then gradually absorb the existing v2.0 capabilities into the new memory, content, and review layers.`

Recommended branch:

- `codex/zhaocai-ip-center-v1`

Recommended implementation sequence:

1. center shell and navigation
2. workspace / agent thread / shared memory foundation
3. style skill + content layer
4. review + evolution base loop
5. direct-publishing feasibility work

