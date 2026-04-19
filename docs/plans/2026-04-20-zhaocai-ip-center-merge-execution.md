# zhaocai-IP-center Merge Execution

**Date:** 2026-04-20  
**Source Branch:** `codex/zhaocai-ip-center-v1`  
**Target Branch:** `main`

## Goal

Provide exact, ready-to-run merge commands for bringing `zhaocai-IP-center` back toward `main` without rethinking the grouping strategy during execution.

This document assumes:

- the branch remains at `codex/zhaocai-ip-center-v1`
- merge is still being prepared, not executed automatically here
- grouped integration is preferred over a single giant merge

## 1. Pre-Merge Gate

Run these from the source branch before any cherry-pick or merge work:

```bash
npm run test:zhaocai-center:smoke
npm run test:gateway-cutover
./node_modules/.bin/tsc --noEmit --incremental false
```

Status as of this document:

- all three pass

Still recommended in a friendlier environment:

```bash
npm run build
```

## 2. Merge Strategy

Recommended path:

- merge in grouped slices
- one temporary integration branch per group
- validate each group before moving to the next

## 3. Grouped Commit Sets

### Group 1: Center Shell

Commits:

- `d9ca967`
- `61d7093`
- `95e8152`
- `d325cfa`

### Group 2: Style + Content

Commits:

- `70f435b`
- `e3fb0db`
- `9b261a1`
- `2137cd9`
- `1601ee9`
- `d379919`
- `5826781`
- `8eac2b7`

### Group 3: Review + Evolution + Learning

Commits:

- `e37831f`
- `728a63f`
- `44682a3`
- `181e27b`
- `efc0bb2`
- `910f422`
- `8014805`
- `2f40b1d`

### Group 4: Docs + Verification

Commits:

- `9d36c2d`
- `9fdfe4b`
- `0a31ba6`
- `80dc895`
- `4585b0b`
- `2464e01`
- `cfeac3f`
- `09aec60`
- `6e29255`
- `a8729c9`

## 4. Exact Execution Commands

### 4.1 Prepare the target branch

```bash
git switch main
git pull --ff-only
```

### 4.2 Create integration branch for Group 1

```bash
git switch -c codex/merge-zhaocai-center-shell
git cherry-pick d9ca967 61d7093 95e8152 d325cfa
```

Recommended verification after Group 1:

```bash
npm run test:gateway-cutover
./node_modules/.bin/tsc --noEmit --incremental false
```

### 4.3 Create integration branch for Group 2

If Group 1 is accepted into `main`, then:

```bash
git switch main
git pull --ff-only
git switch -c codex/merge-zhaocai-style-content
git cherry-pick 70f435b e3fb0db 9b261a1 2137cd9 1601ee9 d379919 5826781 8eac2b7
```

Recommended verification after Group 2:

```bash
npm run test:zhaocai-center:content-package
./node_modules/.bin/tsc --noEmit --incremental false
```

### 4.4 Create integration branch for Group 3

If Group 2 is accepted into `main`, then:

```bash
git switch main
git pull --ff-only
git switch -c codex/merge-zhaocai-review-evolution
git cherry-pick e37831f 728a63f 44682a3 181e27b efc0bb2 910f422 8014805 2f40b1d
```

Recommended verification after Group 3:

```bash
npm run test:zhaocai-center:evolution
./node_modules/.bin/tsc --noEmit --incremental false
```

### 4.5 Create integration branch for Group 4

If Group 3 is accepted into `main`, then:

```bash
git switch main
git pull --ff-only
git switch -c codex/merge-zhaocai-docs-verification
git cherry-pick 9d36c2d 9fdfe4b 0a31ba6 80dc895 4585b0b 2464e01 cfeac3f 09aec60 6e29255 a8729c9
```

Recommended verification after Group 4:

```bash
npm run test:zhaocai-center:smoke
npm run test:gateway-cutover
./node_modules/.bin/tsc --noEmit --incremental false
```

## 5. Alternative: One-Branch Merge

If the decision changes and one full feature-branch merge is preferred:

```bash
git switch main
git pull --ff-only
git merge --no-ff codex/zhaocai-ip-center-v1
```

I would only recommend this if:

- reviewers already accept the branch size
- one clean `build` can be captured in a better environment

## 6. Merge Notes

### Docs to review alongside code

- `docs/plans/2026-04-19-zhaocai-ip-center-design.md`
- `docs/plans/2026-04-19-zhaocai-ip-center-implementation-plan.md`
- `docs/plans/2026-04-19-zhaocai-ip-center-handoff.md`
- `docs/plans/2026-04-19-zhaocai-ip-center-merge-readiness.md`
- `docs/plans/2026-04-19-zhaocai-ip-center-verification-status.md`

### Important caveat

Current best verified state is:

- smoke tests pass
- gateway env smoke passes
- source-level type-check passes
- full `build` still needs a cleaner environment for final confidence

### Grouping caveat discovered during execution

An actual Group 1 integration attempt showed that `demo path` should not be merged as part of the shell-only group because it imports later content/review/evolution services.

That is why `9fdfe4b` is grouped under docs + verification instead of center shell in this execution document.

## 7. Bottom Line

This branch is ready for a deliberate merge process.

It is **not** yet at the point where a blind merge is the right move.

The right execution style is:

- grouped
- verified
- documented
