# Content IP Strategy Design

Date: 2026-03-13
Status: Draft, actively maintained
Owner: cuijunpeng

## Purpose

This document records the current design for a personal content/IP business focused on turning high-density macro judgments into income. It is the working handoff and update record for future iterations.

## Current Goal

Build a personal brand that:

- operates in the intersection of business, finance, and technology
- serves high-cognition content consumers
- publishes high-frequency short judgments
- helps the audience gain action direction, not just understanding
- monetizes through content/IP rather than through generic traffic

## Positioning

### Core Identity

The intended identity is a macro-narrative opinion IP.

This brand does not mainly explain news. It explains the cycle shifts, structural changes, and interest redistribution behind the news, then turns those changes into positioning advice for individuals.

### Working One-Liner

"I do not interpret information. I judge where individuals should stand when the era shifts."

Alternative phrasing:

"I focus less on the news itself and more on the cycle change behind it, and what position individuals should take."

## Target Audience

Primary audience:

- high-cognition content consumers

Audience traits:

- already overloaded with information
- not lacking facts, but lacking compression, frameworks, and directional judgment
- willing to follow a thinker who can connect technology, business, and capital into one narrative

## Strategic Choice Summary

### Content Form

Chosen main form:

- high-frequency short judgments

Not chosen as the main form:

- long-form deep analysis as the default output

Reason:

Short judgments build stronger daily mindshare and are more compatible with multiplatform distribution. Long-form pieces can still exist later as periodic deepening assets.

### Audience Outcome

Chosen outcome:

- give the audience action direction

This means the content must end with some form of positioning advice, not just explanation.

### Style

Chosen style:

- place single events inside long cycles and large trends
- maintain clear, sharp, differentiated viewpoints
- avoid generic news interpretation

## Platform Strategy

Primary writing platform:

- WeChat Official Account

Primary short video platform:

- WeChat Channels

Distribution logic:

- one core judgment becomes the source asset
- the source asset is translated into article, short video, and short social post variants
- the system should avoid separate creation for each platform

## Core Editorial Thesis

The long-term thesis is:

- technology changes power structures
- capital flows reveal hidden era choices
- business models get re-rated in each new cycle
- individuals need to reposition themselves as systems shift

The goal is to make the audience feel:

- clearer about what matters
- more certain about what to watch next
- more oriented toward action

## Mother Themes

The brand should revolve around four long-term mother themes.

### 1. How technological revolutions rewrite power structures

Focus:

- how technology changes the balance among platforms, firms, states, and capital

### 2. How capital flows reveal era choices

Focus:

- capex, valuations, policy support, industrial investment, and resource allocation as signals of real conviction

### 3. How business models are re-evaluated in a new cycle

Focus:

- which models are dying, which are quietly compounding, and which are being structurally repriced

### 4. How individuals and organizations should reposition

Focus:

- what founders, operators, professionals, and high-cognition individuals should do with their time, attention, capabilities, and assets

## Content Unit Design

The smallest content unit is not an article or a video. It is a judgment card.

Each judgment card answers:

1. What happened
2. Why this is not an isolated event
3. Which larger trend it belongs to
4. Whose interests it reshapes
5. Where a high-cognition individual should stand

## Core Content Template

Each short judgment should ideally follow this structure:

1. What this event looks like on the surface
2. What the real underlying change is
3. Which bigger cycle this belongs to
4. Who benefits and who loses
5. What position a high-cognition individual should take now

This fifth line is the differentiator. It transforms explanation into directional value.

## Columns

### 1. Today’s Positioning

Purpose:

- daily or near-daily reaction to a meaningful event

Output:

- short article
- short video
- short social post

### 2. Cycle Slice

Purpose:

- take one event and explain the larger era shift behind it

### 3. Winners and Losers

Purpose:

- identify who gains strength and who loses leverage from a given change

### 4. Where to Stand Next

Purpose:

- turn macro judgment into practical positioning advice for individuals

## Daily Operating SOP

### Step 1. Signal Scan

Time window:

- morning

Collect only signals from:

- technology
- business
- finance/capital markets

Filtering criteria:

- indicates structural change
- involves redistribution of interests or power
- maps to one of the mother themes

### Step 2. Build Research Card

Time window:

- late morning

For the best one event, build a research card with:

- event summary
- mainstream interpretation
- ignored variable
- historical mirror
- 3-month projection
- 1-year projection

### Step 3. Write Judgment Atom

Time window:

- afternoon

Compress the research card into one judgment atom using the core content template.

### Step 4. Translate for Distribution

Time window:

- late afternoon

Variants:

- WeChat Official Account short commentary
- WeChat Channels script
- short social version

### Step 5. Review

Time window:

- evening

Primary metrics:

- saves
- forwards
- high-quality comments
- signs that the audience adopted a new observation frame

Secondary metrics:

- views and surface reach

## Reference Role of Open-Source Projects

The following open-source projects are references, not current hard dependencies.

### DeepSearchAgent-Demo

Reference value:

- deep multi-round search
- reflective research flow
- report generation logic

Use in this strategy:

- as a model for a research assistant layer

Repository:

- https://github.com/666ghj/DeepSearchAgent-Demo

### BettaFish

Reference value:

- multi-source signal collection
- sentiment/opinion aggregation
- multi-agent analysis and reporting

Use in this strategy:

- as a model for a signal radar layer

Repository:

- https://github.com/666ghj/BettaFish

### MiroFish

Reference value:

- simulation and future scenario reasoning
- turning seeds of reality into projected outcomes

Use in this strategy:

- as a model for a lightweight trend projection layer

Repository:

- https://github.com/666ghj/MiroFish

### Current Decision

At the current stage:

- do not depend on these repositories as production-critical systems
- borrow their methods and capability patterns
- first validate manual and lightweight workflows
- automate only after a stable content rhythm is proven

## Strategic Principle on Tooling

