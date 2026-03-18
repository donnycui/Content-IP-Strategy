# Creator OS Core Platform Architecture Design

## Goal

Define the long-term architecture for the creator operating system so the current web application can evolve into a multi-entry platform without rewriting the product core.

This design establishes:

- what counts as the system core
- what counts as a channel or entry layer
- how Web, mini program, and OpenClaw should relate to the same underlying platform

## Core Decision

The product should be designed as:

- one core platform
- one primary entry
- multiple secondary entry layers

The primary entry is:

- `Web`

The first secondary entry planned for practical rollout is:

- `Mini Program`

The strategic secondary entry reserved for future agentic expansion is:

- `OpenClaw`

This means the system should not be modeled as:

- a web app with some later integrations bolted on

It should instead be modeled as:

- a core platform whose first client happens to be the web application

## Architecture Principle

Do not plan every future channel in full detail before building the platform core.

Do define the platform core now so future channels do not force a rewrite.

The working rule is:

- channel planning can be staged
- core-platform boundaries must be explicit from now on

## System Layers

### 1. Core Data Layer

This layer represents the product's durable state and long-term operating memory.

Core objects include:

- `CreatorProfile`
- `Direction`
- `Topic`
- `TopicCandidate`
- `ProfileUpdateSuggestion`
- `Signal`
- `HumanReview`
- `ResearchCard`
- `ContentDraft`

These objects must remain channel-agnostic.

No entry surface should define its own private version of these concepts.

### 2. Core Service Layer

This layer contains business capabilities.

Examples:

- `extractCreatorProfile`
- `generateDirections`
- `generateTopics`
- `generateTopicCandidates`
- `generateProfileUpdateSuggestions`
- `createResearchCard`
- `generateDrafts`
- later:
  - `distributeContent`
  - `runPerformanceReview`
  - `applyWritingStyleSkill`

The service layer should be reusable across:

- web pages
- API routes
- mini program backends
- OpenClaw tools/plugins

### 3. Agent / Workflow Layer

This layer is responsible for orchestration rather than raw persistence.

It should eventually contain:

- a `main creator-os agent`
- `IP extraction sub-agent`
- `direction and topic sub-agent`
- `creation sub-agent`
- `distribution sub-agent`
- `review / evolution sub-agent`

Responsibilities:

- route the user into the right workflow
- decide what capability to invoke next
- manage multi-step state transitions
- keep the system feeling like one operating environment instead of unrelated tools

### 4. Channel Layer

This layer contains interaction surfaces only.

Phase 1 and Phase 2 target channels:

- `Web`
- `Mini Program`
- `OpenClaw`

Other channels may be added later:

- `Official Account`
- `Enterprise WeChat`

The channel layer should never become the source of truth for creator state or business logic.

## Channel Roles

### Web

Role:

- primary operating workspace

Best suited for:

- full IP extraction
- creator profile editing
- directions
- topics
- topic recommendations
- evolution suggestions
- research cards
- drafts
- calibration
- source management

### Mini Program

Role:

- lightweight action entry

Best suited for Phase 1 / early Phase 2:

- quick view of today’s directions
- quick view of topic recommendations
- approve or reject evolution suggestions
- capture quick notes or idea fragments
- start a lightweight IP extraction mode
- react to reminders

Not ideal in early phases for:

- heavy signal-table workflows
- large-form editing
- dense research-card editing
- source administration

### OpenClaw

Role:

- agentic enhancement layer

Best suited for:

- deep IP extraction interviews
- recurring review prompts
- sub-agent invocation
- skill invocation
- long-form strategic conversation

OpenClaw should be treated as an advanced interface into the same platform core, not as a replacement for the web application.

## Current-Codebase Evolution Path

The current codebase should not be rebuilt from scratch.

It should evolve in place using these rules:

### Rule 1: Web pages are clients, not the system core

Pages should become thinner over time.

They should:

- render data
- submit actions
- call platform services

They should not grow into the permanent home of core business rules.

### Rule 2: New business logic should prefer service-layer placement

The current project already has good starting points:

- `profile-extraction`
- `direction-generation`
- `topic-generation`
- `topic-candidate-generation`
- `profile-update-suggestion-generation`

Future logic should continue in that direction.

### Rule 3: Add a clearer platform package structure over time

A practical target structure is:

- `app/`
- `lib/domain/`
- `lib/services/`
- `lib/agents/`
- `lib/channels/`
- `prisma/`

This does not require an immediate refactor.

It should become the direction for new code and later cleanup.

### Rule 4: API surfaces should be treated as reusable platform interfaces

The current route layer should gradually become a stable platform boundary.

That means:

- structured request and response contracts
- explicit capability-oriented endpoints
- channel-safe semantics

The current APIs already form the beginning of this layer.

## Agent Positioning

The platform itself should be treated as the main operating agent.

It should not be modeled as a collection of unrelated screens.

The recommended conceptual model is:

- `Main Agent`
  - owns the creator journey
  - decides what stage the user is in
  - routes into the right workbench or sub-agent

- `Sub-agents`
  - temporary, task-specific, workflow-specific
  - invoked when the user enters a deep mode

Examples:

- `IP positioning sub-agent`
- `topic strategy sub-agent`
- `writing-style sub-agent`
- `distribution sub-agent`
- `review and evolution sub-agent`

This makes the platform compatible with future OpenClaw integration while preserving the existing web workbench.

## Compute and Cost Implication

This architecture does not require high compute usage by default.

The correct model is:

- lightweight coordination most of the time
- deep reasoning only at high-value checkpoints

High-cost calls should be reserved for:

- deep IP interviews
- strategic reports
- high-quality topic diagnosis
- writing-style transformation
- profile evolution suggestions

Low-cost or rule-based processing can cover:

- tagging
- simple sorting
- queue presentation
- recommendation-state updates
- lightweight channel formatting

Therefore:

- a multi-agent architecture is compatible with controlled cost
- the main requirement is clean orchestration, not brute-force model usage

## Phase Recommendation

Recommended rollout order:

1. keep strengthening the platform core inside the current web app
2. treat web as the default full workspace
3. add mini-program entry for lightweight daily actions
4. reserve OpenClaw integration for agentic enhancement after core services are stable

This means:

- Phase 1: `Web-first platform core`
- Phase 2: `Mini Program lightweight companion`
- Phase 3: `OpenClaw agentic interface`

## Success Criteria

The architecture is succeeding when:

- the web app can continue evolving without being treated as the only runtime
- a mini program can call core capabilities without duplicating business logic
- OpenClaw can invoke platform capabilities as tools or sub-agents later
- creator state remains consistent regardless of entry channel
- future channel work becomes an adapter project, not a product rewrite
