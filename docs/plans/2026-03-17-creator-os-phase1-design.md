# Knowledge Creator AI OS Phase 1 Design

## Goal

Upgrade the current content research workbench into the first phase of a knowledge-creator AI operating system.

Phase 1 focuses on one core outcome:

- help a creator define who they are
- identify what they should talk about next
- continuously evolve that identity with AI suggestions that the creator explicitly confirms

This phase does **not** try to complete the whole lifecycle platform. It establishes the strategic top layer that later creation, distribution, and growth systems will depend on.

## Product Position

This product should be framed as:

- a knowledge creator AI operating system

Not as:

- a generic AI writing tool
- a content scheduling tool
- a hot-topic monitoring dashboard

The platform should organize the creator's long-term operating workflow:

- define creator identity
- choose strategic directions
- organize durable themes
- recommend daily and weekly topics
- capture judgment feedback
- suggest profile evolution over time

## Core Principle

The system must evolve with the creator.

However, creator identity should never be silently rewritten by the system.

The platform will therefore use this rule:

- AI proposes profile updates
- the creator confirms or rejects them

This becomes the foundational evolution loop for the product.

## Phase 1 Scope

Phase 1 will focus on:

1. IP extraction
2. creator profile management
3. direction recommendation
4. topic organization
5. topic recommendation
6. profile evolution suggestions

Phase 1 will not focus on:

- full multi-platform distribution
- full growth analytics
- collaborative team workflows
- an open skill marketplace
- automatic profile rewriting
- a full creation assistant suite

## User

Primary user in this phase:

- knowledge-oriented creators

Examples:

- business, finance, and technology commentators
- research-led creators
- consultants building personal brands
- niche domain educators
- small creator-led editorial operators

## Product Architecture

The product structure for Phase 1 should be:

- IP Extraction
- Directions
- Topics
- Topic Recommendations
- Profile Evolution

The platform should sit above the current operational workbench.

The existing objects remain valuable:

- `signals`
- `observation clusters`
- `candidates`
- `research cards`
- `drafts`
- `reviews`

But they need a new strategic top layer that gives them creator-specific meaning.

## New Core Objects

### 1. CreatorProfile

The core identity object for a creator.

Suggested fields:

- `positioning`
- `persona`
- `audience`
- `coreThemes`
- `voiceStyle`
- `growthGoal`
- `contentBoundaries`
- `currentStage`

Purpose:

- define who this creator is
- define who this creator serves
- anchor all future direction and topic recommendations

### 2. Direction

A strategic content direction for the next 2 to 4 weeks.

Suggested fields:

- `title`
- `whyNow`
- `fitReason`
- `priority`
- `status`
- `timeHorizon`

Purpose:

- tell the creator where to keep investing attention
- sit one level above individual topics and daily topic ideas

### 3. Topic

The productized version of the current observation-cluster concept.

Suggested fields:

- `title`
- `directionId`
- `summary`
- `status`
- `signalCount`
- `heatScore`

Purpose:

- hold a persistent theme line
- accumulate signals over time
- serve as the bridge between strategic directions and daily topic choices

### 4. ProfileUpdateSuggestion

The explicit representation of creator evolution proposals.

Suggested fields:

- `type`
- `beforeValue`
- `suggestedValue`
- `reason`
- `confidence`
- `status`
- `createdAt`

Purpose:

- let AI observe creator evolution
- let the creator confirm or reject profile changes
- preserve user control over identity

## AI Roles In Phase 1

Phase 1 should not use one generic AI blob. It should expose four distinct assistant roles.

### 1. IP Extraction Assistant

Responsible for:

- extracting creator positioning
- extracting audience and persona
- identifying long-term themes
- proposing voice style and content boundaries

This assistant behaves like a brand strategy extractor.

### 2. Direction Assistant

Responsible for:

- recommending the most important content directions for the next 2 to 4 weeks
- identifying rising or crowded directions
- matching directions to creator profile fit

This assistant behaves like a strategic content advisor.

### 3. Topic Assistant

Responsible for:

- recommending daily and weekly topics
- deciding which topic should be a single post versus a recurring line
- explaining why this topic matters now
- explaining why this creator is suited to discuss it

This assistant behaves like an editorial lead.

### 4. Evolution Assistant

Responsible for:

- detecting shifts in creator focus
- detecting changes in audience fit
- detecting changes in voice or strategic emphasis
- generating profile-update suggestions

This assistant behaves like a personal brand coach.

## Information Architecture

Phase 1 should introduce these top-level views.

### 1. IP Extraction

The onboarding entry point for new users.

Purpose:

- generate the first version of `CreatorProfile`

### 2. Profile-Aware Today

The evolution of the current Today workbench.

Purpose:

- show today’s work through the lens of the creator profile
- prioritize what is most relevant to this specific creator

### 3. Directions

Purpose:

- show what long-term directions deserve current attention

### 4. Topic Desk

Purpose:

- organize the best candidate topics for today and this week
- convert the current candidate pool into a stronger editorial decision layer

### 5. Evolution Suggestions

Purpose:

- surface AI-proposed changes to creator profile and strategic focus
- let users confirm or reject them

## Mapping From Current System

The current system should evolve rather than be replaced.

Suggested mapping:

- `signals` stays as the signal layer
- `observation clusters` becomes `topics`
- `candidates` becomes `topic recommendations`
- `reviews` becomes one of the feedback sources for evolution suggestions
- `research cards` remains as the downstream research asset
- `drafts` remains as the downstream creation asset

This keeps implementation cost lower and preserves continuity with the current workbench.

## Phase 1 MVP

### Must Have

1. AI-guided IP extraction
2. editable creator profile
3. directions page
4. topics mapped to directions
5. topic recommendation workflow
6. profile evolution suggestions requiring user confirmation

### Must Not Do Yet

1. multi-platform auto distribution
2. deep growth analytics
3. complex multi-user collaboration
4. full skill marketplace
5. automatic profile rewriting
6. full-scale writing copilot focus

## Success Criteria

Phase 1 succeeds if the platform begins to feel creator-specific rather than generic.

Suggested validation criteria:

- creators can clearly state their positioning after onboarding
- creators find the direction suggestions credible
- creators feel topic recommendations are more relevant than a normal news dashboard
- creators start thinking in recurring topics instead of isolated posts
- creators accept at least some profile-evolution suggestions as useful

## Risks

### 1. Generic Recommendations

If profile extraction is too shallow, direction and topic recommendations will feel generic.

Mitigation:

- make creator profile explicit and editable
- require downstream recommendations to cite profile fit

### 2. Over-Automation Of Identity

If profile evolution becomes too automatic, creators will lose trust.

Mitigation:

- use explicit suggestions only
- require creator confirmation before updating core profile fields

### 3. Rebuilding Too Much At Once

If Phase 1 tries to include full creation and distribution automation, the platform will lose focus.

Mitigation:

- keep Phase 1 centered on identity, direction, and topic selection

## Recommended Next Step

Move from design into implementation planning for:

- new data models
- page upgrades
- UI renaming from observation-cluster language to topic language
- onboarding and evolution suggestion flows

