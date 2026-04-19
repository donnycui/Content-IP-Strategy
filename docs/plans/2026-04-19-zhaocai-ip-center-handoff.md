# zhaocai-IP-center Branch Handoff

**Date:** 2026-04-19  
**Branch:** `codex/zhaocai-ip-center-v1`  
**Project Direction:** `zhaocai-IP-center`  
**Base Repo:** `content-ip-research-workbench`

## 1. What This Branch Is

This branch is no longer a doc-only exploration branch.

It already contains a substantial product-shell upgrade from the current `content-ip-research-workbench` v2.0 baseline toward `zhaocai-IP-center`:

- a creator-first multi-agent center shell
- explicit stage-agent workspaces
- center-native memory foundations
- style skill persistence
- content project / asset / export-prep flow
- manual review / evolution loop
- proactive learning insights

This is still an in-progress branch, but it has already crossed from “design branch” into “working product branch”.

## 2. Current Product Shape

The branch currently supports these visible product layers:

1. `中枢首页`
- stage-driven center homepage
- all stage agents visible
- current / locked / revisit status
- long-term memory snapshot
- proactive learning panel

2. `显式 Stage Agents`
- `/agents/ip-extraction`
- `/agents/creator-profile`
- `/agents/topic-direction`
- `/agents/style-content`
- `/agents/daily-review`
- `/agents/evolution`

3. `长期资产基础层`
- `CenterWorkspace`
- `AgentThread`
- `SharedMemoryRecord`

4. `风格层`
- `StyleSkill`
- `StyleSample`
- `StyleRevision`

5. `内容层`
- `ContentProject`
- `ContentAsset`
- `PublishRecord`

6. `复盘与进化层`
- `ReviewSnapshot`
- `EvolutionDecision`

7. `主动学习层`
- derived style / hotspot / future-track insights
- writes into `LEARNING_INSIGHT` shared memory

## 3. Implemented Commit Slices

These are the main branch-local slices in order:

- `9d36c2d` `docs: add zhaocai IP center design and plan`
- `d9ca967` `feat: add zhaocai IP center homepage shell`
- `61d7093` `feat: add center workspace and agent thread foundation`
- `95e8152` `feat: add shared memory projection foundation`
- `d325cfa` `feat: add explicit stage agent shell`
- `70f435b` `feat: add style skill foundation`
- `e3fb0db` `feat: add content project foundation`
- `e37831f` `feat: add review and evolution loop foundation`
- `728a63f` `feat: add publish prep status actions`
- `8014805` `feat: add proactive learning insights`
- `9b261a1` `feat: add editable content assets`
- `2137cd9` `feat: add content project detail workspace`
- `44682a3` `feat: link content projects into review flow`
- `d379919` `feat: expose publish record package output`
- `8eac2b7` `feat: sync edited assets into style revisions`
- `1601ee9` `feat: add content project overview and editing`
- `181e27b` `feat: apply style evolution decisions to skill`
- `efc0bb2` `feat: add structured evolution writebacks`

## 4. Working End-to-End Paths

The branch already supports these product paths in a meaningful first-pass form:

### 4.1 Center -> Stage Agents

Users can:

- enter the new homepage shell
- see all stage agents
- navigate into explicit stage workspaces

### 4.2 Topic -> Content Project

Users can:

- take a topic candidate
- create a content project
- generate first-pass assets for:
  - Xiaohongshu post
  - short-video script
  - WeChat article
  - livestream script

### 4.3 Content Editing -> Style Feedback

Users can:

- edit generated assets in-product
- save assets
- mark assets ready / approved
- save edited assets back into style-revision signals

### 4.4 Export Prep

Users can:

- inspect publish records
- change internal publish/export status
- open an actual export JSON bundle

### 4.5 Review -> Evolution

Users can:

- record manual review snapshots
- generate evolution decisions
- accept / reject decisions

### 4.6 Evolution Writeback

Accepted evolution decisions already have real writeback behavior in these cases:

- `STYLE`
  - updates `StyleSkill`
- `PROFILE`
  - appends note into `CreatorProfile.contentBoundaries`
- `DIRECTION`
  - creates a new direction derived from the related content project

This is important: the system is no longer only recording suggestions. It now begins to mutate real product objects.

## 5. Data Model Additions on This Branch

New branch-local schema additions include:

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

Additional enums and payload structures have been added to support:

- stage routing
- shared memory categories
- style skill state
- content asset types and publish states
- evolution target typing

## 6. Known Risks / Gaps

### 6.1 Build / Type-check instability in current environment

The branch has not yet received a stable full-environment verification result.

Observed behavior:

- `npm run build` enters normal Next production build
- `tsc --noEmit` starts normally
- `prisma generate` starts normally
- all three can become abnormally slow / effectively stalled in the current environment

Current practical interpretation:

- no surfaced compile error has been observed from these changes
- but final green verification is still incomplete

### 6.2 Direct platform publishing is still deferred

The branch has publish-prep flow and export artifacts, but not real first-class external publishing integrations yet.

### 6.3 Review loop is still manual-first

Review snapshots are manually entered.

This is intentional for v1, but still a gap relative to future automation.

### 6.4 Some evolution writebacks are still shallow

Current writebacks are meaningful but not yet fully structured:

- profile writeback currently appends to content boundaries
- direction writeback currently creates a new direction
- platform-strategy decisions still do not update a dedicated platform strategy object

### 6.5 Content-project model still needs broader workflow polish

The content layer is now functional, but still needs:

- richer project filtering and index views
- better asset-to-review linking
- more explicit package/download flows

## 7. Recommended Next Priorities

If work resumes on this branch, the recommended next order is:

1. Stabilize verification
- try to get one clean build / type-check run in a friendlier environment

2. Deepen object writebacks
- especially `PROFILE`, `DIRECTION`, and future `PLATFORM_STRATEGY`

3. Improve content-project operations
- stronger project overview
- richer export package structures
- better project metadata and status flows

4. Only after that, explore external platform APIs
- Xiaohongshu
- WeChat Official Account
- WeChat Channels
- Douyin
- X

## 8. Branch Rule

For this branch, treat this document as the active branch-level handoff unless a newer dated `zhaocai-IP-center` handoff supersedes it.

