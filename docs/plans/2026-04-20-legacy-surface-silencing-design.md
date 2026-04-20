# Legacy Surface Silencing Design

## Goal

Stop old v2.0 workspace surfaces from influencing evaluation of `zhaocai-IP-center`.

The product should no longer expose old page shells as primary user-facing entry points. Users should enter through the center homepage and explicit stage agents. Existing execution components may still be reused, but they must be embedded inside the new agent workflow instead of exposed as separate legacy workbench pages.

## Scope

This pass focuses on three changes:

1. Remove or silence legacy navigation and legacy CTA links from the active UI.
2. Mount real workflow components inside the stage-agent workspace for the core stages that still depended on old pages.
3. Redirect old top-level workbench routes to the corresponding new agent routes so users cannot accidentally judge the product through the old shell.

## Decisions

### 1. Keep execution components, remove legacy shells

We will keep the reusable functional components such as:

- conversational profile extraction
- creator profile editor
- direction/topic/candidate sections

But we will stop exposing the old page wrappers around them as the main surface.

### 2. Agent workspace becomes the only primary surface

The following routes become the intended entry points:

- `/agents/ip-extraction`
- `/agents/creator-profile`
- `/agents/topic-direction`
- `/agents/style-content`
- `/agents/daily-review`
- `/agents/evolution`

Old routes will redirect into these stage-agent routes.

### 3. Legacy wording is removed from runtime UI

Runtime UI should no longer say things like:

- "legacy tools"
- "旧页面仍保留"
- "继续使用现有 v2.0 工作流"

That language weakens product judgment and makes the upgrade look incomplete.

## Redirect mapping

- `/profile/extract` -> `/agents/ip-extraction`
- `/profile` -> `/agents/creator-profile`
- `/directions` -> `/agents/topic-direction`
- `/topics` -> `/agents/topic-direction`
- `/candidates` -> `/agents/topic-direction`
- `/reviews` -> `/agents/daily-review`
- `/evolution` -> `/agents/evolution`
- `/signals` -> `/agents/topic-direction`
- `/sources` -> `/agents/topic-direction`

## Validation

After this pass:

- the top navigation should point to agent routes, not old workbench pages
- the IP extraction agent should host the real extraction workflow directly
- the creator profile agent should host the real editor directly
- the topic-direction agent should host the direction/topic/candidate workflow directly
- visiting old routes should redirect instead of rendering old shells