Recommended path:

1. manually run the workflow for 14 days
2. identify the most repetitive step
3. automate signal collection and research organization first
4. only later evaluate whether to absorb capabilities from the open-source projects into a custom research stack

The core asset must remain:

- topic selection authority
- final judgment authority
- publication authority

## Product Direction for v0

Current product decision:

- build a lightweight web-accessible backend
- optimize for a single primary operator
- support the daily production of one strong judgment

This is not intended to start as a multi-user SaaS product.

### Main Flow

The v0 product should support:

1. broad signal intake from many websites and feeds
2. filtering and scoring
3. candidate topic selection
4. research card drafting
5. content draft translation for article and video

### Source Strategy

The intake layer should be designed by source type rather than by individual site.

Initial source-type buckets:

- mainstream news and business media
- technology news and industry blogs
- finance and market disclosures
- deep analysis and commentary sites
- forum and social-link driven signals
- manually added URLs and RSS feeds

The goal is broad coverage at the input layer, with strict filtering after collection.

### Signal Selection Logic

The current agreed rule is:

- first score signals by importance
- when importance is tied or close, prefer the signal that is more likely to support a differentiated opinion

This means selection should not be driven only by popularity or recency.

### Proposed Scoring Principle

Importance scoring should prioritize signals that:

- indicate structural rather than cosmetic change
- imply redistribution of power, capital, or strategic advantage
- affect a large enough system, sector, or class of actors
- connect clearly to one of the long-term mother themes
- have enough source support to justify serious analysis

Tie-breaking preference should prioritize signals that:

- expose a blind spot in the mainstream narrative
- allow a strong cross-disciplinary angle across technology, business, and finance
- support a clear positioning takeaway for the audience

### Product Goal of the Scoring System

The scoring system should help answer:

- what deserves attention first
- what deserves a judgment now
- what is most likely to produce a distinctive, high-value content output

### Scoring Operation Mode

The current agreed operating mode is:

- AI performs the first-pass importance scoring
- the operator performs a fast correction pass
- the system records corrections as learning feedback
- over time, more of the scoring can be automated if the results become reliable

This creates a staged path from assisted judgment to partial automation, without giving up editorial control too early.

### Learning Loop

The scoring system should capture at least the following feedback:

- original AI score
- human-adjusted score
- reason for adjustment when available
- whether the signal was finally selected
- whether the resulting content performed well

This feedback should later support:

- score calibration
- better tie-breaking
- source quality ranking
- improved prediction of which signals produce distinctive content

## v0 Interface Direction

The current homepage decision is:

- show the signal list first
- let AI complete a first-pass filter before display
- keep the operator in control of the final selection

This means the primary workflow starts from reviewing incoming signals rather than jumping directly into an AI-only candidate board.

### Homepage Priority

The homepage should emphasize:

- a ranked or grouped signal list
- AI scoring and AI reasoning visible at the list level
- fast human actions for accept, reject, defer, and adjust
- clear comparison between AI preference and human choice

### Human-AI Review Logic

The agreed interaction logic is:

- AI performs the initial filter and gives reasons
- the operator manually reviews the list
- if the operator makes a different decision, the operator judges whether the AI reasoning was acceptable
- that review becomes learning data for the system

This is important because the system should not learn only from accept/reject outcomes. It should also learn whether the reasoning quality was persuasive or flawed.

### Recommended List-Level Fields

Each signal row should eventually expose:

- title
- source
- publish time
- source-type bucket
- cluster/topic label
- AI importance score
- AI viewpoint-potential score
- AI reasoning summary
- human action status
- human adjusted score if changed
- reasoning accepted or rejected

### Fast Human Actions

The review workflow should support quick actions such as:

- keep for candidate pool
- reject as noise
- mark for later
- raise score
- lower score
- accept AI reasoning
- reject AI reasoning

### Product Goal of This Interaction Model

The UI should help the operator do three things quickly:

- scan many signals without losing context
- compare personal editorial intuition against AI reasoning
- continuously teach the system what "worth attention" means in this specific content brand

### List Presentation Model

The current agreed presentation model is:

- use a compact information-stream list for fast scanning
- allow deeper analysis to appear on hover or click
- keep the main surface optimized for speed rather than reading long cards

This fits the actual operator need: scan many signals quickly, then expand only the ones worth attention.

### Interaction Pattern

Recommended interaction pattern:

- each signal appears as a dense single-row or compact multi-line list item
- hovering can reveal a lightweight analysis preview when suitable
- clicking opens the fuller signal detail and AI reasoning view

The compact layer should support rapid editorial triage.

The expanded layer should support reasoning review and score correction.

### UI Principle

The default interface should feel closer to a high-signal terminal, feed reader, or market monitor than to a content-heavy dashboard.

The main design priority is:

- maximum scan efficiency

Not the main priority:

- showing all AI analysis inline by default

## Signal List Field Design

The current decision is to keep a broad field pool and let real usage determine what stays visible by default.

This means the product should support enough metadata for strong editorial judgment, while still preserving a fast-scanning default view.

### Full Candidate Field Pool

The current candidate field pool includes:

- title
- source
- original publish time
- ingestion time
- source-type bucket
- topic tags
- mother-theme mapping
- cluster ID
- cluster heat
- AI importance score
- AI viewpoint-potential score
- AI confidence
- AI reasoning summary
- structural-change score
- impact-scope score
- power-or-interest-redistribution score
- durability score
- human review status
- human-adjusted score
- AI-reasoning acceptance status

### Recommended Display Layers

The fields should be organized across three layers.

#### Homepage Default View

Recommended default fields:

- title
- source
- original publish time
- topic tags
- AI importance score
- AI viewpoint-potential score
- AI reasoning summary
- human review status

These fields should support fast scanning and quick editorial triage.

#### Hover Preview

Recommended hover-level fields:

