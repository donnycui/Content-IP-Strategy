# Mini Program Entry Scope

Date: 2026-03-18
Status: Draft
Owner: cuijunpeng

## Purpose

Define the first mini program entry boundary for Creator OS without building the mini program itself.

The mini program is intended to be a light action channel, not a second full workspace. It should help creators quickly check direction, review topic recommendations, respond to profile evolution prompts, and capture short inputs while away from the web workbench.

## Channel Position

- `Web` remains the primary runtime and full operating workspace
- `Mini Program` becomes the first mobile-friendly secondary channel
- `OpenClaw` remains a later agentic channel for deeper conversational orchestration

## First-Stage Jobs

The mini program should be good at:

- seeing today’s strategic snapshot in one screen
- checking the top directions
- checking the top topic recommendations
- quickly accepting or rejecting profile update suggestions
- saving a quick note or idea stub

The mini program should not yet attempt to replicate:

- full signal-feed management
- long-form profile editing
- research-card editing
- draft editing
- calibration and review dashboards

## First Action Set

### 1. Get today summary

Return a concise mobile-ready payload:

- creator profile summary
- top directions
- top topic recommendations
- pending profile update suggestions

### 2. Get directions

Return the current active directions so the creator can quickly review what to keep in focus this week.

### 3. Get topic recommendations

Return the top current topic candidates with:

- title
- why now
- fit reason
- priority
- recommended format

### 4. Confirm or reject profile update suggestion

Allow the creator to respond to a pending profile evolution suggestion from a mobile context.

### 5. Capture quick note

Reserve an endpoint contract for fast idea capture. This should not yet build a full note system. It only marks the future channel need and keeps the architecture open.

## Backing Capabilities

These mini program actions should use the existing core platform services rather than creating a parallel logic path.

- `getActiveCreatorProfileService`
- `getActiveDirectionsService`
- `getTopicCandidatesService`
- `getProfileEvolutionSuggestionsService`
- `updateProfileEvolutionSuggestionStatus`

## Boundary Rule

The mini program should adapt services, not own them.

That means:

- no mini-program-specific business logic should become the system of record
- no duplicated recommendation or evolution logic should be created for mobile
- the mini program should stay thin and channel-specific

## Success Criteria

The boundary is considered correct when:

- the supported action set is explicit
- each action maps cleanly to an existing platform capability
- the mobile channel can remain thin while the system core stays in Web-hosted services
