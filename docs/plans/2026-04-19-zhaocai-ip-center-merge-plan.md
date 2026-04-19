# zhaocai-IP-center Merge Plan

**Date:** 2026-04-19  
**Branch:** `codex/zhaocai-ip-center-v1`  
**Base Branch:** `main`

## Goal

Provide a practical merge path for the current `zhaocai-IP-center` branch now that the feature set, docs, and lightweight verification are all in place.

This document is not the same as the branch handoff:

- handoff = what exists
- merge plan = how to bring it back safely

## 1. Current Branch Scope

Relative to `main`, this branch contains:

- 90+ touched or added files
- homepage shell rewrite
- explicit stage-agent routing
- new center-native schema/model layer
- style/content/review/evolution/learning layers
- branch docs and smoke tests

Diff size is large enough that merge strategy matters.

## 2. Merge Options

There are two realistic merge paths.

### Option A: Merge the whole feature branch

Use when:

- the goal is to land `zhaocai-IP-center` as one coherent product shift
- reviewers already understand this is not a small incremental patch
- one clean build can be captured in a friendlier environment

Pros:

- preserves product coherence
- avoids re-splitting already coherent slices
- easiest to keep docs, code, and schema in sync

Cons:

- large review surface
- any hidden issue affects the whole merge

### Option B: Merge in grouped slices

Use when:

- reviewers want smaller checkpoints
- merge risk needs to be spread across multiple steps
- branch-level validation remains partially environment-constrained

Pros:

- easier code review
- easier rollback of individual layers
- lets main absorb the product shell before every deep feature lands

Cons:

- requires more cherry-picking / branch coordination
- greater chance of drift between docs and implementation if done carelessly

## 3. Recommended Option

My recommendation is:

`Option B first, but grouped by product layer rather than by individual commit.`

Reason:

- this branch is coherent enough to merge
- but it is also large enough that a single huge merge may be harder to review and trust
- grouped merges preserve product meaning without exploding the number of merge steps

## 4. Recommended Merge Groups

### Group 1: Center Shell

Commits:

- `d9ca967` homepage shell
- `61d7093` workspace/thread foundation
- `95e8152` shared memory foundation
- `d325cfa` explicit stage-agent shell

Result:

- `main` gains the new center shell and explicit stage-agent navigation

### Group 2: Style + Content

Commits:

- `70f435b` style skill foundation
- `e3fb0db` content project foundation
- `9b261a1` editable content assets
- `2137cd9` content project detail workspace
- `1601ee9` content project overview and editing
- `d379919` export output
- `5826781` project export bundle
- `8eac2b7` style feedback from content edits

Result:

- `main` gains a real creator-specific content workflow

### Group 3: Review + Evolution + Learning

Commits:

- `e37831f` review/evolution loop foundation
- `728a63f` publish prep status flow
- `44682a3` review linking
- `181e27b` style evolution writeback
- `efc0bb2` structured evolution writebacks
- `910f422` platform strategy memo writebacks
- `8014805` proactive learning insights
- `2f40b1d` asset-aware review flow

Result:

- `main` gains the first real closed loop

### Group 4: Docs + Verification

Commits:

- `9d36c2d` design + plan docs
- `9fdfe4b` demo path
- `0a31ba6` branch handoff
- `80dc895` refreshed handoff
- `4585b0b` merge readiness + smoke script
- `2464e01` branch smoke checks
- `cfeac3f` content package smoke check
- `09aec60` typecheck fixes + verification docs

Result:

- `main` gains the branch’s operating context and lightweight verification layer

## 5. Suggested Merge Order

If grouped merges are used, do them in this order:

1. Group 1: Center Shell
2. Group 2: Style + Content
3. Group 3: Review + Evolution + Learning
4. Group 4: Docs + Verification

Reason:

- the shell should land before the deep stage internals
- the content layer should exist before the review/evolution loop
- the loop should exist before final docs and verification are declared authoritative
- the demo path depends on content/review/evolution layers and should not be treated as shell-only

## 6. Verification Gate Before Merge

Before any merge path:

1. run:

```bash
npm run test:zhaocai-center:smoke
npm run test:gateway-cutover
```

2. run one clean:

```bash
./node_modules/.bin/tsc --noEmit --incremental false
```

3. attempt one clean:

```bash
npm run build
```

If `build` still stalls in the current environment:

- record that explicitly in the merge discussion
- do not silently imply it passed

## 7. Preferred Merge Message

If merged as one branch, I would recommend a merge summary along these lines:

`feat: land zhaocai IP center shell and creator workflow foundations`

If grouped, keep the grouped merge messages aligned to the sections above.

## 8. Bottom Line

This branch is already:

- demoable
- reviewable
- partially verified

The remaining question is no longer “is there enough product here?”

The remaining question is:

`how much review surface do we want to absorb in a single merge step?`
