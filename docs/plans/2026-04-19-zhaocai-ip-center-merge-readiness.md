# zhaocai-IP-center Merge Readiness

**Date:** 2026-04-19  
**Branch:** `codex/zhaocai-ip-center-v1`

## Goal

Provide a practical merge/readiness snapshot for the current `zhaocai-IP-center` branch so reviewers can quickly answer:

- what is already implemented
- what is stable enough for branch review
- what still blocks a confident merge into the main line

## Scope Already Implemented

This branch already includes:

1. `中枢首页`
- stage-driven homepage
- visible multi-agent entry
- memory snapshot
- proactive learning panel

2. `显式 Agent 工作区`
- dedicated `/agents/*` routes
- shared shell
- workspace/thread backing foundation

3. `长期资产`
- shared memory
- style skill
- platform strategy memo

4. `内容主链`
- topic candidate -> content project
- generated content assets
- in-product asset editing
- export-ready publish records
- project-level export bundle

5. `复盘与进化`
- manual review snapshots
- generated evolution decisions
- real object writeback for:
  - style
  - profile notes
  - direction
  - platform strategy memo

6. `主动学习`
- ambient and manually refreshable insights
- shared-memory persistence into `LEARNING_INSIGHT`

7. `轻量验证`
- evolution decision logic smoke test
- demo-playbook smoke test
- content-package smoke test

## What Is Review-Ready

These areas are already coherent enough for code review or internal demo review:

- center homepage shell
- agent routing shell
- style-content workflow
- review/evolution workflow
- project export bundle flow
- smoke-test scripts

## What Still Feels Pre-Merge

These areas still need caution before merging to `main`:

1. `Full build verification`
- `build`
- `tsc`
- `prisma generate`
currently remain slower / less reliable than ideal in this environment

Updated current state:

- `tsc` now passes
- lightweight smoke checks now pass
- `gateway-cutover` smoke check passes
- `build` remains the main unstable verification item

2. `Some writebacks are still coarse`
- profile updates append notes instead of doing richer field-level mutations
- direction writebacks create new directions rather than updating structured direction weights or strategy graphs

3. `External integrations are still intentionally deferred`
- real channel publishing APIs
- automated platform metrics ingestion

4. `Project workflow still needs more operational polish`
- stronger filtering
- richer package semantics
- more explicit project lifecycle controls

## Current Merge Interpretation

This branch is not “throwaway prototype code”.

It is:

- substantial
- coherent
- demoable
- reviewable

But it is not yet “fully merge-safe by default” until one of these happens:

1. a clean full build / type-check run is captured, or
2. the merge is explicitly accepted with the current environment-level verification caveat

Current more precise reading:

- type-check is no longer the blocker
- lightweight smoke is no longer the blocker
- the remaining merge caution is mainly the still-unstable full `build`
- grouped merge execution has now also shown that:
  - `Center Shell` can be validated independently
  - `Creator Workflow` can be validated independently, with one very small follow-up fix

## Recommended Merge Path

If the goal becomes merging this work back toward `main`, the recommended path is:

1. Review the branch against the demo path
2. Run smoke checks:
   - `npm run test:zhaocai-center:smoke`
   - `npm run test:gateway-cutover`
3. Run:
   - `./node_modules/.bin/tsc --noEmit --incremental false`
4. Attempt one clean build in a friendlier environment
5. Decide whether to:
   - merge as one feature branch, or
   - cherry-pick / squash selected slices

## Best Candidates for Squash or Grouping

These commit groups are natural merge groupings:

1. `center shell`
- homepage shell
- workspace/thread
- shared memory
- explicit stage agents

2. `style + content`
- style skill
- content projects
- editable assets
- project detail / export bundle

3. `review + evolution + learning`
- review snapshots
- evolution decisions
- style/platform/profile/direction writebacks
- proactive learning

4. `verification + docs`
- branch handoff
- smoke tests
- demo path

## Bottom Line

The branch is already strong enough for:

- product walkthroughs
- architecture review
- merge planning

The main blocker to a more confident merge is still toolchain-level verification rather than missing core product structure.
