# Knowledge Creator AI OS Phase 1 Implementation Plan

## Objective

Implement Phase 1 of the knowledge creator AI operating system on top of the current content research workbench.

Phase 1 should deliver:

- AI-assisted IP extraction
- creator profile management
- direction recommendation
- topic organization
- topic recommendation
- profile evolution suggestions

The implementation should preserve the current working backbone:

- signals
- review workflow
- candidate workflow
- research cards
- drafts

## Delivery Strategy

Use the current workbench as the execution layer and add a new strategy layer above it.

Do not rebuild the existing system from scratch.

Implementation sequence:

1. add new data models
2. add onboarding and creator profile
3. add directions
4. upgrade observation clusters into product-facing topics
5. upgrade candidate workflow into topic recommendations
6. add profile evolution suggestions
7. wire Today into a profile-aware dashboard

## Milestone Plan

### Milestone 1: Creator Profile Foundation

Goal:

- give the platform a first-class creator identity model

Scope:

- add `CreatorProfile` data model
- add one default active profile assumption for the current single-user system
- create a first-pass `IP Extraction` page
- create a `Creator Profile` review/edit page
- store the initial extracted identity as structured data

Expected outcome:

- the system can answer who the creator is before recommending directions or topics

### Milestone 2: Directions Layer

Goal:

- move from isolated signals to strategic guidance

Scope:

- add `Direction` data model
- generate directions from creator profile plus topic accumulation
- build a `Directions` page
- surface direction title, why-now reasoning, fit reasoning, priority, and status

Expected outcome:

- the system can recommend what the creator should emphasize over the next 2 to 4 weeks

### Milestone 3: Topics Layer

Goal:

- productize the current observation-cluster system

Scope:

- add `Topic` data model
- map current observation-cluster output into topics
- attach topics to directions
- rename operator-facing language from observation cluster to topic
- create a `Topic Desk` page or evolve the current candidate page into it

Expected outcome:

- creators can work with durable topic lines instead of raw clusters

### Milestone 4: Topic Recommendation Workflow

Goal:

- upgrade candidate selection into recommendation and decision workflow

Scope:

- add `TopicCandidate` model or adapt the candidate state into a topic-recommendation object
- generate daily and weekly topic recommendations
- show recommendation reasons:
  - why now
  - why this fits the creator
  - whether it should be a single post or recurring series
- preserve keep / defer / ignore feedback loop

Expected outcome:

- creators get actionable topic recommendations rather than only a filtered signal list

### Milestone 5: Profile Evolution Suggestions

Goal:

- let the system evolve with the creator without silently rewriting identity

Scope:

- add `ProfileUpdateSuggestion` model
- generate suggestions from:
  - topic choices
  - review patterns
  - content output patterns
  - direction shifts
- add an `Evolution Suggestions` page
- support confirm / reject workflow

Expected outcome:

- the system begins learning the creator over time while preserving creator control

### Milestone 6: Profile-Aware Today

Goal:

- convert the current Today workbench into the operating hub for Phase 1

Scope:

- make Today profile-aware
- show:
  - current active creator profile
  - top directions
  - priority topics
  - best topic recommendations
  - pending profile evolution suggestions

Expected outcome:

- Today becomes the main workspace for the creator OS instead of a generic content dashboard

## Data Model Changes

### New Models

#### CreatorProfile

Suggested first schema:

- `id`
- `name`
- `positioning`
- `persona`
- `audience`
- `coreThemes`
- `voiceStyle`
- `growthGoal`
- `contentBoundaries`
- `currentStage`
- `isActive`
- `createdAt`
- `updatedAt`

#### Direction

- `id`
- `creatorProfileId`
- `title`
- `whyNow`
- `fitReason`
- `priority`
- `status`
- `timeHorizon`
- `createdAt`
- `updatedAt`

#### Topic

- `id`
- `creatorProfileId`
- `directionId`
- `title`
- `summary`
- `status`
- `heatScore`
- `signalCount`
- `primaryObservationCluster`
- `secondaryObservationCluster`
- `createdAt`
- `updatedAt`

#### TopicCandidate

If implemented explicitly rather than inferred:

- `id`
- `topicId`
- `anchorSignalId`
- `title`
- `whyNow`
- `fitReason`
- `formatRecommendation`
- `priority`
- `status`
- `createdAt`
- `updatedAt`