- mother-theme mapping
- cluster heat
- AI confidence
- structural-change score
- impact-scope score
- power-or-interest-redistribution score
- durability score
- human-adjusted score when available
- AI-reasoning acceptance status when available

These fields should give more context without forcing a page transition.

#### Detail View

The detail view can include the full field set plus future additions such as:

- grouped related signals in the same cluster
- source excerpts
- expanded AI reasoning
- research-card draft
- past similar items
- final editorial decision trail

### Field-Pruning Principle

The agreed approach is:

- keep the candidate field pool broad at first
- observe which fields actually improve judgment speed and judgment quality
- reduce surface complexity later based on real operator behavior

This is preferable to prematurely shrinking the schema before usage data exists.

## Monetization Path

Recommended monetization sequence:

1. free public content
2. light paid products such as weekly reports, special-topic briefs, and annual trend handbooks
3. high-ticket offerings such as private communities, consulting, internal sharing, and custom trend briefings

The first business milestone is not maximum revenue.

The first milestone is that the market starts to believe:

- this brand helps me decide where to stand in a changing era

## Product Scope for v0

The v0 product should remain intentionally narrow.

Its role is:

- content research assistant

Its role is not:

- full content operations platform
- team collaboration system
- autonomous publishing engine

### Must-Have Capabilities

The current agreed v0 scope includes:

1. multi-source signal intake
2. deduplication and clustering
3. AI first-pass scoring and reasoning
4. human rapid review and correction
5. candidate pool management
6. research-card generation
7. draft translation for article, video, and short post

### Explicitly Out of Scope for v0

The following are intentionally excluded from the first version:

- complex permission systems
- multi-user collaboration
- automatic publishing to content platforms
- dashboard-heavy visualization
- advanced model-training platform features
- heavy simulation engines
- full-scale warehouse or BI infrastructure

### v0 Success Criteria

The first version succeeds if it helps the operator:

- consistently surface 3 to 10 high-value daily candidates
- choose the daily topic faster
- reduce thinking and organization cost through research cards
- generate usable first drafts for article and video formats
- build a product that is worth opening every day

## Current Conclusions Reached

The following points have been agreed in discussion:

- the project focuses on content/IP as a path to individual income
- the content domain is the intersection of business, finance, and technology
- the audience is high-cognition content consumers
- the primary form is high-frequency short judgments
- the intended value is directional guidance, not only interpretation
- the open-source repositories are methodological references rather than immediate dependencies

## Open Items

The following areas are not yet fully designed and should be added as discussion continues:

- title system and branding language
- concrete article format for the Official Account
- concrete script structure for WeChat Channels
- topic sourcing workflow and source list
- content calendar design
- 14-day trial publishing plan
- productization of paid offers
- audience funnel and conversion path

## Update Policy

This document should be updated as the project advances.

Recommended update triggers:

- a positioning decision changes
- a new editorial rule is adopted
- a new workflow is fixed
- a monetization path is selected
- a new tool dependency or system architecture is approved

## Multi-Model Development Workflow Decision

The current decision is:

- do not make multi-model orchestration a hard dependency for v0 development

This applies to workflows such as using Claude Code, Gemini, and Codex together through an orchestration layer.

### Current Recommendation

For this project stage:

- use a simple primary development flow
- keep Codex sufficient for core implementation
- optionally use Gemini for focused frontend review or UI second opinions
- avoid adding workflow complexity before product complexity justifies it

### View on `ccg-workflow`

The referenced workflow is useful as a possible future collaboration layer, especially if long-term multi-model parallel development becomes valuable.

However, for the current stage:

- it is better treated as an optional enhancement
- it should not block design, prototyping, or v0 implementation

### Reasoning

The current project bottleneck is not multi-agent coding coordination.

The real bottlenecks are:

- product boundary clarity
- signal and scoring logic
- fast operator workflow design
- reliable data and task flow

Adding orchestration too early would likely increase process weight faster than it increases product output.

## OpenClaw Compatibility Strategy

The current decision is:

- the v0 product should not depend on OpenClaw to function
- the architecture should still preserve a future path for OpenClaw integration

This means the first version should be able to run as a standalone web product, while keeping extension boundaries clean enough for later adaptation.

### Recommended Approach

Recommended delivery sequence:

1. build the MVP as an independent lightweight web backend
2. keep ingestion, scoring, research-card generation, and draft generation behind clear service boundaries
3. later add an OpenClaw-facing integration layer if it proves useful

### Why This Order

The main objective of v0 is to validate:

- editorial workflow
- scoring logic
- operator behavior
- daily usefulness

OpenClaw integration is strategically useful, but it is not required to validate these first-order product assumptions.

### Future Integration Paths

Based on current public OpenClaw documentation, the most plausible future integration paths are:

- skill-based integration for invoking focused workflows
- plugin-based integration for HTTP routes, tools, background services, and agent capabilities
- optional workflow integration via OpenProse if multi-agent orchestration later becomes useful

### Architecture Constraints to Preserve Now

To keep future OpenClaw integration practical, the MVP should preserve:

- a clear service/API layer instead of hard-coding logic into UI-only flows
- separable background jobs for ingestion, scoring, and generation
- explicit data models for signals, reviews, research cards, and drafts
- provider-agnostic LLM integration
- event and action boundaries that can later be exposed as tools or routes

### Current Recommendation

The recommended position is:

- yes to future OpenClaw compatibility
- no to making OpenClaw a present-day hard dependency

This keeps the MVP fast while preserving a credible path to later agent-based integration.

## Recommended Technical Stack

The v0 stack should optimize for:

- fast implementation
- future extensibility
- good support for asynchronous ingestion and AI workflows

### Recommended Stack

- frontend and app shell: Next.js
- UI system: Tailwind CSS + shadcn/ui
- application backend: Next.js server capabilities for v0
- database: PostgreSQL
- ORM: Prisma
- async jobs: Redis + BullMQ
- ingestion and parsing: RSS parsing + standard HTML extraction first, with browser automation reserved for pages that require rendering
- LLM integration: internal adapter layer so model providers can be swapped later

### Stack Principle

The system should begin as one coherent product application, not as a prematurely split multi-service architecture.

The current preferred baseline is:

- Next.js
- PostgreSQL
- Prisma
- Redis/BullMQ
- LLM adapter layer

## Core Data Model for v0

The initial product should revolve around the following core objects:

- Source
- Signal
- SignalCluster
- SignalScore
- HumanReview
- ResearchCard
- ContentDraft

### Suggested Tables

Recommended initial tables:

1. `sources`
2. `signals`
3. `signal_tags`
4. `signal_clusters`
5. `signal_cluster_items`
6. `signal_scores`
7. `human_reviews`
8. `research_cards`
9. `content_drafts`
10. `content_feedback` as a later-stage extension

### Table Intent

The tables should support:

- broad ingestion
- deduplication and event clustering
- AI scoring and reasoning
- human correction and learning feedback
- research asset creation
- multi-format draft generation
- later performance feedback loops

## Page and Route Information Architecture

The current recommended route map is:

- `/signals`
- `/signals/[id]`
- `/candidates`
- `/research/[id]`
- `/drafts/[id]`
- `/sources`

### Route Roles

#### `/signals`

Primary signal feed for scanning, filtering, ranking, and fast review.

#### `/signals/[id]`

Detailed signal view for reasoning review, score correction, and topic advancement.

#### `/candidates`

Candidate pool for deciding what should become today’s focus.

#### `/research/[id]`

Research-card workspace for turning a candidate topic into a structured judgment asset.

#### `/drafts/[id]`

Draft workspace for translating research into article, video, and short-post formats.

#### `/sources`

Source management interface for intake configuration and source quality control.

## MVP Delivery Plan

The MVP should be delivered in narrow, usable slices.

### Delivery Order

1. signal feed foundation
2. source intake foundation
3. AI scoring and reasoning
4. candidate pool
5. research-card workspace
6. draft generation workspace

### Phase 1: Signal Feed Foundation

Deliver:

- source records
- signal ingestion pipeline
- signal storage
- `/signals` list view
- `/signals/[id]` detail view
- manual status updates such as candidate, ignore, and defer

Primary success condition:

- the operator can open the product daily and review incoming signals

### Phase 2: AI First-Pass Review

Deliver:

- AI importance score
- AI viewpoint-potential score
- AI reasoning summary
- mother-theme mapping
- reasoning review actions
- human score adjustment

Primary success condition:

- the operator can compare personal judgment against AI reasoning at review time

### Phase 3: Candidate Pool and Research Cards

Deliver:

- candidate pool page
- signal clustering
- candidate-to-research-card transition
- structured research-card generation and editing

Primary success condition:

- the operator can turn one selected signal cluster into a structured judgment asset

### Phase 4: Draft Translation

Deliver:

- article draft generation
- video script generation
- short-post generation
- draft editing and saving

Primary success condition:

- the operator can convert a research card into usable first drafts for publishing

## Development Task Checklist

The following working checklist should guide implementation.

### Foundation

- initialize web app shell
- configure database and ORM
- configure Redis and job queue
- create base environment and provider adapter scaffolding

### Source and Signal Intake

- create source CRUD
- implement RSS ingestion
- implement manual URL ingestion
- implement basic HTML extraction
- normalize and store signals

### Signal Review Workflow

- build signal list page
- build signal detail page
- implement filter and sorting controls
- implement human review actions

### AI Review Workflow

- implement scoring job
- implement reasoning summary generation
- persist score records
- persist human feedback on scoring and reasoning

### Candidate and Research Workflow

- build candidate pool page
- implement candidate transitions
- build research-card schema and UI
- implement research-card generation

### Draft Workflow

- build draft page
- implement article draft generation
- implement video draft generation
- implement short-post generation

### Operational Support

- add job status visibility
- add logging and failure tracing
- add basic source quality tracking

## Schema Draft

This section records an implementation-oriented schema sketch for v0.

### `sources`

Suggested fields:

- `id`
- `name`
- `type`
- `base_url`
- `feed_url`
- `is_active`
- `quality_score`
- `created_at`
- `updated_at`

### `signals`

Suggested fields:

- `id`
- `source_id`
- `title`
- `url`
- `author`
- `language`
- `published_at`
- `ingested_at`
- `raw_content`
- `summary`
- `status`
- `created_at`
- `updated_at`

### `signal_tags`

Suggested fields:

- `id`
- `signal_id`
- `tag`
- `tag_type`

### `signal_clusters`

Suggested fields:

- `id`
- `cluster_title`
- `cluster_summary`
- `heat_score`
- `status`
- `created_at`
- `updated_at`

### `signal_cluster_items`

Suggested fields:

- `id`
- `cluster_id`
- `signal_id`
- `similarity_score`

### `signal_scores`

Suggested fields:

- `id`
- `signal_id`
- `cluster_id`
- `importance_score`
- `viewpoint_score`
- `structural_score`
- `impact_score`
- `redistribution_score`
- `durability_score`
- `confidence_score`
- `reasoning_summary`
- `reasoning_detail`
- `model_name`
- `created_at`

### `human_reviews`

Suggested fields:

- `id`
- `signal_id`
- `cluster_id`
- `review_status`
- `adjusted_importance_score`
- `adjusted_viewpoint_score`
- `reasoning_acceptance`
- `review_note`
- `my_angle`
- `created_at`
- `updated_at`

### `research_cards`

Suggested fields:

- `id`
- `cluster_id`
- `title`
- `event_definition`
- `mainstream_narrative`
- `ignored_variables`
- `historical_analogy`
- `three_month_projection`
- `one_year_projection`
- `winners_losers`
- `positioning_judgment`
- `status`
- `created_at`
- `updated_at`