#### ProfileUpdateSuggestion

- `id`
- `creatorProfileId`
- `type`
- `beforeValue`
- `suggestedValue`
- `reason`
- `confidence`
- `status`
- `createdAt`
- `updatedAt`

### Existing Models To Extend

#### SignalScore

Likely keep:

- primary/secondary observation cluster for the lower-level signal intelligence layer

No need to remove these in Phase 1.

#### ResearchCard

Later link to:

- `topicId`
- optionally `directionId`

#### ContentDraft

Later link to:

- creator profile
- topic
- format recommendation

Not required in the first migration wave.

## Page Changes

### New Pages

- `/profile/extract`
- `/profile`
- `/directions`
- `/topics`
- `/evolution`

### Existing Pages To Upgrade

- `/`
  - evolve into profile-aware Today

- `/candidates`
  - evolve into topic-recommendation workspace or redirect into `/topics`

- `/signals`
  - remain as operational intake layer

- `/reviews`
  - remain as scoring calibration input

- `/research/[id]`
  - later attach topic context

- `/drafts/[id]`
  - later attach creator profile and topic context

## AI Workflow Changes

### IP Extraction Flow

Input:

- onboarding prompts
- optional existing writing samples
- optional external links

Output:

- first-pass creator profile draft

Human action:

- creator confirms or edits profile

### Direction Recommendation Flow

Input:

- creator profile
- accumulated topics
- recent signals

Output:

- top strategic directions

### Topic Recommendation Flow

Input:

- directions
- topics
- signals
- historical creator decisions

Output:

- daily and weekly topic recommendations

### Evolution Suggestion Flow

Input:

- review behavior
- topic decisions
- content outputs
- performance patterns when available later

Output:

- creator profile update suggestions

Human action:

- confirm or reject

## Migration Order

### Migration Wave 1

- add `CreatorProfile`
- add `Direction`
- add `Topic`
- add `ProfileUpdateSuggestion`

Do not rewrite current signal tables in this wave.

### Migration Wave 2

- backfill topics from current observation-cluster logic
- attach directions to topics

### Migration Wave 3

- attach recommendations and evolution records

## API Plan

### New API Surface

- `POST /api/profile/extract`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/directions`
- `POST /api/directions/generate`
- `GET /api/topics`
- `POST /api/topics/recommend`
- `GET /api/evolution`
- `POST /api/evolution/:id/accept`
- `POST /api/evolution/:id/reject`

### Existing API Surface To Keep

- `/api/signals`
- `/api/reviews`
- `/api/research-cards`
- `/api/drafts`

## Naming Transition Plan

Current internal language:

- observation cluster
- candidate

Phase 1 product language:

- topic
- topic recommendation

Implementation rule:

- internal enum/storage can remain stable initially
- user-facing labels should transition first
- deeper data-model refactor can follow after the first product layer is stable

## Validation Plan

Phase 1 should be validated in this order:

1. creator can complete IP extraction
2. creator can edit profile
3. directions feel specific rather than generic
4. topics feel stable and reusable
5. topic recommendations are actionable
6. profile evolution suggestions feel useful rather than intrusive

## Risks And Mitigations

### Risk: Too Much At Once

Mitigation:

- preserve current backbone
- add only the strategic top layer first

### Risk: Generic AI Profile Extraction

Mitigation:

- always allow explicit manual confirmation and editing
- keep generated reasoning visible

### Risk: Topic Layer Becomes A Renamed Cluster Layer Only

Mitigation:

- require every topic to connect to a direction and a creator profile

### Risk: Evolution Suggestions Feel Creepy Or Wrong

Mitigation:

- suggestions only
- no silent profile rewrite
- clear reason and confidence for every suggestion

## Recommended Execution Sequence

Recommended build order:

1. schema additions for creator profile, direction, topic, profile update suggestion
2. profile extraction page and creator profile page
3. direction generation service and directions page
4. topic mapping layer and topic desk page
5. topic recommendation logic
6. profile evolution suggestion logic
7. profile-aware Today refactor

## Definition Of Done For Phase 1

Phase 1 is done when:

- a new creator can generate and confirm a usable creator profile
- the system can show active directions for that profile
- the system can organize topics under those directions
- the system can recommend daily and weekly topics
- the system can propose profile changes for confirmation
- the current workbench still functions as downstream execution infrastructure