### `content_drafts`

Suggested fields:

- `id`
- `research_card_id`
- `platform`
- `title`
- `content`
- `tone_version`
- `status`
- `created_at`
- `updated_at`

## Homepage Wireframe Notes

The homepage should function as a compact high-signal review terminal.

### Layout

Recommended layout:

- top filter and control bar
- central compact signal list
- optional right-side or floating preview behavior for hover details

### Top Control Bar

Suggested controls:

- date range
- source-type filter
- theme filter
- mother-theme filter
- status filter
- sort mode
- refresh or ingestion trigger

### Signal Row

Each signal row should prioritize:

- title
- source
- publish time
- topic tags
- AI importance score
- AI viewpoint-potential score
- AI reasoning summary
- human review status

### Row Interactions

Suggested interactions:

- hover for quick analysis preview
- click for signal detail page
- fast action buttons for candidate, ignore, defer, and score adjustment

### Visual Principle

The homepage should feel dense, fast, and editorially practical.

It should not resemble a marketing dashboard.

## Prisma Schema Draft

The following Prisma draft is intended to translate the product model into an implementation-ready starting point.

It is intentionally conservative:

- designed for v0 clarity
- optimized for a single primary operator
- keeps room for later OpenClaw integration and workflow expansion

```prisma
enum SourceType {
  RSS
  WEBSITE
  NEWSLETTER
  MANUAL_URL
  SOCIAL_LINK
  DISCLOSURE
  BLOG
}

enum SignalStatus {
  NEW
  REVIEWED
  CANDIDATE
  DEFERRED
  IGNORED
  ARCHIVED
}

enum ReviewStatus {
  PENDING
  KEPT
  REJECTED
  DEFERRED
}

enum ReasoningAcceptance {
  ACCEPTED
  PARTIAL
  REJECTED
}

enum ClusterStatus {
  ACTIVE
  MERGED
  ARCHIVED
}

enum ResearchCardStatus {
  DRAFT
  READY
  ARCHIVED
}

enum DraftPlatform {
  WECHAT_ARTICLE
  WECHAT_VIDEO
  SHORT_POST
}

enum DraftStatus {
  DRAFT
  READY
  PUBLISHED
  ARCHIVED
}

enum TagType {
  TOPIC
  COMPANY
  PERSON
  COUNTRY
  INDUSTRY
  MOTHER_THEME
}

model Source {
  id           String   @id @default(cuid())
  name         String
  type         SourceType
  baseUrl      String?
  feedUrl      String?
  isActive     Boolean  @default(true)
  qualityScore Float?
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  signals      Signal[]
}

model Signal {
  id            String        @id @default(cuid())
  sourceId      String
  title         String
  url           String        @unique
  author        String?
  language      String?
  publishedAt   DateTime?
  ingestedAt    DateTime      @default(now())
  rawContent    String?
  summary       String?
  status        SignalStatus  @default(NEW)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  source        Source        @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  tags          SignalTag[]
  clusterItems  SignalClusterItem[]
  scores        SignalScore[]
  reviews       HumanReview[]
}

model SignalTag {
  id        String   @id @default(cuid())
  signalId  String
  tag       String
  tagType   TagType

  signal    Signal   @relation(fields: [signalId], references: [id], onDelete: Cascade)

  @@index([tag])
  @@index([tagType])
}

model SignalCluster {
  id             String              @id @default(cuid())
  clusterTitle   String
  clusterSummary String?
  heatScore      Float?
  status         ClusterStatus       @default(ACTIVE)
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  items          SignalClusterItem[]
  scores         SignalScore[]
  reviews        HumanReview[]
  researchCards  ResearchCard[]
}

model SignalClusterItem {
  id              String        @id @default(cuid())
  clusterId       String
  signalId        String
  similarityScore Float?

  cluster         SignalCluster @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  signal          Signal        @relation(fields: [signalId], references: [id], onDelete: Cascade)

  @@unique([clusterId, signalId])
}

model SignalScore {
  id                  String        @id @default(cuid())
  signalId            String?
  clusterId           String?
  importanceScore     Float
  viewpointScore      Float
  structuralScore     Float?
  impactScore         Float?
  redistributionScore Float?
  durabilityScore     Float?
  confidenceScore     Float?
  reasoningSummary    String
  reasoningDetail     String?
  modelName           String
  createdAt           DateTime      @default(now())

  signal              Signal?       @relation(fields: [signalId], references: [id], onDelete: Cascade)
  cluster             SignalCluster? @relation(fields: [clusterId], references: [id], onDelete: Cascade)

  @@index([signalId])
  @@index([clusterId])
}

model HumanReview {
  id                     String              @id @default(cuid())
  signalId               String?
  clusterId              String?
  reviewStatus           ReviewStatus        @default(PENDING)
  adjustedImportanceScore Float?
  adjustedViewpointScore Float?
  reasoningAcceptance    ReasoningAcceptance?
  reviewNote             String?
  myAngle                String?
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt

  signal                 Signal?             @relation(fields: [signalId], references: [id], onDelete: Cascade)
  cluster                SignalCluster?      @relation(fields: [clusterId], references: [id], onDelete: Cascade)

  @@index([signalId])
  @@index([clusterId])
}

model ResearchCard {
  id                   String              @id @default(cuid())
  clusterId            String
  title                String
  eventDefinition      String?
  mainstreamNarrative  String?
  ignoredVariables     String?
  historicalAnalogy    String?
  threeMonthProjection String?
  oneYearProjection    String?
  winnersLosers        String?
  positioningJudgment  String?
  status               ResearchCardStatus  @default(DRAFT)
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  cluster              SignalCluster       @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  drafts               ContentDraft[]
}

model ContentDraft {
  id             String        @id @default(cuid())
  researchCardId String
  platform       DraftPlatform
  title          String?
  content        String
  toneVersion    String?
  status         DraftStatus   @default(DRAFT)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  researchCard   ResearchCard  @relation(fields: [researchCardId], references: [id], onDelete: Cascade)
  feedbackItems  ContentFeedback[]
}

model ContentFeedback {
  id             String        @id @default(cuid())
  contentDraftId String
  platform       DraftPlatform
  publishedAt    DateTime?
  views          Int?
  saves          Int?
  shares         Int?
  comments       Int?
  qualityNotes   String?
  createdAt      DateTime      @default(now())

  contentDraft   ContentDraft  @relation(fields: [contentDraftId], references: [id], onDelete: Cascade)
}
```

### Schema Notes

Current design choices in this draft:

- `Signal` stores raw incoming units
- `SignalCluster` groups related signals into event-level objects
- `SignalScore` and `HumanReview` can attach to either a signal or a cluster, allowing early-stage flexibility
- `ResearchCard` starts from the cluster level because content should usually be produced from event groups, not isolated links
- `ContentFeedback` is optional for early MVP delivery, but the table shape is worth preserving now

### Expected Early Simplifications

If implementation speed becomes the priority, the first simplifications should be:

- make scoring cluster-first instead of supporting both signal and cluster scoring
- defer `ContentFeedback`
- keep `SignalTag` as plain strings before introducing more advanced taxonomy logic

## Change Log

### 2026-03-13

- created initial strategy design document based on collaborative discussion
- recorded positioning, audience, editorial framework, workflow, tool references, and monetization direction

### 2026-03-14

- added implementation-oriented Prisma schema draft to the design document
- created `/Users/cuijunpeng/Documents/New project/prisma/schema.prisma`
- scaffolded a minimal Next.js app shell with the primary v0 routes
- added placeholder pages for signals, signal detail, candidates, research card, drafts, and sources
- added a data-access layer with Prisma-first and mock fallback behavior
- added `/api/signals` and `/api/health` route stubs
- added `.env.example` with the initial database connection shape
- added `/api/sources` and `/api/reviews` route stubs
- added source data access and a data-backed sources page
- added review action components to the signals list and signal detail page
- repaired dependency installation by switching to a project-local npm cache
- generated Prisma Client successfully
- verified the Next.js app with a successful production build
- added the initial Prisma migration files
- added `docker-compose.yml` for local PostgreSQL startup
- added POST write paths for `/api/sources` and `/api/signals`
- brought up a local PostgreSQL container successfully
- applied the initial SQL migration directly inside PostgreSQL
- inserted the first real source and signal seed records
- added `prisma/seed.sql` and a `db:seed` script for repeatable local seeding
- added manual source creation and manual signal creation forms in the UI
- made review actions refresh the page after successful submission
- made review actions update `Signal.status` as part of the write path
- restricted the candidate pool to true `CANDIDATE` signals
- added real research-card creation from candidate signals through `/api/research-cards`
- made `/research/[id]` resolve real research-card records instead of using only the demo path
- added research-card editing and save support through `/api/research-cards/[id]`
- added draft generation from a real research card through `/api/drafts`
- made `/drafts/[id]` resolve stored drafts by research-card ID
- added draft editing and save support through `/api/drafts/[id]`
- turned the draft workspace into a real editable three-column asset editor
- added a first RSS ingestion path through `/api/ingest/rss`
- added a manual RSS ingest trigger to the sources page
- added XML parsing and RSS/Atom normalization for active RSS sources
- added a heuristic scoring layer for newly created and RSS-ingested signals
- made signal creation paths automatically attach topic tags, mother-theme mapping, and first-pass score records
- added a manual URL ingestion path through `/api/ingest/url`
- added HTML title/description extraction for direct article ingestion
- added a URL ingest form to the signal feed page
- added bulk review actions through `/api/reviews/bulk`
- added signal-feed selection, queue filters, and batch keep/defer/reject actions
- refactored scoring into a provider-based structure for future LLM scoring
- made the signal feed default to the `NEW` review queue
- added an `llm` scoring provider skeleton with heuristic fallback
- added scoring-related environment variables for provider, model, base URL, and API key
- improved the default `NEW` queue with source filtering, score sorting, and a high-score-only toggle
- verified end-to-end manual URL ingestion against the live local dev server
- confirmed newly ingested signals are persisted in PostgreSQL and exposed through `/api/signals`
- documented a remaining local validation quirk where some localhost POST requests are noisy from the current sandbox, while database-backed verification remains healthy
- verified `ai.qaq.al` is compatible with the current OpenAI-style `responses` scoring path
- switched local scoring configuration to `SIGNAL_SCORING_PROVIDER=llm` with `gpt-5.2`
- fixed response parsing to support providers that return text through `output[].content[].text` instead of only `output_text`
- confirmed a newly ingested signal was scored by the live LLM path with `modelName = gpt-5.2`
- noted that the `anyrouter.top` Claude path will require a separate Anthropic-compatible provider if we want to support it later
- upgraded `SignalScore` to store `consensusStrength`, `companyRoutineScore`, and `priorityRecommendation`
- changed ranking logic to preserve importance while deprioritizing routine company news and high-consensus angles
- updated the signal feed UI to surface the new priority marker and routine/consensus diagnostics
- verified a newly ingested signal persisted the new scoring fields with `priorityRecommendation = DEPRIORITIZE`
- expanded `HumanReview` into a full manual-override mirror layer instead of overwriting AI scores
- added manual override fields for consensus, company-routine score, and priority recommendation
- added an `AI vs Human Review` section plus a structured manual review editor to the signal detail page
- preserved bulk review as a lightweight queue operation while keeping detailed override editing on the detail page
- added a dedicated `/reviews` calibration view for scanning recent AI-vs-human scoring deltas
- surfaced score deltas, priority mismatches, reasoning acceptance, and operator notes as the first learning-oriented feedback surface
- added a first-pass calibration summary layer on `/reviews`
- summarized the model's most common current failure mode across importance, viewpoint, routine-noise detection, consensus detection, and priority false positives
- added automatic failure-reason tagging for AI over-scoring analysis
- introduced first-pass reason buckets including thin signal, routine-news misread, consensus missed, weak spillover, angle inflation, and theme mismatch
- surfaced failure-reason distribution and per-review inferred reason tags on `/reviews`
- added first-pass prompt guidance suggestions derived from review calibration patterns
- focused the initial guidance on when the system should delay assigning `PRIORITIZE`
- tightened the scoring prompt and heuristic priority rules using calibration-derived `delay PRIORITIZE` guidance
- made `PRIORITIZE` explicitly rarer by requiring stronger structural importance, clearer non-consensus angle, lower routine-noise, and lower consensus crowding
- added a minimal `/api/signals/rescore` endpoint to rerun stored signals through the latest scoring logic
- verified a full rescore of the current 7-signal dataset
- confirmed the latest-score distribution tightened to `DEPRIORITIZE: 4`, `WATCH: 3`, `PRIORITIZE: 0`
- added first-pass false-negative detection to the calibration workflow
- started flagging signals that may deserve `WATCH` instead of `DEPRIORITIZE`, and signals that may deserve `PRIORITIZE` instead of `WATCH`
- added a fixed first-pass observation-cluster system with primary and secondary cluster assignment
- stored observation-cluster output as part of `SignalScore`
- started surfacing primary and secondary observation clusters in the signal feed and candidate pool
- updated the candidate pool to group candidates by primary observation cluster
- turned observation clusters from display-only metadata into a first-pass editorial organizing frame
- added a lightweight cluster-level `topic brief` layer to the candidate pool
- made each primary observation cluster answer what is accumulating, why it is worth watching now, and whether it should become a single judgment or a continuing topic
- added cluster-level research entry from the candidate pool
- designed the cluster push flow to pick the strongest signal in a cluster as the anchor while creating a research card framed by the whole observation cluster
- upgraded the research card page to treat cluster context as a first-class section instead of secondary metadata
- started surfacing supporting signals, their reasoning summaries, and their importance scores directly at the top of the research workflow
- added `Signal support context` to the draft workspace
- updated draft generation so article, video, and short-post outputs explicitly absorb supporting signals as the main proof of why the judgment is timely now
- added a first-pass `editorial angle` layer to the draft workspace
- started classifying draft intent into single fast judgment, ongoing tracked theme, or series entry based on supporting-signal density and strength
- converted `/` into a `Today` workbench instead of a redirect
- organized the daily workflow around four modules: intake, review, themes, and output
- completed a first-pass full Chinese localization of the operator-facing UI
- translated navigation, Today workbench, signal feed, candidate pool, sources, reviews, research, drafts, buttons, forms, empty states, and feedback copy
- localized draft-generation templates and fallback/mock copy so browser-facing content no longer drops back to English in normal usage
- re-ran `npm run build` after localization and confirmed the app still builds successfully
- tightened the first-pass UI hierarchy after the initial Chinese localization
- shifted the interface from dense information stacking toward workflow-first grouping
- simplified the top-level layout, added clearer section hierarchy tokens, and reduced visual noise in the Today workbench
- compacted the signal feed table by merging low-value columns into a single context block and a single scoring block
- softened secondary containers to make cards feel grouped instead of equally loud
- re-ran `npm run build` after the layout cleanup and confirmed the app still builds successfully
- fixed an observation-cluster routing bug where the localized cluster label was being passed directly into the Prisma enum filter
- added a reverse mapping layer so APIs can accept either the internal observation-cluster key or the Chinese display label
- added a dedicated display-label layer to translate remaining English-facing source names, mother-theme labels, and topic tags without changing stored canonical values
- cleaned the remaining mixed-language UI surfaces in signals, sources, and mock fallback data
- shifted the operator UI away from the original dark palette into a lighter warm-paper theme to reduce visual fatigue during long review sessions
- softened the global background, card surfaces, pills, and input controls while preserving the existing workflow structure
- updated the Today workbench, candidate pool, research page, draft page, and signal feed controls to use darker text on lighter surfaces for clearer hierarchy
- added the first real source-expansion batch into Supabase instead of relying on the original three-source seed
- expanded the source set with Reuters RSS, TechCrunch RSS, SEC Press RSS, BIS feeds, ECB feeds, and manual high-value websites including FT and The Information
- established a first-pass split between auto-ingest RSS sources and high-value manual URL sources for deeper reporting
- fixed a production-facing data-boundary issue where statically built pages could fall back to mock signals while runtime review APIs were writing against the real Supabase database
- forced the main operator pages to render dynamically and stopped returning mock signals or sources when a real database is configured but temporarily unreachable
- added pre-write signal existence checks to single and bulk review APIs so stale or invalid signal ids now fail with explicit Chinese errors instead of raw Prisma foreign-key failures
- tightened several overly light secondary text surfaces in the signal feed and editor forms to improve scan readability
- added the first Creator OS foundation schema wave: `CreatorProfile`, `Direction`, `Topic`, `TopicCandidate`, and `ProfileUpdateSuggestion`
- generated and stored the corresponding Phase 1 migration SQL and synced the active database schema to the new models
- introduced a working `IP 提炼` page and `创作者画像` page with live API handlers for extracting and editing a creator profile
- added a minimal creator-profile extraction service with LLM-first and fallback behavior so Phase 1 can start from identity before directions and topics
- added the first working `方向台` page together with direction-generation APIs and data helpers
- introduced a minimal direction-generation loop that derives 2-to-4-week strategic directions from the active creator profile plus current signals
- added a creator-profile-aware navigation path so the system now has visible entry points for `IP 提炼`, `创作者画像`, and `方向台`
- added the first working `主题台` page and a persistent `Topic` generation loop on top of the new Phase 1 models
- started mapping signal-level observation clusters into product-facing topics instead of leaving them as scoring metadata only
- attached generated topics to the current directions layer and grouped the Topic Desk by direction so topics become durable strategic lines rather than loose clusters
- introduced topic-generation APIs and a refresh action that archives older active topics and rebuilds current ones from the active creator profile, directions, and live signals
- updated the Today workbench to surface rising topics as `主题线` and link operators into the new Topic Desk instead of treating observation clusters as the only organizational frame
- upgraded `/candidates` from a raw candidate bucket into the first working `选题台`
- activated the existing `TopicCandidate` model with real generation logic, persistence, and API routes
- added recommendation generation that turns active topics into concrete topic suggestions with `why now`, `why you`, priority, and format recommendation
- introduced explicit topic-decision actions (`保留 / 延后 / 忽略`) so the platform now records recommendation-level feedback instead of only signal-level review feedback
- renamed the main navigation language from `候选池` toward `选题台` while preserving the existing route so the product can evolve without breaking links
- added the first working `进化建议` page and corresponding profile-update suggestion APIs
- started generating explicit creator-profile evolution suggestions from review calibration, topic recommendation decisions, directions, and topic accumulation
- implemented a confirm/reject workflow where AI suggestions remain explicit until the creator accepts them
- wired accepted suggestions back into `CreatorProfile` for the first three mapped fields: core themes, content boundaries, and current stage
- completed the first full Phase 1 identity loop: `画像 -> 方向 -> 主题 -> 选题 -> 进化建议`
- refactored `/` into a true `Profile-aware Today` dashboard instead of a generic editorial summary page
- made Today lead with creator identity, active directions, rising topics, best topic recommendations, and pending evolution suggestions before dropping into signal-level execution
- introduced a dedicated Today composition layer so the home workspace now aggregates `CreatorProfile`, `Direction`, `Topic`, `TopicCandidate`, `ProfileUpdateSuggestion`, signals, and downstream draft state in one place
- repositioned signals and output as execution-layer modules under the strategy layer, completing the first full creator-operating-system homepage flow
- introduced a first explicit `lib/services` capability layer to start separating platform logic from route handlers
- extracted creator-profile activation, profile updates, direction generation, topic generation, topic-candidate generation, and profile-evolution workflows into reusable service modules
- thinned the main Creator OS API routes so they now focus on request parsing and HTTP response mapping instead of owning orchestration
- added a shared `ServiceError` pattern so service-layer validation failures can surface as cleaner business-level HTTP responses
- verified that the service-layer extraction builds successfully without breaking the current Phase 1 Web runtime
- added a shared `lib/domain/contracts.ts` layer for the main Creator OS endpoints
- normalized profile, direction, topic, topic-candidate, and profile-update API payloads around a consistent `ok / data / error` contract shape
- updated the current web client buttons and editors to consume the typed response contracts instead of route-specific ad hoc fields
- verified that the contract normalization still builds cleanly on top of the new service-layer extraction
- defined the first mini-program channel boundary as a light-action adapter instead of a second full workspace
- added a mini-program action catalog for today summary, directions, topic recommendations, profile-update responses, and quick-note capture
- mapped the first mini-program action set directly onto existing service-layer capabilities to avoid creating mobile-specific business logic
- documented the mini-program scope as `Web-primary, mobile-lightweight`, with heavy research and editing still reserved for the main web workbench
- defined the first OpenClaw integration boundary as an agentic channel rather than a replacement runtime
- added an OpenClaw tool catalog for `extract_ip_profile`, `generate_directions`, `generate_topics`, `generate_topic_candidates`, and `generate_profile_updates`
- documented the intended `main agent -> temporary sub-agent -> core platform state` flow so future OpenClaw work can plug into Creator OS without reshaping the core data model
- kept Web as the primary runtime while reserving OpenClaw for deeper conversational workflows, orchestration, reminders, and future skill-aware execution

## MVP Status

The MVP is now past the design/prototype stage and has entered a usable operator-workbench stage.

Current status by area:

- `Signal ingestion`: working
  RSS ingestion, manual URL ingestion, and manual signal creation all exist and write into the real database.

- `AI first-pass scoring`: working
  Signals can be scored through a live LLM path (`gpt-5.2`) with heuristic fallback. The current scoring model now distinguishes importance, viewpoint potential, consensus strength, company-routine noise, and priority recommendation.

- `Editorial review flow`: working
  Signals can move through `NEW -> CANDIDATE / DEFERRED / IGNORED`, with bulk queue actions available in the feed.

- `Human feedback capture`: implemented, needs routine usage validation
  AI scores are preserved. Human overrides are stored separately in `HumanReview`, including structured corrections for importance, viewpoint, consensus, routine-noise, and priority.

- `Candidate -> research -> drafts`: working
  Candidate signals can generate research cards, research cards can be edited, and drafts can be generated and edited in the real database flow.

- `Calibration / learning surface`: working at a first-pass level
  `/reviews` now exposes AI-vs-human deltas and operator notes, which is enough to begin collecting training signals for later learning loops.

- `Clustering / deeper intelligence`: partial
  Cluster creation exists as a minimal fallback during research-card creation, but there is not yet a strong automatic event-clustering system.

- `Operational validation`: mostly complete, with one local caveat
  Production builds pass. Real DB-backed ingestion and scoring have been verified. The remaining caveat is that some localhost POST validations from the current terminal environment are noisy/intermittent, so browser-side validation remains the more reliable way to confirm certain write flows.

Overall MVP assessment:

- `Architecture`: stable enough for continued iteration
- `Main workflow`: complete enough to run real editorial trials
- `Scoring logic`: strong enough to test in real use, but not yet calibrated by enough human feedback
- `Learning loop`: started, but not yet summarized or trained against at scale
- `Automation maturity`: early-stage
